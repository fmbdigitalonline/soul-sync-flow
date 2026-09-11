# De openingszin citeert je begroeting, niet de essentie

## Waarom dit gebeurt

De "Vorige keer verkenden we"-regel is nu geen samenvatting. Hij pakt letterlijk het **laatste zichtbare bericht dat jij typte** in het meest recente gesprek, kort het af op 110 tekens en zet het tussen aanhalingstekens. Als jouw laatste bericht "Hi Liora" was, is dat wat er terugkomt. Er wordt niets gelezen van wat het gesprek werkelijk ging.

## Wat er verandert

De regel wordt gebaseerd op de essentie van het vorige gesprek in plaats van één citaat:

1. **Kies het juiste gesprek.** Sla gesprekken over die te kort of te dun zijn (bijv. minder dan twee inhoudelijke berichten van jou); ga dan naar het gesprek daarvoor.
2. **Filter loze berichten weg.** Begroetingen, bevestigingen en zeer korte berichten ("hi", "ok", "dank je", verborgen `[CONTEXT: …]`-regels) komen nooit in aanmerking als bron.
3. **Vat samen in plaats van citeren.** Bij het achtergrond-voorbereiden (na een afgeronde beurt) wordt uit de laatste beurten één korte zin in jouw taal gemaakt: waar het gesprek over ging, geen aanhalingstekens meer. Die zin wordt meegecached met de rest van de reunie, dus openen blijft direct.
4. **Eerlijk falen.** Lukt de samenvatting niet, dan verdwijnt de regel gewoon — geen citaat als noodoplossing, geen verzonnen thema.

Nieuwe copy (nl/en), zonder aanhalingstekens:
- nl: `Vorige keer ging het vooral over ...`
- en: `Last time was mostly about ...`

## Technisch

- `src/services/twin-reunion-service.ts`: `rememberLine()` herschreven — haalt de laatste 2–3 gesprekken op uit `hacs_conversations`, filtert verborgen en triviale berichten, en kiest het eerste gesprek met genoeg inhoud.
- Nieuwe edge function `twin-reunion-essence`: krijgt de gefilterde beurten plus taal, gebruikt `CHAT_MODEL` uit `_shared/model.ts` met `TaskKind: 'classify'`-achtige lage effort, en geeft één zin van max ~90 tekens terug. CORS via `npm:@supabase/supabase-js@2/cors`, JWT in code gevalideerd, invoer gevalideerd, geen mock-fallback.
- Aanroep gebeurt alleen in `twinReunionService.compose()` (die al in de achtergrond draait na een beurt), zodat het openen van de app een cache-lees blijft. Bij fout: `undefined`, regel valt weg, fout gelogd.
- Cachesleutel wordt `twin-reunion:v2:` zodat oude gecachte citaten niet blijven hangen.
- Geen wijziging aan detectie, guardian, of de rest van de reunie-ingrediënten.

## Test vooraf

Invoer: gesprek met berichten `["Hi Liora", "ik twijfel of ik mijn baan moet opzeggen", "het voelt als angst, niet als verlangen"]`, taal nl.
Verwachte uitvoer: één zin zonder aanhalingstekens die gaat over de twijfel rond de baan/angst — en nadrukkelijk **niet** "Hi Liora".
Tweede geval: gesprek dat alleen `["hi"]` bevat → regel ontbreekt volledig in de opening.
