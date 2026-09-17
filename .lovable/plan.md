# Plan: SOULSYNC_RUNTIME_REGISTER bijwerken met nieuwe verificaties

## Doel
Het register (het review-logboek naast de Runtime Constitution) bijwerken met drie verificaties die sinds de laatste entry (Aug 4) zijn uitgevoerd. Alleen documentatie — geen codewijzigingen.

## Wijzigingen in `SOULSYNC_RUNTIME_REGISTER.md`

### 1. Nieuwe observatie-entry: thread-memory regressie gesloten (Sep 16–17 2026)
Nieuwe sectie onder "Behavioural observations" die vastlegt:
- **Bug 1 gesloten**: het actieve opslagpad (`storeMessageWithProgressiveMemory` → `storeMessage`) schreef zonder `mode`; nu reist `mode` mee in elke upsert naar `conversation_memory`, met `companion` als expliciete default.
- **Leeskant gesloten**: `getProgressiveIntelligentContext` was een stub die onvoorwaardelijk `[]` teruggaf — de client stuurde elke beurt een lege gespreksgeschiedenis naar de oracle. Nu: laadt gevalideerde berichten via `getConversationContext(threadId)`, selecteert semantisch + recentheid binnen tokenbudget, chronologisch.
- **Regressietest vastgelegd**: `src/services/__tests__/conversation-memory-service.test.ts`, met vooraf gedefinieerde ground-truth input/output (Test-First-directive): thread met twee berichten → context retourneert die berichten chronologisch, niet `[]`; upsert-payload bevat `mode`. **4/4 tests groen.**

### 2. Nieuwe observatie-entry: Dutch detector geverifieerd (Sep 17 2026)
- De "detector is niet live"-waarschuwing van Aug 4 (stale bundle) is opgeheven: herdeploy uitgevoerd en de tweetalige detectie draait nu.
- **22/22 regression tests groen** (`conversation-phase-tracker.test.ts`): Nederlandse zinnen matchen echte patronen, geen turn-count fallback (geen 0.30 confidence floor), Nederlandse en Engelse transcripten produceren identieke cluster-sequenties.
- Dit deblokkeert indirect de open beslissing "consume `conversation_state_tracking` in the prompt" — de detector-defect-voorwaarde is nu vervuld.

### 3. Open item toegevoegd: concreteness-regel
- "Concreteness" gaat in "Open decisions" (of als open observatie): drie waarnemingen (Rule of Three bereikt — Jul 30 baseline ×2, Jul 30 post-Track-A ×1) dat antwoorden geen concrete stap bevatten. Kandidaat voor een nieuwe wet, maar nog geen amendement geformuleerd; per *interpretation before amendment* eerst bepalen of het een ontbrekende wet is of een toepassingsfout.

## Technische details
- Bestand: `SOULSYNC_RUNTIME_REGISTER.md` (alleen dit bestand).
- Nieuwe entries volgen het bestaande format: gedateerde secties onder "Behavioural observations", amendementlog ongewijzigd (geen nieuwe wet — alleen verificaties en een open item).
- De bestaande waarschuwing bij "Dutch detector" (stale bundle, Aug 4) wordt niet herschreven maar door de nieuwe gedateerde entry tegen-gesproken, conform het logkarakter van het register.

## Niet in scope
- Geen codewijzigingen, geen deploys, geen amendementen aan de Runtime Constitution.
- De concreteness-regel wordt geregistreerd als open item, niet als wet geformuleerd.
