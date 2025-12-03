# Reflective Bridge Implementation Guide

This guide explains how the "Reflective Bridge" links Sanctuary conversations (The Intelligence) to the Project Suite (The Goal) using the retrofitted Supabase tables. It focuses on the trigger path that starts with a blocker in conversation and ends with a delivered action plan.

## Step A: Capture the Conversation (Input)
1. **Event detection in the Conversation Engine**
   - When the user signals friction (e.g., "I want to launch the website, but I'm paralyzed."), the engine writes a new record to `conversational_context_events` (retrofit of `pie_astrological_events`).
   - Required payload:
     - `event_type`: descriptive marker such as `BLOCKER_DETECTED`.
     - `intensity`: numeric score (e.g., 0.9 for `HIGH_ANXIETY`).
     - `related_goal_id`: project or roadmap goal identifier (e.g., `WEBSITE_LAUNCH`).
     - Optional enrichments: `session_id` (conversation id), `sentiment_score`, and `detected_intent` (e.g., `scope_overwhelm`).
   - Insert example:
     ```sql
     insert into conversational_context_events (
       id, session_id, event_type, intensity, personal_relevance,
       related_goal_id, detected_intent, description, start_time, category
     ) values (
       gen_random_uuid(), 'SESSION_UUID', 'BLOCKER_DETECTED', 0.9, 0.95,
       'WEBSITE_LAUNCH', 'scope_overwhelm', 'User blocked by launch scope',
       now(), 'conversation'
     );
     ```

## Step B: Run the Reflective Analysis (Trigger)
1. **Wake the Reflective Analysis Service**
   - `ReflectiveAnalysisService.processPostConversation` is called with the `userId`, `sessionId`, and conversation summary.
   - The service fetches the freshest context from `conversational_context_events` or seeds a context row if none exists.
2. **Query blueprint heuristics**
   - The service reads `blueprint_logic_matrix` (retrofit of `pie_predictive_rules`) for rules matching the user and cognitive profile tag (e.g., `Perfectionist`).
   - Trigger conditions inside `trigger_condition` can match detected intent (`scope_overwhelm`) or sentiment bands, enabling rules like "If Perfectionist is blocked by scope, apply Salami Slicing".
3. **Pattern synthesis**
   - Recent behavioral velocity patterns and the conversation sentiment/intent are merged to derive triggers (e.g., `intent_scope_overwhelm`, `frustration`).
   - The first heuristic satisfying the trigger conditions becomes the active bridge rule.

## Step C: Deliver the Reflective Action Plan (Bridge)
1. **Action construction**
   - With a matched heuristic and context, the service builds a `ReflectiveActionPlan` (retrofit of `pie_insights`) that names the trigger, carries the conversation summary, and attaches proposed actions (e.g., `playbook: salami_slicing`).
2. **Persistence and delivery**
   - The plan is upserted into `reflective_action_plans` for downstream consumption by the Project Suite surfaces.
   - Key fields: `trigger_event`, `delivery_time`, `confidence`, `proposed_actions`, and `user_feedback_status`.
3. **Resulting loop**
   - The Project Suite can now render the plan next to the goal (`related_goal_id`) and solicit feedback, closing the reflective loop and informing future heuristics.

## Operational Notes
- The bridge requires both context (`conversational_context_events`) and heuristics (`blueprint_logic_matrix`) to be populated; otherwise, the service logs and exits without generating a plan.
- Intensities remain numeric in the schema; map qualitative levels (e.g., `HIGH_ANXIETY`) to a 0–1 scale before insertion.
- To deactivate the bridge temporarily (e.g., maintenance), avoid calling `initialize` on `ReflectiveAnalysisService` or call `cleanup` after session completion.
