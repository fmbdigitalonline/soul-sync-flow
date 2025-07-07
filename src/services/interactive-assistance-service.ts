import { supabase } from "@/integrations/supabase/client";
import { dreamActivityLogger } from "./dream-activity-logger";

export interface AssistanceRequest {
  id: string;
  subTaskId: string;
  subTaskTitle: string;
  helpType: 'stuck' | 'need_details' | 'how_to' | 'examples';
  userMessage?: string;
  context: any;
  timestamp: Date;
}

export interface AssistanceResponse {
  id: string;
  requestId: string;
  helpType: 'concrete_steps' | 'examples' | 'tools_needed' | 'time_breakdown';
  content: string;
  actionableSteps: string[];
  toolsNeeded: string[];
  timeEstimate?: string;
  successCriteria: string[];
  timestamp: Date;
}

export interface HelpTemplate {
  id: string;
  helpType: string;
  taskType: string;
  promptTemplate: string;
  exampleResponse: AssistanceResponse;
}

class InteractiveAssistanceService {
  private assistanceRequests = new Map<string, AssistanceRequest>();
  private assistanceResponses = new Map<string, AssistanceResponse>();
  private helpTemplates = new Map<string, HelpTemplate>();
  private onAssistanceCallback?: (response: AssistanceResponse) => void;

  constructor() {
    this.initializeHelpTemplates();
    this.setupLogging();
  }

  private setupLogging() {
    dreamActivityLogger.logActivity('interactive_assistance_service_initialized', {
      service: 'InteractiveAssistanceService',
      features: ['contextual_help', 'progressive_disclosure', 'real_time_assistance']
    });
  }

  private initializeHelpTemplates() {
    // Research task templates
    this.addHelpTemplate({
      id: 'research_goal_setting',
      helpType: 'stuck',
      taskType: 'research',
      promptTemplate: `The user is stuck on defining research goals. They need concrete, actionable steps with specific tools and timeframes. 
      
      Task: {subTaskTitle}
      Context: {context}
      
      Provide exactly 3-5 micro-steps that take 2-5 minutes each. Each step must include:
      1. Specific action verb (write, open, list, set timer, etc.)
      2. Concrete tool to use (Google Doc, notebook, timer app, etc.)  
      3. Exact deliverable (3 sentences, 5 bullet points, etc.)
      4. Success criteria (how they know they're done)
      
      Format your response as actionable instructions, not advice. Use "Set a timer for 3 minutes and write..." not "Consider reflecting on..."`,
      exampleResponse: {
        id: 'example_research_goal',
        requestId: 'req_001',
        helpType: 'concrete_steps',
        content: 'Here are specific micro-steps to define your research goals:',
        actionableSteps: [
          'Set a 5-minute timer and open a blank document',
          'Write exactly 3 sentences starting with "I want to research..."',
          'List 5 specific questions you want to answer',
          'Choose your top 2 questions and write why they matter to you'
        ],
        toolsNeeded: ['Timer app', 'Google Doc or notebook', 'Pen/keyboard'],
        timeEstimate: '15 minutes total',
        successCriteria: [
          'You have 3 clear sentences about your research purpose',
          'You have 5 specific research questions written down',
          'You can explain why your top 2 questions matter'
        ],
        timestamp: new Date()
      }
    });

    // Writing task templates
    this.addHelpTemplate({
      id: 'writing_structure',
      helpType: 'how_to',
      taskType: 'writing',
      promptTemplate: `The user needs help with structuring their writing task. Provide concrete steps with specific formatting and organization methods.
      
      Task: {subTaskTitle}
      Context: {context}
      
      Give them a clear template to follow with specific formatting requirements and step-by-step instructions.`,
      exampleResponse: {
        id: 'example_writing_structure',
        requestId: 'req_002',
        helpType: 'concrete_steps',
        content: 'Here\'s your writing structure template:',
        actionableSteps: [
          'Create a document with these exact headings: Introduction, Main Points, Conclusion',
          'Under Introduction: Write 2-3 sentences about what you\'ll cover',
          'Under Main Points: List 3-5 bullet points of your key ideas',
          'Under Conclusion: Write 1-2 sentences summarizing your main message'
        ],
        toolsNeeded: ['Word processor', 'Outline template'],
        timeEstimate: '20 minutes',
        successCriteria: [
          'You have a document with all required headings',
          'Each section has the specified content',
          'You can read through it and it makes sense'
        ],
        timestamp: new Date()
      }
    });

    // Planning task templates
    this.addHelpTemplate({
      id: 'planning_breakdown',
      helpType: 'need_details',
      taskType: 'planning',
      promptTemplate: `The user needs more detailed instructions for a planning task. Break it down into the smallest possible actionable steps.
      
      Task: {subTaskTitle}
      Context: {context}
      
      Provide granular steps that are impossible to get stuck on. Each step should be completable in under 5 minutes.`,
      exampleResponse: {
        id: 'example_planning_breakdown',
        requestId: 'req_003',
        helpType: 'concrete_steps',
        content: 'Let\'s break this planning task into tiny, doable steps:',
        actionableSteps: [
          'Get a piece of paper or open a notes app',
          'Write "My Plan for [task name]" at the top',
          'Set a 10-minute timer',
          'Write down everything that comes to mind (don\'t organize yet)',
          'Stop when timer goes off, even if you\'re mid-sentence'
        ],
        toolsNeeded: ['Paper/digital notes', 'Timer', 'Pen/keyboard'],
        timeEstimate: '10 minutes',
        successCriteria: [
          'You have a titled document/page',
          'You have at least 5 items written down',
          'Timer has gone off and you\'ve stopped writing'
        ],
        timestamp: new Date()
      }
    });
  }

