/**
 * Gemini AI Image Generation Service
 * Generate beautiful workflow thumbnail images using Google Gemini API
 */

import { safeResponseJson } from './safe-json';

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ImageGenerationOptions {
  prompt: string;
  workflowName?: string;
  category?: string;
  style?: 'modern' | 'minimal' | 'colorful' | 'professional' | 'gradient';
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}

/**
 * Generate workflow thumbnail using AI
 * Note: Gemini doesn't directly generate images, but we'll use it to create
 * a detailed prompt for image generation services or use placeholder service
 */
export async function generateWorkflowThumbnail(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  try {
    const enhancedPrompt = await enhancePromptWithGemini(options);

    // Since Gemini doesn't generate images directly, we'll use Unsplash API
    // or create a gradient placeholder with the prompt
    const imageUrl = await generateImageFromPrompt(enhancedPrompt, options);

    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
    };
  } catch (error: any) {
    console.error('Error generating workflow thumbnail:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    };
  }
}

/**
 * Use Gemini to enhance the prompt for better image generation
 */
async function enhancePromptWithGemini(
  options: ImageGenerationOptions
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found, using basic prompt');
    return createBasicPrompt(options);
  }

  try {
    const systemPrompt = `You are an expert at creating detailed, visually descriptive prompts for AI image generation.
Create a detailed, vivid prompt for a workflow thumbnail image based on the user's input.
The prompt should be visual, specific, and include style, colors, composition, and mood.
Keep it under 200 words and focus on visual elements only.`;

    const userPrompt = `Create an image generation prompt for a workflow thumbnail:
- Workflow Name: ${options.workflowName || 'Automation Workflow'}
- Category: ${options.category || 'Automation'}
- Style: ${options.style || 'modern'}
- User Description: ${options.prompt}

Generate a detailed visual prompt that would create a beautiful, professional thumbnail image.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await safeResponseJson(response, {} as Record<string, unknown>);
    const enhancedPrompt =
      data.candidates?.[0]?.content?.parts?.[0]?.text || options.prompt;

    return enhancedPrompt.trim();
  } catch (error) {
    console.error('Error enhancing prompt with Gemini:', error);
    return createBasicPrompt(options);
  }
}

/**
 * Create basic prompt if Gemini is not available
 */
function createBasicPrompt(options: ImageGenerationOptions): string {
  const styleDescriptions = {
    modern: 'modern, sleek, glass morphism, vibrant gradients',
    minimal: 'minimalist, clean, simple shapes, monochromatic',
    colorful: 'colorful, vibrant, energetic, dynamic',
    professional: 'professional, corporate, clean, blue and white tones',
    gradient: 'gradient background, smooth colors, abstract shapes',
  };

  const style = styleDescriptions[options.style || 'modern'];
  const category = options.category || 'automation';

  return `${style}, ${category} theme, ${options.prompt}, high quality, professional thumbnail, digital art, 16:9 aspect ratio`;
}

/**
 * Generate image from enhanced prompt
 * Using Unsplash API for free high-quality images
 */
async function generateImageFromPrompt(
  prompt: string,
  options: ImageGenerationOptions
): Promise<string> {
  // Strategy 1: Try Unsplash API (free, high quality)
  try {
    const keywords = extractKeywords(prompt, options);
    const unsplashUrl = await searchUnsplashImage(keywords);
    if (unsplashUrl) return unsplashUrl;
  } catch (error) {
    console.warn('Unsplash failed, using fallback');
  }

  // Strategy 2: Generate gradient placeholder with DiceBear API
  try {
    const placeholderUrl = generatePlaceholderImage(options);
    return placeholderUrl;
  } catch (error) {
    console.warn('Placeholder generation failed');
  }

  // Strategy 3: Fallback to static gradient
  return generateStaticGradient(options);
}

/**
 * Extract keywords from prompt for image search
 */
function extractKeywords(prompt: string, options: ImageGenerationOptions): string {
  const category = options.category?.toLowerCase() || '';
  const workflowName = options.workflowName?.toLowerCase() || '';

  // Common visual keywords for each category
  const categoryKeywords: Record<string, string> = {
    'automation': 'technology automation workflow digital',
    'e-commerce': 'ecommerce shopping online store',
    'marketing': 'marketing social media advertising',
    'data processing': 'data analytics dashboard charts',
    'productivity': 'productivity office workspace desk',
    'communication': 'communication team collaboration',
    'crm': 'customer relationship business',
    'finance': 'finance money business accounting',
  };

  const keywords = categoryKeywords[category] || 'technology workflow automation';
  return keywords;
}

/**
 * Search Unsplash for relevant image
 */
async function searchUnsplashImage(keywords: string): Promise<string | null> {
  try {
    // Using Unsplash Source API (no key required for basic usage)
    const width = 800;
    const height = 600;
    const imageUrl = `https://source.unsplash.com/random/${width}x${height}/?${encodeURIComponent(keywords)}`;

    // Verify image loads
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (response.ok) {
      return response.url; // Returns the actual image URL after redirect
    }

    return null;
  } catch (error) {
    console.error('Unsplash search failed:', error);
    return null;
  }
}

