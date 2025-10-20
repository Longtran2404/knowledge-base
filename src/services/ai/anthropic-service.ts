/**
 * Anthropic Claude Service
 * Enterprise-grade Claude AI integration
 */

import Anthropic from '@anthropic-ai/sdk';
import { aiConfig, MODEL_CAPABILITIES, PROMPT_TEMPLATES } from './config';
import { logger } from '../../lib/logger/logger';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

class AnthropicService {
  private client: Anthropic | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (!aiConfig.anthropic.apiKey) {
        logger.warn('Anthropic API key not configured');
        return;
      }

      this.client = new Anthropic({
        apiKey: aiConfig.anthropic.apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, proxy through backend
      });

      this.initialized = true;
      logger.info('Anthropic service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Anthropic service:', error);
      throw error;
    }
  }

  /**
   * Chat with Claude
   */
  async chatCompletion(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    if (!this.initialized || !this.client) {
      throw new Error('Anthropic service not initialized');
    }

    try {
      const model = aiConfig.anthropic.model;
      const modelCaps = MODEL_CAPABILITIES[model as keyof typeof MODEL_CAPABILITIES];

      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens ?? modelCaps?.maxOutput ?? 4096,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: messages as Anthropic.MessageParam[],
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';

      // Log usage
      if (response.usage) {
        logger.info('Anthropic API usage:', {
          model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          estimatedCost: this.estimateCost(model, response.usage),
        });
      }

      return text;
    } catch (error) {
      logger.error('Anthropic chat completion failed:', error);
      throw error;
    }
  }

  /**
   * Advanced tutoring with Claude's superior reasoning
   */
  async advancedTutoring(question: string, context?: string): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: PROMPT_TEMPLATES.tutoring.user(question, context),
      },
    ];

    return this.chatCompletion(messages, PROMPT_TEMPLATES.tutoring.system, {
      temperature: 0.7,
    });
  }

  /**
   * Analyze complex documents (PDFs, code, etc.)
   */
  async analyzeDocument(
    content: string,
    analysisType: 'summary' | 'key-points' | 'quiz' | 'study-guide'
  ): Promise<string> {
    const systemPrompts = {
      summary: 'Generate a comprehensive summary of the following document.',
      'key-points': 'Extract and list the key points from the following document.',
      quiz: 'Generate quiz questions based on the following document.',
      'study-guide': 'Create a detailed study guide from the following document.',
    };

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `${systemPrompts[analysisType]}\n\nDocument:\n${content}`,
      },
    ];

    return this.chatCompletion(messages, undefined, { temperature: 0.5, maxTokens: 8192 });
  }

  /**
   * Estimate API cost
   */
  private estimateCost(
    model: string,
    usage: { input_tokens: number; output_tokens: number }
  ): number {
    const modelCaps = MODEL_CAPABILITIES[model as keyof typeof MODEL_CAPABILITIES];
    if (!modelCaps) return 0;

    const inputCost = (usage.input_tokens / 1000) * modelCaps.pricing.input;
    const outputCost = (usage.output_tokens / 1000) * modelCaps.pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.initialized && !!this.client;
  }
}

export const anthropicService = new AnthropicService();
export default anthropicService;