  private addHelpTemplate(template: HelpTemplate) {
    this.helpTemplates.set(`${template.taskType}_${template.helpType}`, template);
  }

  async requestAssistance(
    subTaskId: string,
    subTaskTitle: string,
    helpType: 'stuck' | 'need_details' | 'how_to' | 'examples',
    context: any,
    userMessage?: string
  ): Promise<AssistanceResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: AssistanceRequest = {
      id: requestId,
      subTaskId,
      subTaskTitle,
      helpType,
      userMessage,
      context,
      timestamp: new Date()
    };

    this.assistanceRequests.set(requestId, request);

    // Log assistance request
    await dreamActivityLogger.logActivity('assistance_requested', {
      request_id: requestId,
      subtask_id: subTaskId,
      subtask_title: subTaskTitle,
      help_type: helpType,
      user_message: userMessage?.substring(0, 100),
      context: context
    });

    // Generate contextual assistance
    const response = await this.generateContextualAssistance(request);
    
    this.assistanceResponses.set(response.id, response);

    // Log assistance provided
    await dreamActivityLogger.logActivity('assistance_provided', {
      request_id: requestId,
      response_id: response.id,
      help_type: response.helpType,
      steps_count: response.actionableSteps.length,
      tools_count: response.toolsNeeded.length,
      time_estimate: response.timeEstimate
    });

    // Trigger callback if set
    if (this.onAssistanceCallback) {
      this.onAssistanceCallback(response);
    }