/**
 * Generate beautiful placeholder with DiceBear Shapes
 */
function generatePlaceholderImage(options: ImageGenerationOptions): string {
  const seed = encodeURIComponent(options.workflowName || options.prompt || 'workflow');

  // DiceBear Shapes API - beautiful abstract shapes
  const styles = ['shapes', 'bottts', 'identicon', 'rings'];
  const style = styles[Math.floor(Math.random() * styles.length)];

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=800&backgroundColor=gradient`;
}

/**
 * Generate static gradient background with CSS-based image
 */
function generateStaticGradient(options: ImageGenerationOptions): string {
  const gradients = {
    modern: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minimal: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    colorful: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    professional: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  };

  const gradient = gradients[options.style || 'modern'];

  // Create data URL with gradient
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#grad1)" />
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" opacity="0.9">
        ${options.workflowName || 'Workflow'}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate image using prompt and save to Supabase Storage
 */
export async function generateAndUploadThumbnail(
  options: ImageGenerationOptions,
  supabaseClient: any
): Promise<ImageGenerationResult> {
  try {
    // Generate image
    const result = await generateWorkflowThumbnail(options);

    if (!result.success || !result.imageUrl) {
      return result;
    }

    // If it's a data URL or external URL, we can use it directly
    if (result.imageUrl.startsWith('data:') || result.imageUrl.startsWith('http')) {
      return result;
    }

    // Otherwise, download and upload to Supabase
    const imageBlob = await fetch(result.imageUrl).then(r => r.blob());
    const fileName = `workflow-thumbnail-${Date.now()}.jpg`;

    const { data, error } = await supabaseClient.storage
      .from('workflow-thumbnails')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    const { data: publicUrlData } = supabaseClient.storage
      .from('workflow-thumbnails')
      .getPublicUrl(fileName);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      prompt: result.prompt,
    };
  } catch (error: any) {
    console.error('Error generating and uploading thumbnail:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Suggest image prompts based on workflow info
 */
export function suggestImagePrompts(
  workflowName: string,
  category: string
): string[] {
  const prompts: Record<string, string[]> = {
    'Automation': [
      'futuristic automation dashboard with glowing circuits',
      'robotic arms assembling digital workflows',
      'interconnected nodes with data flowing through',
      'modern tech interface with automation icons',
    ],
    'E-commerce': [
      'modern online shopping interface with products',
      'digital shopping cart with colorful items',
      'ecommerce dashboard with sales charts',
      'mobile shopping app interface',
    ],
    'Marketing': [
      'social media marketing dashboard with analytics',
      'digital marketing funnel visualization',
      'content calendar with colorful posts',
      'marketing automation workflow diagram',
    ],
    'Data Processing': [
      'data flowing through pipelines and nodes',
      'analytics dashboard with charts and graphs',
      'database servers with glowing connections',
      'ETL process visualization with colorful flows',
    ],
    'Productivity': [
      'organized workspace with digital tools',
      'task management board with colorful cards',
      'productivity dashboard with metrics',
      'time management visualization',
    ],
  };

  return prompts[category] || prompts['Automation'];
}
