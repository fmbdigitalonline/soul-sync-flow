# Plan: Dubbele chatberichten oplossen + Runtime Register bijwerken

## Probleem 1: elke verzonden chatmelding verschijnt dubbel
Schermafbeelding 21:18 UTC: één keer "Het gaat goed" getypt, twee identieke gebruikersbellen in beeld, één antwoord van de Twin. De database bevat correct **één** gebruikersbericht — dus de duplicatie ontstaat in de frontend-staat (lokaal bericht wordt twee keer toegevoegd), niet in de opslag.

### Diagnose (uit de code, te bevestigen met een live trace)
De gebruikersmelding kan op meerdere plekken worden toegevoegd zonder bescherming tegen dubbel toevoegen:
1. Companion-flow: `appendOptimisticUserMessage` voegt het bericht direct toe.
2. Bij een fout na die stap (oracle-call faalt, context-loading faalt) valt de code terug op `hacsConversation.sendMessage(content)` — die voegt hetzelfde bericht **nog een keer** toe (skip-vlag staat daar op "niet overslaan"). Zelfde in de buitenste foutafvanger.
3. Niets in de berichtenstaat filtert dubbele gebruikersberichten; alleen de opslag filtert ze er later weer uit (daarom is de database schoon maar het scherm niet).

### Stap 1 — Bevestigen (eerst meten, dan fixen)
- Korte trace-log toevoegen op elke plek waar een gebruikersbericht wordt toegevoegd (welke pad, bericht-id).
- Eén testbericht sturen in de preview, console uitlezen, en het dubbele toevoeg-pad ermee bevestigen. Mochten edge-functielogs de oorzaak tonen (oracle-call die faalt en terugvalt), is dat het bewijs.

### Stap 2 — De fix (alle paden tegelijk, niet alleen het gevonden exemplaar)
- **Eén toevoeg-pad**: gebruikersberichten gaan voortaan door één hulpfunctie die idempotent is — een identiek gebruikersbericht (zelfde inhoud, binnen korte tijd) wordt maar één keer aan de staat toegevoegd. Dit dekt de optimistische toevoeging én elke fallback.
- **Fallback voegt niet opnieuw toe**: in de companion-foutpaden krijgt de terugval `sendMessage` de skip-vlag mee plus het al toegevoegde bericht, zodat het bericht niet twee keer landt (en er geen tweede AI-call wordt gedaan die de gebruiker niet zag aankomen).
- **Render-veiligheid**: als laatste vangnet klapt de chatweergave twee direct opeenvolgende identieke gebruikersbellen samen (zodat ook een nog onbekend pad nooit dubbel zichtbaar is).
- Vroegere geheugen-fixes (modus meegeven, progressieve context) blijven onaangetast — dit is uitsluitend frontend-staat/weergave.

### Stap 3 — Verifiëren
- Regressietest: twee keer dezelfde optimistische toevoeging → staat bevat het bericht één keer; fallback-pad voegt geen tweede exemplaar toe.
- Typecheck + tests draaien; live in de preview een bericht sturen en controleren dat er één bel verschijnt met één antwoord.

## Probleem 2: SOULSYNC_RUNTIME_REGISTER bijwerken (staat al klaar, nog niet uitgevoerd)
Alleen documentatie, geen code:
- Entry: thread-memory regressie gesloten (mode reist mee, progressieve context live, 4/4 tests groen).
- Entry: Dutch detector geverifieerd (herdeploy live, 22/22 tests groen).
- Concreteness vastgelegd als open item (kandidaat-wet, nog geen amendement).

## Volgorde
Eerst de trace + fix voor de dubbele bellen (blokkeert dagelijks gebruik), daarna de register-update.
