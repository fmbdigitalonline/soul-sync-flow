#  Dynamische vervolgacties bij een geselecteerde zin

## Doel

Wanneer iemand een zin in een antwoord selecteert, formuleert SoulSync vier vervolgacties die grammaticaal en inhoudelijk aansluiten op:

1. de geselecteerde zin;
2. de laatste twee relevante gespreksdelen;
3. de actieve taal (Nederlands of Engels).

De bestaande routes blijven ongewijzigd: **begrijpen**, **patroon veranderen**, **bereiken** en **onthouden**.

## Gedrag

- Bij selectie verschijnt kort een rustige laadstatus terwijl de vervolgacties worden geformuleerd.
- De vier bestaande acties worden op relevantie gerangschikt.
- De drie meest logische acties staan direct in beeld.
- **Meer opties** toont de vierde actie; opnieuw inklappen blijft mogelijk.
- Iedere tekst benoemt de concrete betekenis uit de selectie, in plaats van generieke woorden als “dit”.
- Een klik blijft exact naar de huidige achterliggende route gaan; er komen geen nieuwe routes of zijpanelen bij.
- Bij een fout verschijnt een zichtbare foutmelding met **Opnieuw proberen**. Er worden geen generieke of verzonnen noodteksten getoond.

## Test-first voorbeelden

Voor de implementatie worden vaste invoer/uitvoercriteria vastgelegd.

**Nederlands**

- Selectie: “Het doel is niet de perfecte bron vinden, maar ontdekken of deze manier van leren jou in beweging brengt.”
- Context: de gebruiker blijft leermiddelen vergelijken en wil beginnen.
- Verifieerbaar resultaat: alle vier opties zijn Nederlands, verwijzen concreet naar kiezen/beginnen/leren, hebben ieder één bestaande route en de drie relevantste staan bovenaan.

**Engels**

- Selectie: “I keep planning the change, but I never take the first step.”
- Context: de gebruiker wil een nieuwe routine starten.
- Verifieerbaar resultaat: alle vier opties zijn Engels, sluiten grammaticaal op de uitspraak aan en `change_pattern` of `achieve` staat in de zichtbare top drie.

**Veiligheid en contract**

- De generator retourneert precies één tekst voor elk van de vier toegestane route-ID’s, zonder extra route.
- Lege, dubbele, te lange of verkeerd-talige resultaten worden afgewezen en zichtbaar als fout behandeld.
- De volgorde verandert alleen de presentatie; de bestaande actie-afhandeling blijft intact.

## Uitvoering

1. Maak een afgeschermde generator die alleen de geselecteerde zin, de laatste twee relevante gespreksdelen en de taal ontvangt en strikt gestructureerde vier-route-uitvoer teruggeeft.
2. Plaats de externe AI-aanroep achter een interne service en gebruik de bestaande directe OpenAI-configuratie; controleer import, runtime-compatibiliteit en een minimale aanroep vóór integratie.
3. Laat de chat bij selectie de relevante context verzamelen, verouderde aanvragen annuleren/negeren en laad-, fout- en retry-status beheren.
4. Pas de actiekaart aan naar drie zichtbare keuzes plus **Meer opties**, met de bestaande knopcomponenten en huidige visuele stijl.
5. Voeg compacte diagnostische logging toe voor aanvraag, gevalideerde uitkomst en fout, zonder gesprekstekst of persoonsgegevens te loggen.
6. Voeg unit- en integratietests toe voor Nederlands, Engels, ranking, routebehoud, foutieve uitvoer, opnieuw proberen en snelle wisseling tussen selecties.
7. Controleer de kaart in de mobiele weergave uit de screenshot en op desktop: geen overlap, correcte taal, drie opties zichtbaar en de vierde uitklapbaar.

## Technische grenzen

- Geen wijzigingen aan de vier achterliggende routes, geheugenopslag, transformatieflow, doelflow of gespreksdetectie.
- Geen mockdata, hardcoded inhoudelijke antwoorden of stille fallback.
- De geselecteerde zin en context worden alleen gebruikt om labels en rangorde te formuleren; de daadwerkelijke actie ontvangt nog steeds de oorspronkelijke geselecteerde zin.
- De nieuwe serverfunctie wordt pas als afgerond beschouwd na tests, een geslaagde deploy en een echte gestructureerde responscontrole. *****Devnote vertoon is de NBA die het snelst laden zodat de gebruiker niet te lang hoeft te wachten, als de gebruiker dan op meer opties klikt dan heeft het systeem tijd gehad on de andere naaste laden en geef een gebruiksvriendelijk gebruikers ervaring door het gevoel van lang wachten te reduceren 