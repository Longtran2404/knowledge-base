/**
 * AI Services - Unified AI Interface
 * Provides intelligent fallback between AI providers
 */

import { openAIService } from './openai-service';
import { anthropicService } from './anthropic-service';
import { aiConfig, AI_FEATURES } from './config';
import { logger } from '../../lib/logger/logger';

export type AIProvider = 'openai' | 'anthropic';

export interface AIServiceOptions {
  provider?: AIProvider;
  fallback?: boolean;
}

class AIService {
  /**
   * Get the best available AI provider
   */
  private getBestProvider(): AIProvider | null {
    for (const provider of aiConfig.fallbackOrder) {
      if (provider === 'openai' && openAIService.isAvailable()) {
        return 'openai';
      }
      if (provider === 'anthropic' && anthropicService.isAvailable()) {
        return 'anthropic';
      }
    }
    return null;
  }

  /**
   * Execute AI request with automatic fallback
   */
  private async executeWithFallback<T>(
    operation: (provider: AIProvider) => Promise<T>,
    options: AIServiceOptions = {}
  ): Promise<T> {
    const primaryProvider = options.provider || this.getBestProvider();

    if (!primaryProvider) {
      throw new Error('No AI provider available. Please configure API keys.');
    }

    try {
      return await operation(primaryProvider);
    } catch (error) {
      logger.error(`AI request failed with ${primaryProvider}:`, error);

      // Try fallback if enabled
      if (options.fallback !== false) {
        const fallbackProvider =
          primaryProvider === 'openai' ? 'anthropic' : ('openai' as AIProvider);

        if (
          (fallbackProvider === 'openai' && openAIService.isAvailable()) ||
          (fallbackProvider === 'anthropic' && anthropicService.isAvailable())
        ) {
          logger.info(`Falling back to ${fallbackProvider}`);
          return await operation(fallbackProvider);
        }
      }

      throw error;
    }
  }

  /**
   * AI Tutoring
   */
  async tutorQuestion(
    question: string,
    context?: string,
    options?: AIServiceOptions
  ): Promise<string> {
    if (!AI_FEATURES.tutoring) {
      throw new Error('AI tutoring is not enabled');
    }

    return this.executeWithFallback(async (provider) => {
      if (provider === 'openai') {
        return openAIService.tutorQuestion({ question, context });
      } else {
        return anthropicService.advancedTutoring(question, context);
      }
    }, options);
  }

  /**
   * Generate course recommendations
   */
  async generateRecommendations(
    userId: string,
    userProfile: {
      completedCourses: string[];
      interests: string[];
      skillLevel: Record<string, number>;
      goals: string[];
    },
    options?: AIServiceOptions
  ) {
    if (!AI_FEATURES.recommendations) {
      throw new Error('AI recommendations are not enabled');
    }

    return this.executeWithFallback(async (provider) => {
      if (provider === 'openai') {
        return openAIService.generateRecommendations({
          userId,
          ...userProfile,
        });
      } else {
        // Claude implementation would go here
        throw new Error('Recommendations not implemented for Anthropic yet');
      }
    }, options);
  }

  /**
   * Review code/workflow
   */
  async reviewCode(
    code: string,
    language: string,
    options?: AIServiceOptions
  ): Promise<{
    score: number;
    issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string; line?: number }>;
    suggestions: string[];
  }> {
    if (!AI_FEATURES.codeReview) {
      throw new Error('AI code review is not enabled');
    }

    return this.executeWithFallback(async (provider) => {
      if (provider === 'openai') {
        return openAIService.reviewCode(code, language);
      } else {
        // Claude implementation would go here
        throw new Error('Code review not implemented for Anthropic yet');
      }
    }, options);
  }

  /**
   * Generate content
   */
  async generateCourseSummary(
    courseContent: string,
    options?: AIServiceOptions
  ): Promise<string> {
    if (!AI_FEATURES.contentGeneration) {
      throw new Error('AI content generation is not enabled');
    }

    return this.executeWithFallback(async (provider) => {
      if (provider === 'openai') {
        return openAIService.generateCourseSummary(courseContent);
      } else {
        return anthropicService.analyzeDocument(courseContent, 'summary');
      }
    }, options);
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz(
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    numQuestions: number = 5,
    options?: AIServiceOptions
  ) {
    if (!AI_FEATURES.contentGeneration) {
      throw new Error('AI content generation is not enabled');
    }

    return this.executeWithFallback(async (provider) => {
      if (provider === 'openai') {
        return openAIService.generateQuiz(topic, difficulty, numQuestions);
      } else {
        // Claude implementation would go here
        throw new Error('Quiz generation not implemented for Anthropic yet');
      }
    }, options);
  }

  /**
   * Check feature availability
   */
  isFeatureEnabled(feature: keyof typeof AI_FEATURES): boolean {
    return AI_FEATURES[feature];
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (openAIService.isAvailable()) providers.push('openai');
    if (anthropicService.isAvailable()) providers.push('anthropic');
    return providers;
  }
}

// Singleton instance
export const aiService = new AIService();

// Re-export services
export { openAIService, anthropicService };
export * from './config';
export default aiService;
