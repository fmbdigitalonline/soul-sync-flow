import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BASE_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function deriveCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  return {
    ...BASE_CORS_HEADERS,
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
  };
}

type AssistanceHelpType = 'stuck' | 'need_details' | 'how_to' | 'examples';
type AssistanceResponseHelpType = 'concrete_steps' | 'examples' | 'tools_needed' | 'time_breakdown';

interface AssistancePayload {
  helpType: AssistanceResponseHelpType;
  content: string;
  actionableSteps: string[];
  toolsNeeded: string[];
  timeEstimate?: string;
  successCriteria: string[];
  shadowWarning?: string;
  recoveryTip?: string;
}

interface BuildFallbackParams {
  taskTitle: string;
  helpType: AssistanceHelpType;
  hermeticContext?: any;
  taskContext?: any;
}

const RESPONSE_HELP_TYPES = new Set<AssistanceResponseHelpType>([
  'concrete_steps',
  'examples',
  'tools_needed',
  'time_breakdown'
]);

function isResponseHelpType(value: unknown): value is AssistanceResponseHelpType {
  return typeof value === 'string' && RESPONSE_HELP_TYPES.has(value as AssistanceResponseHelpType);
}

function respondWithAssistance(
  payload: AssistancePayload,
  options?: { fallbackReason?: string },
  corsHeaders: Record<string, string> = BASE_CORS_HEADERS,
) {
  const body = options?.fallbackReason
    ? { ...payload, fallback: true, fallbackReason: options.fallbackReason }
    : payload;

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildFallbackAssistance(params: BuildFallbackParams): AssistancePayload {
  const title = params.taskTitle || 'this task';
  const description = firstString(
    params.taskContext?.instruction?.description,
    params.taskContext?.description
  );
  const snippet = summarizeDescription(description);
  const timeEstimate = ensureTimeEstimate(
    firstString(
      params.taskContext?.instruction?.timeEstimate,
      params.taskContext?.timeEstimate,
      params.taskContext?.instruction?.metadata?.timeEstimate
    )
  ) || (params.helpType === 'examples' ? '15 minutes' : '10-15 minutes');
  const burstMinutes = deriveBurstDuration(timeEstimate);
  const tools = collectTools(params.taskContext, params.helpType);
  const primaryTool = determinePrimaryTool(tools);
  const writingTool = primaryTool.toLowerCase() === 'browser' ? 'a notes doc' : primaryTool;
  const fallbackHelpType: AssistanceResponseHelpType = params.helpType === 'examples' ? 'examples' : 'concrete_steps';

  const steps: string[] = [];
  const successCriteria: string[] = [];

  switch (params.helpType) {
    case 'stuck':
      steps.push(
        `Set a ${burstMinutes}-minute timer and brain-dump every blocker you feel about "${title}" into ${writingTool}.`,
        `Underline one blocker you can influence today and rewrite it as a question you can solve in ${writingTool}.`,
        `Spend ${Math.max(5, burstMinutes - 2)} minutes acting on that question—capture the micro-deliverable you'll complete next.`
      );
      successCriteria.push(
        'Blocker is written as a solvable statement.',
        `You have a micro-deliverable that fits inside a ${burstMinutes}-minute burst.`,
        'Next work block is scheduled or already started.'
      );
      break;
    case 'need_details':
      steps.push(
        `Open ${writingTool} and restate the outcome for "${title}" in two sentences${snippet ? ` focusing on "${snippet}"` : ''}.`,
        `Break the outcome into three micro-deliverables and assign each a ${burstMinutes}-minute window.`,
        'List the resources or approvals needed for the first deliverable and schedule them immediately.'
      );
      successCriteria.push(
        'Outcome is described in two concise sentences.',
        'Checklist shows at least three micro-deliverables with time boxes.',
        'First deliverable has the resources or approvals lined up.'
      );
      break;
    case 'how_to':
      steps.push(
        `Open ${writingTool} and create a checklist for "${title}" with the headings Prepare, Build, and Review.`,
        `Under each heading, jot the exact artifact or data you'll touch${snippet ? `—keep "${snippet}" in view` : ''}.`,
        `Start the Prepare step now and work for ${burstMinutes} minutes; capture the next action you'll take when you return.`
      );
      successCriteria.push(
        'Checklist lists concrete actions under Prepare, Build, and Review.',
        'First action has been started or time-boxed.',
        'You know what the hand-off to the next step looks like.'
      );
      break;
    case 'examples':
      steps.push(
        `Spend ${Math.max(5, burstMinutes)} minutes finding two real examples related to "${title}" using ${primaryTool.toLowerCase() === 'browser' ? 'your browser' : primaryTool}.`,
        `Capture the patterns you notice in ${writingTool}, focusing on structure, tone, and deliverables${snippet ? ` that match "${snippet}"` : ''}.`,
        'Choose one pattern to adapt and jot the first sentence or outline you will reuse.'
      );
      successCriteria.push(
        'Saved links or screenshots of at least two examples.',
        'Recorded three transferable patterns from those references.',
        'Picked one approach to adapt for your task.'
      );
      break;
  }

  const strengthDescriptor = firstString(
    params.hermeticContext?.strengths?.executionStyle,
    params.hermeticContext?.strengths?.cognitiveEdge?.[0]
  );
  const energyWindow = firstString(params.hermeticContext?.timing?.currentEnergyWindow);
  const motivationalVerb = firstString(params.hermeticContext?.communication?.motivationalLanguage?.[0]);

  let content = params.hermeticContext
    ? `Let's lean on ${strengthDescriptor || 'your natural strengths'} to move "${title}" forward.`
    : `Here's a grounded plan to move "${title}" forward.`;

  if (energyWindow) {
    content += ` Stay within your ${energyWindow.toLowerCase()} energy window.`;
  }

  if (motivationalVerb) {
    content += ` Keep it ${motivationalVerb.toLowerCase()} and tangible.`;
  }

  if (snippet) {
    content += ` Focus on the part that says "${snippet}".`;
  }

  const shadowWarningSource = firstString(
    params.hermeticContext?.shadowSide?.avoidancePatterns?.[0],
    params.hermeticContext?.shadowSide?.energyRisks?.[0],
    params.hermeticContext?.shadowSide?.stressTriggers?.[0]
  );
  const recoverySource = firstString(
    params.hermeticContext?.recovery?.bounceBackRituals?.[0],
    params.hermeticContext?.recovery?.healingModalities?.[0]
  );

  return {
    helpType: fallbackHelpType,
    content: content.trim(),
    actionableSteps: steps,
    toolsNeeded: tools,
    timeEstimate,
    successCriteria,
    ...(shadowWarningSource ? { shadowWarning: `Watch for ${shadowWarningSource} showing up—pause after step 2 and reset before continuing.` } : {}),
    ...(recoverySource ? { recoveryTip: `If things tighten, spend two minutes on ${recoverySource} before you resume step 3.` } : {})
  };
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function ensureTimeEstimate(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^\d+$/.test(trimmed)) {
    return `${trimmed} minutes`;
  }

  return trimmed;
}

function deriveBurstDuration(timeEstimate?: string): number {
  if (!timeEstimate) {
    return 7;
  }

  const matches = timeEstimate.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return 7;
  }

  let minutes = parseInt(matches[0], 10);
  if (/hour/i.test(timeEstimate)) {
    minutes *= 60;
  }

  const burst = Math.round(minutes / 3);
  return Math.min(15, Math.max(5, burst || 7));
}