    return response;
  }

  private async generateContextualAssistance(request: AssistanceRequest): Promise<AssistanceResponse> {
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine task type from sub-task title
    const taskType = this.classifyTaskType(request.subTaskTitle);
    
    // Get appropriate template
    const templateKey = `${taskType}_${request.helpType}`;
    const template = this.helpTemplates.get(templateKey);
    
    if (template && this.shouldUseTemplate(request)) {
      // Use template-based response for immediate help
      return {
        ...template.exampleResponse,
        id: responseId,
        requestId: request.id,
        content: this.personalizeTemplateContent(template.exampleResponse.content, request),
        actionableSteps: this.personalizeActionableSteps(template.exampleResponse.actionableSteps, request),
        timestamp: new Date()
      };
    }

    // Generate AI-powered assistance (this would integrate with the AI coach)
    return await this.generateAIAssistance(request, responseId);
  }

  private classifyTaskType(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('research') || lowerTitle.includes('find') || lowerTitle.includes('investigate')) {
      return 'research';
    }
    if (lowerTitle.includes('write') || lowerTitle.includes('draft') || lowerTitle.includes('compose')) {
      return 'writing';
    }
    if (lowerTitle.includes('plan') || lowerTitle.includes('organize') || lowerTitle.includes('schedule')) {
      return 'planning';
    }
    if (lowerTitle.includes('analyze') || lowerTitle.includes('review') || lowerTitle.includes('evaluate')) {
      return 'analysis';
    }
    
    return 'general';
  }

  private shouldUseTemplate(request: AssistanceRequest): boolean {
    // Use templates for immediate help, but not for complex or specific requests
    if (request.userMessage && request.userMessage.length > 50) {
      return false; // User provided detailed context, needs custom response
    }
    
    return true; // Use template for quick, standard help
  }

  private personalizeTemplateContent(content: string, request: AssistanceRequest): string {
    return content.replace(/\{subTaskTitle\}/g, request.subTaskTitle);
  }

  private personalizeActionableSteps(steps: string[], request: AssistanceRequest): string[] {
    return steps.map(step => 
      step.replace(/\[task name\]/g, request.subTaskTitle.toLowerCase())
    );
  }

  private async generateAIAssistance(request: AssistanceRequest, responseId: string): Promise<AssistanceResponse> {
    // This would integrate with the AI coach service to generate custom assistance
    // For now, providing a structured fallback
    
    const baseResponse: AssistanceResponse = {
      id: responseId,
      requestId: request.id,
      helpType: 'concrete_steps',
      content: `Let me help you with "${request.subTaskTitle}". Here are specific steps to move forward:`,
      actionableSteps: [
        'Take a 2-minute break to clear your head',
        'Open a document or grab paper and pen',
        'Set a 5-minute timer',
        'Write down what you already know about this task',
        'List any questions or concerns you have'
      ],
      toolsNeeded: ['Timer', 'Paper/document', 'Pen/keyboard'],
      timeEstimate: '10-15 minutes',
      successCriteria: [
        'You feel more clarity about the task',
        'You have identified your next concrete action',
        'You know what tools or information you need'
      ],
      timestamp: new Date()
    };

    // Customize based on help type
    if (request.helpType === 'examples') {
      baseResponse.helpType = 'examples';
      baseResponse.content = `Here are concrete examples for "${request.subTaskTitle}":`;
      baseResponse.actionableSteps = [
        'Look up 2-3 similar examples online',
        'Write down what you like about each example',
        'Identify common patterns or structures',
        'Choose 1 example to use as your template'
      ];
    } else if (request.helpType === 'how_to') {
      baseResponse.helpType = 'tools_needed';
      baseResponse.content = `Here's exactly how to approach "${request.subTaskTitle}":`;
      baseResponse.actionableSteps = [
        'Start with the simplest possible version',
        'Focus on completing just the first step',
        'Don\'t worry about perfection',
        'Set small, achievable goals'
      ];
    }

    return baseResponse;
  }

  onAssistanceProvided(callback: (response: AssistanceResponse) => void) {
    this.onAssistanceCallback = callback;
  }

  getAssistanceHistory(subTaskId: string): AssistanceResponse[] {
    return Array.from(this.assistanceResponses.values())
      .filter(response => {
        const request = this.assistanceRequests.get(response.requestId);
        return request?.subTaskId === subTaskId;
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Quick assistance generators for common scenarios
  generateQuickHelp(type: 'getting_started' | 'time_management' | 'breaking_down'): AssistanceResponse {
    const responseId = `quick_${Date.now()}`;
    
    const quickHelps = {
      getting_started: {
        content: 'Not sure where to begin? Here\'s how to get started:',
        actionableSteps: [
          'Set a timer for 5 minutes',
          'Write down everything you know about this task',
          'Circle the easiest thing to start with',
          'Do that one thing right now'
        ],
        toolsNeeded: ['Timer', 'Paper/notes'],
        timeEstimate: '5-10 minutes'
      },
      time_management: {
        content: 'Feeling overwhelmed by time? Try this approach:',
        actionableSteps: [
          'Estimate how long each step really takes',
          'Add 50% buffer time to your estimates',
          'Focus on just the next 15 minutes',
          'Celebrate small wins as you go'
        ],
        toolsNeeded: ['Timer', 'Calendar/planner'],
        timeEstimate: '15 minutes'
      },
      breaking_down: {
        content: 'Task feels too big? Let\'s break it down:',
        actionableSteps: [
          'Write the task at the top of a page',
          'Ask "What\'s the very first thing I need to do?"',
          'Write that down, then ask the same question again',
          'Keep going until you have steps under 10 minutes each'
        ],
        toolsNeeded: ['Paper/document', 'Pen/keyboard'],
        timeEstimate: '10 minutes'
      }
    };

    const help = quickHelps[type];
    
    return {
      id: responseId,
      requestId: 'quick_help',
      helpType: 'concrete_steps',
      content: help.content,
      actionableSteps: help.actionableSteps,
      toolsNeeded: help.toolsNeeded,
      timeEstimate: help.timeEstimate,
      successCriteria: [
        'You have a clear next action',
        'The task feels more manageable',
        'You know what tools you need'
      ],
      timestamp: new Date()
    };
  }
}

export const interactiveAssistanceService = new InteractiveAssistanceService();