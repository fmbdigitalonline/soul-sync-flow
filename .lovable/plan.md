# Verifieer of de tweetalige fase-detectie echt live draait

## Wat de data laat zien over deze sessie

De getoonde conversatie is sessie `34f07d68-...338c`, turns van 4 aug 20:11-20:14 (43 berichten in `conversation_memory`, laatste update 20:14:13).

Pijplijn per turn (in `companion-oracle-conversation`):
1. Client stuurt bericht -> `ConversationPhaseTracker.detectState(message, history)` (regel 78).
2. Detectie levert cluster / sub_state / confidence / signalen / `openingRule`.
3. Rij wordt weggeschreven naar `conversation_state_tracking` (regels 117-132).
4. `openingRule` + `getPhaseGuidance` gaan het systeemprompt in als "CRITICAL OPENING INSTRUCTION" (regels 1982-2074), plus de anti-herhalingscheck (2324-2338).
5. Blueprint/HSI-spine en geheugen worden erbij geladen, het model genereert het antwoord, en bericht + antwoord gaan terug naar `conversation_memory` / `hacs_conversations`.

Wat er in de rijen staat voor deze turns:

```text
20:11:06  engagement / greeting            conf 0.33  patterns 1
20:11:40  decision  / option_weighing      conf 0.30  ALLE signalen 0
20:12:54  decision  / option_weighing      conf 0.30  ALLE signalen 0
20:14:06  clarification / example_request  conf 0.67  patterns 1
```

Twee turns met confidence 0.30 en nul signalen in elke categorie zijn de turn-count fallback: er matchte geen enkel patroon. "ok ik snap het" hoort `reflection / learning_statement` op te leveren (dat patroon staat op regel 118 van de tracker en slaagt in de unit tests), en "klinkt als veel werk..." hoort `frustration / venting` te geven. In productie gebeurde dat niet.

Onbevestigd, en daarom stap 1: of de gedeployde bundel op dat moment al de tweetalige tracker bevatte, of dat de deploy de `_shared`-wijziging niet heeft meegenomen. Er zijn geen rijen na 4 aug 20:14, dus na de fix is er nog niet opnieuw getest.

## Stappen

1. Redeploy `companion-oracle-conversation` zodat de huidige `_shared/conversation-phase-tracker.ts` zeker in de bundel zit.
2. Replay-check: stuur de vier Nederlandse zinnen uit deze sessie opnieuw door de functie (nieuwe sessie-id) en lees daarna de nieuwe rijen in `conversation_state_tracking`.
3. Acceptatie: "ok ik snap het" -> `reflection/learning_statement`; "ik ben terug getrokken, hoe vind het mij" -> `exploration` of `clarification` met minstens 1 signaal; "klinkt als veel werk..." -> `frustration/venting`. Geen enkele turn met confidence 0.30 en nul signalen.
4. Blijft een turn alsnog leeg: de instrumentatie-log op regel 442 van de tracker uitlezen om te zien welk patroon ontbreekt, en dat patroon toevoegen (alleen de tracker, geen promptlogica).

## Technisch

- Alleen leesqueries plus een redeploy; geen schemawijziging.
- Als patronen ontbreken: uitsluitend `supabase/functions/_shared/conversation-phase-tracker.ts` uitbreiden, met een testcase in `src/services/__tests__/conversation-phase-tracker.test.ts`.