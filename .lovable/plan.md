# Volgende stap: gespreksgeheugen herstellen (bug 1 + 2)

## Waar we staan (constitutie gelezen en geregistreerd)

- **SOULSYNC_CONSTITUTION.md = v3.12** — de productwet (Living Blueprint v3.11, één verteller/Twin v3.10, app verklaart zichzelf niet v3.9). Governance van de implementatie is afgesplitst naar **SOULSYNC_RUNTIME_CONSTITUTION.md (v2)** — vier wetten: één jurisdictie, één canonieke eigenaar, vervanging rondt af, elke opgeslagen state heeft een canonieke lezer.
- **Laatste sessie (12 sep):** mijlpalen-generatie hersteld — het model at zijn hele antwoordruimte op aan intern nadenken; nu server-side budget (16.000), expliciet `reasoning_effort: none`, eigen JSON-instructie i.p.v. de weigerende guide-persoonlijkheid, en een duidelijke "plan te groot"-melding bij afkapping. Gedeployed en getest.
- **Roadmap:** Phase 0 opgenomen, Phase 1 (reflex & hands) SHIPPED, **Phase 2 (rails & working loop) is lopend**. De OfferCard-deal is inmiddels vervangen door zin-selectie + werkruimtepaneel (bug 15, vervallen).

## Openstaand uit het bugregister (§B Runtime Constitution)

1. **Gespreksgeheugen (SERIEUS, root-caused):** schrijver laat `mode` weg → rijen krijgen standaard `'guide'`; de oracle filtert op `mode='companion'` en mist dus elke beurt; de client stuurt lege geschiedenis.
2. **`conversation_state_tracking` RLS: insert mislukt elke beurt.**
4. Getaldrift in Twin-spraak ("3 jaar" → "5-year").
13. HSI-kolomnamen driften (code schrijft `interpersonal_compatibility`, DB heeft `compatibility` → twee dimensies vallen stilletjes weg).
14. Kaarten verdwijnen bij herladen (geen opgeslagen attachments-kolom).
16. `search-similar-messages` kapot (ongeldige vector-syntax): embeddings worden elke beurt geschreven maar nooit gelezen.

## Voorgestelde volgende blok: bug 1 + 2

Het geheugen is de fundering waar alles op leunt — zonder werkende thread-memory heeft de Twin geen verleden. Beide bugs zijn root-caused en klein in scope.

1. **Verifieer eerst:** controleer of de schrijver (`store-conversation-message` / client) `mode` nu echt weglaat, en of de RLS-insert op `conversation_state_tracking` nog steeds faalt (register is van half juli; deel is mogelijk al gefixt).
2. **Schrijfkant:** `mode` altijd meeschrijven bij elke opgeslagen beurt (companion/guide/dream/growth).
3. **Leeskant:** oracle STEP 1/2 mag alleen op mode filteren als de schrijfkant gedicht is; anders fail-soft op recency.
4. **RLS:** ontbrekend INSERT-beleid op `conversation_state_tracking` toevoegen (authenticated, eigen user).
5. **Client:** `getProgressiveIntelligentContext`-stub onderzoeken — als die leeg blijft, stuurt de client nooit geschiedenis mee.
6. **Test vooraf (grondwaarheid):** stuur 3 beurten in Companion → query `conversation_memory` voor die user: elke rij moet `mode='companion'` hebben en een nieuwe beurt moet in de prompt van beurt 4 terugkomen. `conversation_state_tracking` moet per beurt een rij krijgen, geen fout.

Daarna zijn de logische vervolgen bug 13 (klein) en bug 14 (kaart-persistentie, groter).

## Technisch

- Aan te raken: `supabase/functions/store-conversation-message/`, `supabase/functions/companion-oracle-conversation/`, client-side context-hook, 1 migratie voor het RLS-beleid.
- Regels van de Runtime Constitution gelden: één eigenaar per gedrag, vervanging rondt af, geen nieuwe subsystemen.
- Verificatie via productie-query's + een live Companion-sessie, niet alleen logs.
