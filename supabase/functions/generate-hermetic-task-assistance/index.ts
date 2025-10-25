import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { systemPrompt, taskTitle, helpType, hermeticContext, taskContext } = await req.json();
    
    console.log('🎯 HERMETIC ASSISTANCE: Request received', {
      taskTitle,
      helpType,
      hasHermeticContext: !!hermeticContext,
      strengthsCount: hermeticContext?.strengths?.cognitiveEdge?.length,
      shadowPatternsCount: hermeticContext?.shadowSide?.avoidancePatterns?.length,
      currentEnergy: hermeticContext?.timing?.currentEnergyWindow
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Help me with: ${taskTitle}\n\nContext: ${JSON.stringify(taskContext)}` 
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

    if (!response.ok) {
      console.error("❌ HERMETIC ASSISTANCE: AI API error", response.status);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error text:", errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const assistanceData = JSON.parse(toolCall.function.arguments);
    
    console.log('✅ HERMETIC ASSISTANCE: Response generated', {
      steps: assistanceData.actionableSteps?.length,
      hasShadowWarning: !!assistanceData.shadowWarning,
      hasRecoveryTip: !!assistanceData.recoveryTip
    });

    return new Response(JSON.stringify(assistanceData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ HERMETIC ASSISTANCE: Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        fallback: true
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
