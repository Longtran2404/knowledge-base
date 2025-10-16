/**
 * AI Image Generator Component
 * Generate beautiful workflow thumbnails using AI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Download,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  generateWorkflowThumbnail,
  generateAndUploadThumbnail,
  suggestImagePrompts,
  type ImageGenerationOptions,
} from '../../lib/gemini-image-service';
import { supabase } from '../../lib/supabase-config';

interface AIImageGeneratorProps {
  workflowName: string;
  category: string;
  onImageGenerated: (imageUrl: string) => void;
}

export function AIImageGenerator({
  workflowName,
  category,
  onImageGenerated,
}: AIImageGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'modern' | 'minimal' | 'colorful' | 'professional' | 'gradient'>('modern');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');

  const suggestedPrompts = suggestImagePrompts(workflowName, category);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập mô tả cho ảnh');
      return;
    }

    try {
      setLoading(true);
      setGeneratedImage(null);

      const options: ImageGenerationOptions = {
        prompt,
        workflowName,
        category,
        style,
      };

      const result = await generateWorkflowThumbnail(options);

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setEnhancedPrompt(result.prompt || prompt);
        toast.success('Đã tạo ảnh thành công!');
      } else {
        toast.error(result.error || 'Không thể tạo ảnh');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error('Có lỗi khi tạo ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = async () => {
    if (!generatedImage) return;

    try {
      setLoading(true);

      // If it's an external URL, upload to Supabase
      if (generatedImage.startsWith('http') && !generatedImage.includes('supabase')) {
        const uploadResult = await generateAndUploadThumbnail(
          {
            prompt,
            workflowName,
            category,
            style,
          },
          supabase
        );

        if (uploadResult.success && uploadResult.imageUrl) {
          onImageGenerated(uploadResult.imageUrl);
          toast.success('Đã lưu ảnh vào workflow!');
          setIsOpen(false);
        } else {
          toast.error('Không thể upload ảnh');
        }
      } else {
        // Use the image URL directly
        onImageGenerated(generatedImage);
        toast.success('Đã áp dụng ảnh!');
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error('Error using image:', error);
      toast.error('Có lỗi khi lưu ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestedPrompt = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  return (
    <div>
      {/* Trigger Button */}
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Tạo ảnh bằng AI
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wand2 className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">
                      AI Image Generator
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-white/90 mt-2">
                  Tạo thumbnail đẹp cho workflow: <strong>{workflowName}</strong>
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Workflow Info */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-1">Workflow:</p>
                  <p className="text-white font-medium">{workflowName}</p>
                  <p className="text-sm text-slate-400 mt-2">Category:</p>
                  <p className="text-purple-400">{category}</p>
                </div>

                {/* Suggested Prompts */}
                <div>
                  <Label className="text-white mb-2 block">
                    💡 Gợi ý prompts:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedPrompts.map((suggested, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseSuggestedPrompt(suggested)}
                        className="justify-start text-left h-auto py-2 border-slate-600 hover:border-purple-500 text-slate-300 hover:text-white"
                      >
                        <Sparkles className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="text-xs">{suggested}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div>
                  <Label htmlFor="prompt" className="text-white mb-2 block">
                    Mô tả ảnh bạn muốn tạo:
                  </Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="VD: Modern automation dashboard with glowing circuits and flowing data, futuristic tech interface, purple and blue gradient background"
                    rows={4}
                    className="bg-slate-800/50 border-slate-700 text-white resize-none"
                  />
                </div>

                {/* Style Selection */}
                <div>
                  <Label className="text-white mb-2 block">Style:</Label>
                  <Select value={style} onValueChange={(v: any) => setStyle(v)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern - Hiện đại, gradient, glass morphism</SelectItem>
                      <SelectItem value="minimal">Minimal - Tối giản, sạch sẽ</SelectItem>
                      <SelectItem value="colorful">Colorful - Nhiều màu sắc, sống động</SelectItem>
                      <SelectItem value="professional">Professional - Chuyên nghiệp, corporate</SelectItem>
                      <SelectItem value="gradient">Gradient - Nền gradient đơn giản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo ảnh...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Tạo ảnh
                    </>
                  )}
                </Button>

                {/* Generated Image Preview */}
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="border-2 border-green-500 rounded-lg overflow-hidden">
                      <img
                        src={generatedImage}
                        alt="Generated thumbnail"
                        className="w-full h-auto"
                      />
                    </div>

                    {enhancedPrompt && (
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">
                          Enhanced Prompt:
                        </p>
                        <p className="text-sm text-slate-300">{enhancedPrompt}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleUseImage}
                        disabled={loading}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Sử dụng ảnh này
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tạo lại
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>💡 Tips:</strong> Mô tả càng chi tiết thì ảnh càng đẹp.
                    Nên bao gồm: màu sắc, phong cách, đối tượng, và cảm xúc.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
