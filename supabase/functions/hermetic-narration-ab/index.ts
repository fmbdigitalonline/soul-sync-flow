// hermetic-narration-ab — one-shot comparison harness. READ-ONLY.
//
// Answers one question and nothing else: can the Twin narrate a report section
// as well from structured findings as an analyst narrates it from the raw
// blueprint?
//
//   A  the prose that exists today, read back untouched
//   B  the same agent asked for FINDINGS instead of prose
//   C  the Twin narrating that section from B alone
//
// Why this shape. The pipeline today has an analyst hold the blueprint, write
// 700-1500 words, and then a second function read that prose back to recover
// the structure the analyst already had. That round trip is lossy — it is the
// most likely source of the scalar error strings in
// hermetic_structured_intelligence — and it puts the narrator's voice inside
// the specialist, which is what "Experts discover. The Twin speaks" (v3.10)
// forbids everywhere else.
//
// This function writes NOTHING. No personality_reports, no HSI, no jobs. It
// returns the three artifacts so they can be read side by side, and the
// decision about the pipeline is taken from that reading, not from this code.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { callChatCompletion } from '../_shared/azure-openai.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'gpt-4.1-mini-2025-04-14';

/** B — the analyst as investigator. Structure out, no prose, no narration. */
function findingsPrompt(agent: string, dimensionLabel: string): string {
  return [
    `You are the ${dimensionLabel} analyst.`,
    '',
    'Your job is NOT to write for the user. You never address them, never narrate,',
    'never produce prose. You investigate and report findings to another system.',
    '',
    'Return ONLY valid JSON — no markdown fences, no commentary — in this shape:',
    '{',
    '  "findings": [',
    '    {',
    '      "pattern": "one observable behaviour, decision or tension, stated in plain language a person would recognise in themselves",',
    '      "evidence": ["which blueprint facets support this, named as data"],',
    '      "consequence": "what this costs or gains them in ordinary life",',
    '      "confidence": 0.0,',
    '      "provenance": "the framework lens that surfaced it"',
    '    }',
    '  ],',
    '  "tensions": [{ "between": ["a", "b"], "what_it_produces": "" }],',
    '  "distinctive": "the one thing here that would NOT be true of most people"',
    '}',
    '',
    'Rules:',
    '- 4 to 7 findings. Fewer, sharper beats many, vague.',
    '- `pattern` must be behaviour, not identity. "Starts more than they finish"',
    '  is a pattern. "Is an Aquarian innovator" is not — that is a label.',
    '- Never put a framework term in `pattern` or `consequence`. Framework terms',
    '  belong in `provenance` and `evidence` only.',
    '- Synthesise across the WHOLE blueprint. Do not let one framework carry the',
    '  explanation when several facets bear on it.',
    '- `distinctive` is the honesty check: if you cannot name something that would',
    '  not apply to most people, say so plainly rather than inventing one.',
    '- confidence is yours, 0-1, and lower is allowed.',
  ].join('\n');
}

