import { AssistanceResponse } from '@/services/interactive-assistance-service';

const formatList = (items: string[], prefix: string): string => {
  if (!items.length) {
    return '';
  }

  return `${prefix}\n${items.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
};

export const summarizeAssistanceResponse = (response: AssistanceResponse): string => {
  const sections: string[] = [];

  if (response.content) {
    sections.push(response.content);
  }

  if (response.actionableSteps?.length) {
    const steps = formatList(response.actionableSteps, 'Actionable steps:');
    if (steps) {
      sections.push(steps);
    }
  }

  if (response.toolsNeeded?.length) {
    sections.push(`Tools suggested: ${response.toolsNeeded.join(', ')}`);
  }

  if (response.successCriteria?.length) {
    const criteria = formatList(response.successCriteria, 'Success criteria:');
    if (criteria) {
      sections.push(criteria);
    }
  }

  if (response.timeEstimate) {
    sections.push(`Estimated time: ${response.timeEstimate}`);
  }

  return sections.join('\n\n');
};

export const normalizeAssistanceResponses = (
  responses: AssistanceResponse[]
): AssistanceResponse[] => {
  return responses.map((response, index) => ({
    ...response,
    followUpDepth: response.followUpDepth ?? index + 1,
    isFollowUp: index > 0 ? true : false
  }));
};

export const buildAggregatedAssistanceContext = (
  responses: AssistanceResponse[]
): string | undefined => {
  if (!responses.length) {
    return undefined;
  }

  const sections = responses.map((response, index) => {
    const label = index === 0
      ? 'Initial help'
      : `Follow-up help #${response.followUpDepth ?? index + 1}`;

    const summary = summarizeAssistanceResponse(response);

    return `${label}:\n${summary}`.trim();
  });

  return sections.join('\n\n---\n\n');
};
