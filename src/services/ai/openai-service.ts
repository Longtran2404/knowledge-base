/**
 * OpenAI Service
 * Enterprise-grade OpenAI GPT integration
 */

import OpenAI from 'openai';
import { aiConfig, MODEL_CAPABILITIES, PROMPT_TEMPLATES } from './config';
import { logger } from '../../lib/logger/logger';
import { safeParseJson } from '../../lib/safe-json';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  functions?: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[];
}

export interface TutoringRequest {
  question: string;
  context?: string;
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
}

export interface RecommendationRequest {
  userId: string;
  completedCourses: string[];
  interests: string[];
  skillLevel: Record<string, number>;
  goals: string[];
}

class OpenAIService {
  private client: OpenAI | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (!aiConfig.openai.apiKey) {
        logger.warn('OpenAI API key not configured');
        return;
      }

      this.client = new OpenAI({
        apiKey: aiConfig.openai.apiKey,
        organization: aiConfig.openai.organization,
        dangerouslyAllowBrowser: true, // Note: In production, proxy through backend
      });

      this.initialized = true;
      logger.info('OpenAI service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OpenAI service:', error);
      throw error;
    }
  }

  /**
   * Generic chat completion
   */
  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    if (!this.initialized || !this.client) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const model = options.model || aiConfig.openai.model;
      const modelCaps = MODEL_CAPABILITIES[model as keyof typeof MODEL_CAPABILITIES];

      const completion = await this.client.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? modelCaps?.maxOutput ?? 2000,
        stream: false, // Always disable streaming for type safety
      });

      // Type guard to ensure we have ChatCompletion not Stream
      if ('choices' in completion) {
        const content = completion.choices[0]?.message?.content || '';

        // Log usage for analytics
        if (completion.usage) {
          logger.info('OpenAI API usage:', {
            model,
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
            estimatedCost: this.estimateCost(model, completion.usage),
          });
        }

        return content;
      }

      return '';
    } catch (error) {
      logger.error('OpenAI chat completion failed:', error);
      throw error;
    }
  }

  /**
   * AI Tutoring - Answer student questions with context
   */
  async tutorQuestion(request: TutoringRequest): Promise<string> {
    const systemPrompt = PROMPT_TEMPLATES.tutoring.system;
    const userPrompt = PROMPT_TEMPLATES.tutoring.user(request.question, request.context);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return this.chatCompletion(messages, { temperature: 0.7 });
  }

  /**
   * Generate personalized course recommendations
   */
  async generateRecommendations(request: RecommendationRequest): Promise<{
    courses: Array<{ id: string; title: string; reason: string; priority: number }>;
    learningPaths: Array<{ name: string; courses: string[]; description: string }>;
  }> {
    const prompt = `Given a user with the following profile:
- Completed Courses: ${request.completedCourses.join(', ')}
- Interests: ${request.interests.join(', ')}
- Skill Levels: ${JSON.stringify(request.skillLevel)}
- Goals: ${request.goals.join(', ')}

Generate personalized recommendations in JSON format with:
1. Top 5 courses they should take next (with reasons and priority 1-5)
2. 2-3 learning paths to achieve their goals

Response format:
{
  "courses": [{"id": "course-id", "title": "...", "reason": "...", "priority": 1}],
  "learningPaths": [{"name": "...", "courses": [...], "description": "..."}]
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: PROMPT_TEMPLATES.recommendations.system },
      { role: 'user', content: prompt },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.5,
      maxTokens: 2000,
    });

    const fallback = { courses: [] as Array<{ id: string; title: string; reason: string; priority: number }>, learningPaths: [] as Array<{ name: string; courses: string[]; description: string }> };
    return safeParseJson(response, fallback);
  }

  /**
   * Review code/workflow for quality and security
   */
  async reviewCode(code: string, language: string): Promise<{
    score: number;
    issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string; line?: number }>;
    suggestions: string[];
  }> {
    const prompt = `Review the following ${language} code and provide:
1. Overall quality score (0-100)
2. List of issues (with severity: low/medium/high)
3. Improvement suggestions

Code:
\`\`\`${language}
${code}
\`\`\`

Response format:
{
  "score": 85,
  "issues": [{"severity": "medium", "message": "...", "line": 10}],
  "suggestions": ["..."]
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: PROMPT_TEMPLATES.codeReview.system },
      { role: 'user', content: prompt },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 3000,
    });

    const fallback = { score: 0, issues: [] as Array<{ severity: 'low' | 'medium' | 'high'; message: string; line?: number }>, suggestions: [] as string[] };
    return safeParseJson(response, fallback);
  }

  /**
   * Generate course summary from content
   */
  async generateCourseSummary(courseContent: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: PROMPT_TEMPLATES.contentGeneration.courseSummary },
      { role: 'user', content: courseContent },
    ];

    return this.chatCompletion(messages, { temperature: 0.5, maxTokens: 500 });
  }

  /**
   * Generate quiz questions from course content
   */
  async generateQuiz(
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    numQuestions: number = 5
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    const prompt = `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" at ${difficulty} level.

Response format (JSON):
[
  {
    "question": "What is...?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "..."
  }
]`;

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert quiz generator for educational content.' },
      { role: 'user', content: prompt },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const fallback: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> = [];
    return safeParseJson(response, fallback);
  }

  /**
   * Estimate API cost for usage
   */
  private estimateCost(
    model: string,
    usage: { prompt_tokens: number; completion_tokens: number }
  ): number {
    const modelCaps = MODEL_CAPABILITIES[model as keyof typeof MODEL_CAPABILITIES];
    if (!modelCaps) return 0;

    const inputCost = (usage.prompt_tokens / 1000) * modelCaps.pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * modelCaps.pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.initialized && !!this.client;
  }
}

// Singleton instance
export const openAIService = new OpenAIService();
export default openAIService;