/** C — the Twin narrating the same section from findings alone. */
function narrationPrompt(dimensionLabel: string, userName: string, language: string): string {
  return [
    language && language !== 'en'
      ? `Write entirely in ${language}. Natural, fluent ${language} throughout.\n`
      : '',
    `You are ${userName}'s Twin — their reflective inner voice, not an expert`,
    'addressing a client. You are the only narrator this person ever hears,',
    'whichever specialist produced the underlying findings.',
    '',
    `Write the ${dimensionLabel} section of their report from the findings below.`,
    '',
    'How you write:',
    '- Lead with what they would recognise in their own behaviour. The reader',
    '  should meet themselves before they meet any framework.',
    '- A framework may appear as provenance AFTER the pattern is already clear',
    '  in ordinary language — never as the explanation itself. "You tend to see',
    '  the shape of a thing before others do, and it costs you the finish" comes',
    '  first; the lens that revealed it comes second, if at all.',
    '- Never reduce them to a label. Not "your Aquarian innovator", not "your',
    '  Projector energy", not "your Life Path 3". A person is not their chart.',
    '- Keep symbolic depth. Metaphor is welcome — but every metaphor resolves',
    '  into something recognisable or practical before the paragraph ends.',
    '- Name the tensions. Contradiction is the most useful thing in this material;',
    '  do not smooth it into encouragement.',
    '- Say only what the findings support. Where confidence is low, let the prose',
    '  be tentative rather than confident. You may say you are unsure.',
    '',
    'Length: comparable to a full report section — roughly 700-1000 words.',
  ].filter(Boolean).join('\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { userId, agent = 'mentalism_analyst', language = 'en' } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const dimensionLabel = agent.replace(/_analyst$/, '').replace(/_/g, ' ');

    // ── blueprint (same source the orchestrator uses) ──────────────────
    const { data: bp } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    const blueprint = bp?.blueprint;
    if (!blueprint) {
      return new Response(JSON.stringify({ error: 'no active blueprint for user' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userName = (blueprint as any)?.user_meta?.preferred_name
      || (blueprint as any)?.basic_info?.first_name || 'this person';

    // ── A: the prose that exists today. Read back, never rewritten. ────
    // Two places hold it. progress_data is the orchestrator's working copy and
    // is not guaranteed to survive; personality_reports is the durable copy the
    // app itself reads. Try the job first, fall back to the report, and say
    // which one answered — A means something different from each source.
    let existing: string | null = null;
    let existingSource: string | null = null;

    const { data: jobs } = await supabase
      .from('hermetic_processing_jobs')
      .select('progress_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    for (const j of jobs ?? []) {
      const sections = (j as any)?.progress_data?.hermetic_sections ?? [];
      const hit = sections.find((s: any) => s?.agent_type === agent);
      if (hit?.content) {
        existing = hit.content;
        existingSource = 'hermetic_processing_jobs.progress_data';
        break;
      }
    }

    if (!existing) {
      const { data: report } = await supabase
        .from('personality_reports')
        .select('report_content')
        .eq('user_id', userId)
        .eq('blueprint_version', '2.0')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const rc = (report as any)?.report_content;
      // The seven law analysts land under seven_laws_integration keyed by law;
      // the five translators under system_translations keyed *_hermetic.
      const candidate =
        rc?.seven_laws_integration?.[agent.replace(/_analyst$/, '')]
        ?? rc?.system_translations?.[agent.replace(/_hermetic_translator$/, '_hermetic')];
      if (typeof candidate === 'string' && candidate.trim()) {
        existing = candidate;
        existingSource = 'personality_reports.report_content';
      }
    }

    // ── B: the analyst as investigator ─────────────────────────────────
    const bResp = await callChatCompletion({
      messages: [
        { role: 'system', content: findingsPrompt(agent, dimensionLabel) },
        { role: 'user', content: `BLUEPRINT:\n${JSON.stringify(blueprint, null, 2)}` },
      ],
      model: MODEL,
      max_tokens: 1600,
    });
    const bText = await bResp.text();
    let findings: any = null;
    let findingsRaw = '';
    try {
      findingsRaw = JSON.parse(bText)?.choices?.[0]?.message?.content ?? '';
      const cleaned = findingsRaw.replace(/```(?:json)?/gi, '').trim();
      findings = JSON.parse(cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1));
    } catch (e) {
      console.warn('⚠️ AB: findings did not parse as JSON', e instanceof Error ? e.message : e);
    }

    // ── C: the Twin narrating from B alone. Nothing else is passed. ────
    let narration = '';
    if (findings) {
      const cResp = await callChatCompletion({
        messages: [
          { role: 'system', content: narrationPrompt(dimensionLabel, userName, language) },
          { role: 'user', content: `FINDINGS:\n${JSON.stringify(findings, null, 2)}` },
        ],
        model: MODEL,
        max_tokens: 1800,
      });
      narration = JSON.parse(await cResp.text())?.choices?.[0]?.message?.content ?? '';
    }

    // A crude, honest signal — not a verdict. Counts how often chart
    // vocabulary reaches the surface in each variant.
    const CHART = /\b(aquari\w*|taurus|aries|gemini|cancer|leo|virgo|libra|scorpio|sagittari\w*|capricorn|pisces|projector|generator|manifestor|reflector|enfp|intj|infp|infj|entj|isfp|esfp|isfj|esfj|istp|estp|intp|entp|istj|estj|life path|human design|mbti|hermetic|law of)\b/gi;
    const count = (t: string) => (t ? (t.match(CHART) || []).length : 0);
    const words = (t: string) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);

    return new Response(JSON.stringify({
      agent,
      userName,
      A_existing_prose: existing,
      A_source: existingSource,
      B_findings: findings,
      B_raw_if_unparsed: findings ? undefined : findingsRaw,
      C_twin_narration: narration,
      signals: {
        A: { words: words(existing ?? ''), chart_terms: count(existing ?? '') },
        C: { words: words(narration), chart_terms: count(narration) },
        note: 'chart_terms is a surface count, not a quality judgement. Read A against C.',
      },
      wrote_nothing: true,
    }, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('❌ AB harness failed:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
