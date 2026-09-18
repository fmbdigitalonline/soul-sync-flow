import type { ConversationMessage } from '@/hooks/use-hacs-conversation';

/**
 * Duplicate-turn guard for optimistic user messages.
 *
 * BUG FIX (duplicate chat bubbles): the same user turn used to reach the chat
 * state twice — once via the optimistic append and once when a fallback path
 * (e.g. companion oracle error -> standard sendMessage) appended its own user
 * copy. Returns the already-present identical user message when the same turn
 * would be appended a second time mid-send:
 *  - same trimmed content,
 *  - no assistant reply in between (a reply means it is a genuinely new turn),
 *  - the existing message is younger than `windowMs`.
 * Callers must only apply this while a send is in flight, so genuine repeat
 * sends by an idle user are never swallowed.
 */
export function findRecentDuplicateUserMessage(
  prev: ConversationMessage[],
  content: string,
  nowMs: number,
  windowMs: number = 5000
): ConversationMessage | undefined {
  const trimmed = content.trim();
  for (let i = prev.length - 1; i >= 0; i--) {
    const m = prev[i];
    if (m.role !== 'user' || m.content.trim() !== trimmed) continue;
    const hasReplyAfter = prev.slice(i + 1).some(later => later.role === 'hacs');
    if (hasReplyAfter) continue;
    const msgTime = new Date(m.timestamp).getTime();
    if (Number.isFinite(msgTime) && nowMs - msgTime < windowMs) return m;
    return undefined;
  }
  return undefined;
}