function summarizeDescription(description?: string): string | undefined {
  if (!description) return undefined;
  const condensed = description.replace(/\s+/g, ' ').trim();
  if (!condensed) return undefined;
  if (condensed.length <= 140) return condensed;
  return `${condensed.slice(0, 137).trimEnd()}…`;
}

function collectTools(taskContext: any, helpType: AssistanceHelpType): string[] {
  const toolSet = new Set<string>();
  const pushValue = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        toolSet.add(trimmed);
      }
      return;
    }
    if (typeof value === 'object') {
      const candidate = firstString(
        (value as Record<string, unknown>).name,
        (value as Record<string, unknown>).tool,
        (value as Record<string, unknown>).label
      );
      if (candidate) {
        toolSet.add(candidate);
      }
    }
  };

  pushValue(taskContext?.toolsNeeded);
  pushValue(taskContext?.instruction?.toolsNeeded);
  pushValue(taskContext?.instruction?.metadata?.tools);

  if (toolSet.size === 0) {
    if (helpType === 'examples') {
      toolSet.add('Browser');
      toolSet.add('Notes doc');
    } else {
      toolSet.add('Notes doc');
    }
  }

  toolSet.add('Timer');
  return Array.from(toolSet);
}

function determinePrimaryTool(tools: string[]): string {
  for (const tool of tools) {
    if (tool.toLowerCase() !== 'timer') {
      return tool;
    }
  }
  return tools[0] || 'Notes doc';
}

