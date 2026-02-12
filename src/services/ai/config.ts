/**
 * AI Services Configuration
 * Enterprise-grade AI integration for Knowledge Base
 *
 * Features:
 * - OpenAI GPT-4 integration
 * - Anthropic Claude integration
 * - LangChain orchestration
 * - Vector database for RAG
 * - Multi-provider fallback
 */

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'auto';
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface AIProviderConfig {
  openai: {
    apiKey: string;
    model: string;
    organization?: string;
  };
  anthropic: {
    apiKey: string;
    model: string;
  };
  fallbackOrder: Array<'openai' | 'anthropic'>;
}

// Environment-based configuration
const getAIConfig = (): AIProviderConfig => {
  return {
    openai: {
      apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4-turbo',
      organization: process.env.REACT_APP_OPENAI_ORG,
    },
    anthropic: {
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
      model: process.env.REACT_APP_ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219',
    },
    fallbackOrder: ['openai', 'anthropic'],
  };
};

export const aiConfig = getAIConfig();

// AI Feature Flags
export const AI_FEATURES = {
  tutoring: process.env.REACT_APP_AI_TUTORING_ENABLED === 'true',
  recommendations: process.env.REACT_APP_AI_RECOMMENDATIONS_ENABLED === 'true',
  contentGeneration: process.env.REACT_APP_AI_CONTENT_GENERATION_ENABLED === 'true',
  codeReview: process.env.REACT_APP_AI_CODE_REVIEW_ENABLED === 'true',
  voiceAssistant: process.env.REACT_APP_AI_VOICE_ENABLED === 'true',
  imageGeneration: process.env.REACT_APP_AI_IMAGE_GEN_ENABLED === 'true',
};

// Rate limiting configuration
export const AI_RATE_LIMITS = {
  free: {
    requestsPerDay: 10,
    tokensPerRequest: 1000,
  },
  premium: {
    requestsPerDay: 100,
    tokensPerRequest: 4000,
  },
  business: {
    requestsPerDay: 1000,
    tokensPerRequest: 8000,
  },
  enterprise: {
    requestsPerDay: -1, // unlimited
    tokensPerRequest: 32000,
  },
};

// Model capabilities
export const MODEL_CAPABILITIES = {
  'gpt-4-turbo': {
    contextWindow: 128000,
    maxOutput: 4096,
    pricing: { input: 0.01, output: 0.03 }, // per 1K tokens
    features: ['chat', 'code', 'vision', 'function-calling'],
  },
  'gpt-4o': {
    contextWindow: 128000,
    maxOutput: 16384,
    pricing: { input: 0.005, output: 0.015 },
    features: ['chat', 'code', 'vision', 'function-calling', 'audio'],
  },
  'claude-3-7-sonnet-20250219': {
    contextWindow: 200000,
    maxOutput: 8192,
    pricing: { input: 0.003, output: 0.015 },
    features: ['chat', 'code', 'vision', 'function-calling', 'pdf'],
  },
  'claude-3-opus-20240229': {
    contextWindow: 200000,
    maxOutput: 4096,
    pricing: { input: 0.015, output: 0.075 },
    features: ['chat', 'code', 'vision', 'function-calling', 'pdf', 'advanced-reasoning'],
  },
};

// Prompt templates
export const PROMPT_TEMPLATES = {
  tutoring: {
    system: `You are an expert AI tutor for Knowledge Base. Your role is to:
- Provide clear, patient explanations adapted to the student's level
- Use examples and analogies to clarify complex concepts
- Encourage critical thinking through Socratic questioning
- Provide step-by-step guidance without giving direct answers
- Maintain a supportive, encouraging tone
- Use Vietnamese when appropriate for Vietnamese students`,
    user: (question: string, context?: string) =>
      `${context ? `Context: ${context}\n\n` : ''}Question: ${question}`,
  },
  recommendations: {
    system: `You are a personalized learning recommendation engine. Analyze user data and suggest:
- Courses that match their skill level and interests
- Learning paths that align with their goals
- Workflows that complement their current projects
- Skills they should develop next based on market trends`,
  },
  codeReview: {
    system: `You are a senior code reviewer for workflow automation scripts. Review code for:
- Best practices and design patterns
- Security vulnerabilities
- Performance optimization opportunities
- Readability and maintainability
- Proper error handling
Provide constructive feedback with specific examples and improvements.`,
  },
  contentGeneration: {
    courseSummary: `Analyze the following course content and create a comprehensive yet concise summary that highlights:
- Main learning objectives
- Key topics covered
- Prerequisites
- Expected outcomes
- Ideal audience`,
  },
};

export default aiConfig;
