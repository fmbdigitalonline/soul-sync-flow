import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createOpenAI } from 'npm:@ai-sdk/openai';
import { Output, streamText } from 'npm:ai';
import { z } from 'npm:zod';
import { assertActionCopyPayload, assertPrimaryActionCopyPayload } from './contract.ts';

const MODEL = 'openai/gpt-6-astra';
const ActionId = z.enum(['understand', 'change_pattern', 'achieve', 'remember']);
const ActionSchema = z.object({ action: ActionId, label: z.string().min(4).max(110), rank: z.number().int().min(1).max(4) });
const FullSchema = z.object({ question: z.string().min(4).max(120), actions: z.array(ActionSchema).length(4) });
const PrimarySchema = z.object({
  question: z.string().min(4).max(120),
  action: z.object({ action: ActionId, label: z.string().min(4).max(110), rank: z.literal(1) }),
});
const BodySchema = z.object({
  selectedSentence: z.string().trim().min(2).max(1200),
  context: z.array(z.string().trim().min(1).max(1600)).max(2),
  language: z.enum(['nl', 'en']),
  mode: z.enum(['primary', 'full']).default('full'),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function statusOf(error: unknown): number {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const value = Number((error as { statusCode?: unknown }).statusCode);
    if (Number.isInteger(value)) return value;
  }
  return 500;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const authorization = req.headers.get('Authorization');
    if (!supabaseUrl || !supabaseAnonKey || !apiKey) return json({ error: 'AI service is not configured.' }, 500);
    if (!authorization) return json({ error: 'Sign in is required.' }, 401);

    const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) return json({ error: 'Your session is no longer valid.' }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Invalid sentence-action request.', details: parsed.error.flatten().fieldErrors }, 400);
    const { selectedSentence, context, language, mode } = parsed.data;

    let capturedRunId = req.headers.get('X-Lovable-AIG-Run-ID');
    const runFetch: typeof fetch = async (input, init) => {
      const headers = new Headers(init?.headers);
      if (capturedRunId) headers.set('X-Lovable-AIG-Run-ID', capturedRunId);
      const response = await fetch(input, { ...init, headers });
      capturedRunId = response.headers.get('X-Lovable-AIG-Run-ID') ?? capturedRunId;
      return response;
    };
    const lovable = createOpenAI({
      baseURL: 'https://ai.gateway.lovable.dev/v1',
      apiKey,
      headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
      fetch: runFetch,
    });

    const routeMeaning = `The route IDs are fixed contracts:\n- understand: explore the meaning or emotional cause\n- change_pattern: transform a recurring pattern\n- achieve: turn the statement into a concrete next step or goal\n- remember: save the insight for later.`;
    const prompt = `Create ${mode === 'primary' ? 'the single most relevant' : 'four ranked'} next-best-action wording for a selected sentence.\nLanguage: ${language === 'nl' ? 'Dutch' : 'English'} only.\nSelected sentence: ${JSON.stringify(selectedSentence)}\nLast relevant conversation parts: ${JSON.stringify(context)}\n${routeMeaning}\nWrite natural first-person action labels that attach to the concrete meaning. Do not use vague stand-ins like "this", "dit" or "deze" without naming what they refer to. Do not expose software mechanisms. Keep each label concise. ${mode === 'full' ? 'Return every route exactly once and rank 1 through 4 by relevance.' : 'Choose one existing route and set rank to 1.'}`;

    console.info('🧭 NBA COPY REQUEST', { mode, language, contextParts: context.length });
    const result = streamText({
      model: lovable.responses(MODEL),
      output: Output.object({ schema: mode === 'primary' ? PrimarySchema : FullSchema }),
      prompt,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: 'low',
          reasoningSummary: 'auto',
          store: false,
          include: ['reasoning.encrypted_content'],
        },
      },
    });
    const output = await result.output;
    const payload = mode === 'primary' ? assertPrimaryActionCopyPayload(output) : assertActionCopyPayload(output);
    console.info('✅ NBA COPY GENERATED', { mode });
    const response = json(payload);
    if (capturedRunId) response.headers.set('X-Lovable-AIG-Run-ID', capturedRunId);
    return response;
  } catch (error) {
    const status = statusOf(error);
    const retryable = status === 429 || status >= 500;
    const message = error instanceof Error ? error.message : 'Could not formulate follow-up actions.';
    console.error('❌ NBA COPY ERROR', { status, retryable, message });
    return json({ error: message, retryable }, status);
  }
});