serve(async (req) => {
  const corsHeaders = deriveCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  let safeTitle = 'this task';
  let normalizedHelpType: AssistanceHelpType = 'stuck';
  let hermeticContext: any = undefined;
  let taskContext: any = undefined;
  let fallbackPayload: AssistancePayload | null = null;

  try {
    const payload = await req.json();
    const rawTitle = typeof payload?.taskTitle === 'string' ? payload.taskTitle : '';
    safeTitle = rawTitle.trim() || 'this task';
    const rawHelpType = typeof payload?.helpType === 'string' ? payload.helpType : 'stuck';
    normalizedHelpType = ['stuck', 'need_details', 'how_to', 'examples'].includes(rawHelpType)
      ? rawHelpType as AssistanceHelpType
      : 'stuck';
    hermeticContext = (payload?.hermeticContext && typeof payload.hermeticContext === 'object')
      ? payload.hermeticContext
      : undefined;
    taskContext = (payload?.taskContext && typeof payload.taskContext === 'object')
      ? payload.taskContext
      : undefined;
    const language = typeof payload?.language === 'string' ? payload.language : 'en';
    
    const languageInstruction = language === 'nl' 
      ? '\n\nIMPORTANT: Respond in Dutch (Nederlands). All content, steps, and criteria must be in Dutch.'
      : language === 'en'
        ? '\n\nIMPORTANT: Respond in English.'
        : `\n\nIMPORTANT: Respond in language code: ${language}`;
    
    const systemPrompt = typeof payload?.systemPrompt === 'string' && payload.systemPrompt.trim().length > 0
      ? payload.systemPrompt + languageInstruction
      : "You are SoulSync's structured task assistant. Provide concrete, time-bound micro-steps." + languageInstruction;

    fallbackPayload = buildFallbackAssistance({
      taskTitle: safeTitle,
      helpType: normalizedHelpType,
      hermeticContext,
      taskContext,
    });

    const respondFallback = (reason: string) => {
      console.warn('⚠️ HERMETIC ASSISTANCE: Using deterministic fallback', {
        reason,
        taskTitle: safeTitle,
        helpType: normalizedHelpType,
        hasHermeticContext: !!hermeticContext,
      });
      const clone: AssistancePayload = {
        ...fallbackPayload!,
        actionableSteps: [...fallbackPayload!.actionableSteps],
        toolsNeeded: [...fallbackPayload!.toolsNeeded],
        successCriteria: [...fallbackPayload!.successCriteria],
      };
      return respondWithAssistance(clone, { fallbackReason: reason }, corsHeaders);
    };

    console.log('🎯 HERMETIC ASSISTANCE: Request received', {
      taskTitle: safeTitle,
      helpType: normalizedHelpType,
      hasHermeticContext: !!hermeticContext,
      strengthsCount: hermeticContext?.strengths?.cognitiveEdge?.length,
      shadowPatternsCount: hermeticContext?.shadowSide?.avoidancePatterns?.length,
      currentEnergy: hermeticContext?.timing?.currentEnergyWindow,
      language: payload?.language || 'en'
    });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return respondFallback('missing_openai_api_key');
    }

    const serializedContext = JSON.stringify(taskContext ?? {});

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini-2025-04-14",
          max_completion_tokens: 2000,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Help me with: ${safeTitle}\n\nContext: ${serializedContext}`
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_hermetic_task_assistance",
                description: "Provide deeply personalized task assistance leveraging user's strengths and mitigating shadow patterns",
                parameters: {
                  type: "object",
                  properties: {
                    content: {
                      type: "string",
                      description: "Opening message that acknowledges their strengths and energy state"
                    },
                    actionableSteps: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 micro-steps (2-5 min each) tailored to their execution style"
                    },
                    toolsNeeded: {
                      type: "array",
                      items: { type: "string" },
                      description: "Specific tools required for the task"
                    },
                    timeEstimate: {
                      type: "string",
                      description: "Total estimated time to complete"
                    },
                    successCriteria: {
                      type: "array",
                      items: { type: "string" },
                      description: "Measurable criteria to know they're done"
                    },
                    shadowWarning: {
                      type: "string",
                      description: "Warning about specific avoidance pattern that might emerge (optional)"
                    },
                    recoveryTip: {
                      type: "string",
                      description: "How to recover if this triggers stress (optional)"
                    }
                  },
                  required: ["content", "actionableSteps", "toolsNeeded", "successCriteria"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: {
            type: "function",
            function: { name: "provide_hermetic_task_assistance" }
          }
        }),
      });
    } catch (error) {
      console.error('❌ HERMETIC ASSISTANCE: OpenAI fetch failed', error);
      return respondFallback('openai_fetch_failed');
    }

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (_) {
        // ignore parsing error
      }

      console.error('❌ HERMETIC ASSISTANCE: AI API error', response.status, errorText);

      const reason = response.status === 429
        ? 'openai_rate_limited'
        : response.status === 402
          ? 'openai_payment_required'
          : `openai_status_${response.status}`;

      return respondFallback(reason);
    }

    let result: any;
    try {
      result = await response.json();
    } catch (error) {
      console.error('❌ HERMETIC ASSISTANCE: Failed to parse AI response', error);
      return respondFallback('invalid_openai_response');
    }

    const toolCall = result?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('❌ HERMETIC ASSISTANCE: Missing tool call in AI response', result);
      return respondFallback('missing_tool_call');
    }

    let assistanceData: any;
    try {
      assistanceData = JSON.parse(toolCall.function.arguments);
    } catch (error) {
      console.error('❌ HERMETIC ASSISTANCE: Failed to parse tool payload', error);
      return respondFallback('invalid_tool_payload');
    }

    console.log('✅ HERMETIC ASSISTANCE: Response generated', {
      steps: assistanceData.actionableSteps?.length,
      hasShadowWarning: !!assistanceData.shadowWarning,
      hasRecoveryTip: !!assistanceData.recoveryTip
    });

    const fallbackUsage = {
      content: !assistanceData.content,
      steps: !Array.isArray(assistanceData.actionableSteps) || assistanceData.actionableSteps.length === 0,
      tools: !Array.isArray(assistanceData.toolsNeeded) || assistanceData.toolsNeeded.length === 0,
      criteria: !Array.isArray(assistanceData.successCriteria) || assistanceData.successCriteria.length === 0,
      time: !assistanceData.timeEstimate,
      warnings: !assistanceData.shadowWarning && !!fallbackPayload?.shadowWarning,
      recovery: !assistanceData.recoveryTip && !!fallbackPayload?.recoveryTip
    };

    if (Object.values(fallbackUsage).some(Boolean)) {
      console.warn('⚠️ HERMETIC ASSISTANCE: AI response missing fields, supplementing with deterministic defaults', fallbackUsage);
    }

    const normalizedAssistance: AssistancePayload = {
      helpType: isResponseHelpType(assistanceData.helpType)
        ? assistanceData.helpType
        : (normalizedHelpType === 'examples' ? 'examples' : 'concrete_steps'),
      content: assistanceData.content || fallbackPayload!.content,
      actionableSteps: Array.isArray(assistanceData.actionableSteps) && assistanceData.actionableSteps.length > 0
        ? assistanceData.actionableSteps
        : [...fallbackPayload!.actionableSteps],
      toolsNeeded: Array.isArray(assistanceData.toolsNeeded) && assistanceData.toolsNeeded.length > 0
        ? assistanceData.toolsNeeded
        : [...fallbackPayload!.toolsNeeded],
      timeEstimate: assistanceData.timeEstimate || fallbackPayload!.timeEstimate,
      successCriteria: Array.isArray(assistanceData.successCriteria) && assistanceData.successCriteria.length > 0
        ? assistanceData.successCriteria
        : [...fallbackPayload!.successCriteria],
      ...(assistanceData.shadowWarning || fallbackPayload?.shadowWarning ? { shadowWarning: assistanceData.shadowWarning || fallbackPayload?.shadowWarning } : {}),
      ...(assistanceData.recoveryTip || fallbackPayload?.recoveryTip ? { recoveryTip: assistanceData.recoveryTip || fallbackPayload?.recoveryTip } : {})
    };

    return respondWithAssistance(normalizedAssistance, undefined, corsHeaders);
  } catch (error) {
    console.error('❌ HERMETIC ASSISTANCE: Unexpected error handling request', error);
    const safeFallback = fallbackPayload ?? buildFallbackAssistance({
      taskTitle: safeTitle,
      helpType: normalizedHelpType,
      hermeticContext,
      taskContext,
    });
    const clone: AssistancePayload = {
      ...safeFallback,
      actionableSteps: [...safeFallback.actionableSteps],
      toolsNeeded: [...safeFallback.toolsNeeded],
      successCriteria: [...safeFallback.successCriteria],
    };
    return respondWithAssistance(clone, { fallbackReason: 'unhandled_exception' }, corsHeaders);
  }
});
