import { describe, expect, it } from 'vitest';
import { validatePrimarySentenceActionCopy, validateSentenceActionCopy } from '../sentence-action-copy-service';

describe('sentence action copy contract', () => {
  const valid = {
    question: 'Wat helpt je nu verder met beginnen?',
    actions: [
      { action: 'achieve', label: 'Help me de eerste leerstap kiezen', rank: 1 },
      { action: 'change_pattern', label: 'Help me stoppen met eindeloos vergelijken', rank: 2 },
      { action: 'understand', label: 'Help me begrijpen waarom kiezen zo lastig voelt', rank: 3 },
      { action: 'remember', label: 'Onthoud dat beweging belangrijker is dan de perfecte bron', rank: 4 },
    ],
  };

  it('accepts exactly four unique existing routes and sorts by relevance', () => {
    const result = validateSentenceActionCopy(valid);
    expect(result.actions.map((item) => item.action)).toEqual(['achieve', 'change_pattern', 'understand', 'remember']);
  });

  it('rejects a missing route', () => {
    expect(() => validateSentenceActionCopy({ ...valid, actions: valid.actions.slice(0, 3) })).toThrow();
  });

  it('rejects duplicate labels', () => {
    const actions = valid.actions.map((item, index) => index === 1 ? { ...item, label: valid.actions[0].label } : item);
    expect(() => validateSentenceActionCopy({ ...valid, actions })).toThrow('duplicated');
  });

  it('rejects unknown routes', () => {
    const actions = valid.actions.map((item, index) => index === 0 ? { ...item, action: 'new_route' } : item);
    expect(() => validateSentenceActionCopy({ ...valid, actions })).toThrow('unknown');
  });

  it('accepts one fast primary route', () => {
    expect(validatePrimarySentenceActionCopy({
      question: 'Wat helpt je om te beginnen?',
      action: { action: 'achieve', label: 'Help me mijn eerste leerstap kiezen', rank: 1 },
    }).action.action).toBe('achieve');
  });
});