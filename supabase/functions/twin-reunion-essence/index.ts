/**
 * twin-reunion-essence — one sentence describing what the previous
 * conversation was actually about.
 *
 * The reunion used to quote the user's last visible message verbatim, which
 * meant an opening of "Vorige keer verkenden we: 'Hi Liora'". This function
 * receives the already-filtered turns of the last substantive conversation and
 * returns a single short sentence — the essence, not a quote.
 *
 * No fallbacks: if the model call fails or returns nothing usable, the caller
 * gets an explicit failure and the reunion simply drops the line.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callChatCompletion } from "../_shared/azure-openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const MAX_TURNS = 12;
const MAX_TURN_CHARS = 600;
const MAX_SENTENCE_CHARS = 90;

function validate(body: any): { turns: Turn[]; language: "en" | "nl" } | { error: string } {
  if (!body || typeof body !== "object") return { error: "body must be an object" };
  const language = body.language === "nl" ? "nl" : body.language === "en" ? "en" : null;
  if (!language) return { error: "language must be 'en' or 'nl'" };
  if (!Array.isArray(body.turns) || body.turns.length === 0) {
    return { error: "turns must be a non-empty array" };
  }
  const turns: Turn[] = [];
  for (const t of body.turns.slice(-MAX_TURNS)) {
    if (!t || (t.role !== "user" && t.role !== "assistant")) {
      return { error: "each turn needs role 'user' or 'assistant'" };
    }
    if (typeof t.content !== "string" || !t.content.trim()) {
      return { error: "each turn needs non-empty string content" };
    }
    turns.push({ role: t.role, content: t.content.trim().slice(0, MAX_TURN_CHARS) });
  }
  if (!turns.some((t) => t.role === "user")) return { error: "turns must include a user message" };
  return { turns, language };
}

const INSTRUCTION: Record<"en" | "nl", string> = {
  en:
    "You summarise what a conversation was about in ONE short sentence (max 90 characters), " +
    "in English, in the second person ('you'). Name the actual subject or struggle. " +
    "No quotes, no greetings, no preamble, no trailing period beyond one. " +
    "Do not start with 'Last time'. Return only the sentence fragment describing the topic, " +
    "e.g. 'your doubt about leaving your job'.",
  nl:
    "Je vat in ÉÉN korte zin (max 90 tekens) samen waar een gesprek over ging, in het Nederlands, " +
    "in de je-vorm. Noem het echte onderwerp of de worsteling. Geen aanhalingstekens, geen begroeting, " +
    "geen inleiding. Begin niet met 'Vorige keer'. Geef alleen het onderwerpfragment terug, " +
    "bijvoorbeeld 'je twijfel over het opzeggen van je baan'.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth is validated in code (verify_jwt is off for Lovable-managed functions).
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "missing bearer token" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "invalid token" }, 401);

    const parsed = validate(await req.json().catch(() => null));
    if ("error" in parsed) return json({ error: parsed.error }, 400);
    const { turns, language } = parsed;

    const transcript = turns
      .map((t) => `${t.role === "user" ? "USER" : "TWIN"}: ${t.content}`)
      .join("\n");

    const res = await callChatCompletion({
      task: "classify",
      max_tokens: 200,
      messages: [
        { role: "system", content: INSTRUCTION[language] },
        { role: "user", content: transcript },
      ],
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("twin-reunion-essence: provider error", res.status, detail.slice(0, 400));
      return json({ error: "provider_error", status: res.status, detail: detail.slice(0, 400) }, 502);
    }

    const payload = await res.json();
    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || !raw.trim()) {
      console.error("twin-reunion-essence: empty completion", JSON.stringify(payload).slice(0, 400));
      return json({ error: "empty_completion" }, 502);
    }

    let essence = raw.replace(/\s+/g, " ").trim().replace(/^["'“”]|["'“”]$/g, "").replace(/\.$/, "");
    if (essence.length > MAX_SENTENCE_CHARS) {
      essence = `${essence.slice(0, MAX_SENTENCE_CHARS - 1).replace(/\s+\S*$/, "")}…`;
    }
    if (!essence) return json({ error: "empty_completion" }, 502);

    console.log(`twin-reunion-essence: ${language} · ${turns.length} turns → "${essence}"`);
    return json({ essence, language });
  } catch (e) {
    console.error("twin-reunion-essence: unhandled", e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
