/**
 * Micro Interactions Component
 * Các hiệu ứng micro-interactions tinh tế và ấn tượng
 */

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  ThumbsUp,
  BookmarkPlus,
  Share2,
  Download,
  Bell,
  Check,
} from 'lucide-react';

// Like Button with Animation
export function LikeButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(234);

  const handleLike = () => {
    if (!liked) {
      setCount(count + 1);
    } else {
      setCount(count - 1);
    }
    setLiked(!liked);
  };

  return (
    <motion.button
      onClick={handleLike}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/50 transition-colors group"
    >
      <motion.div
        animate={{
          scale: liked ? [1, 1.3, 1] : 1,
          rotate: liked ? [0, -15, 15, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            liked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'
          }`}
        />
      </motion.div>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className={`text-sm font-medium ${liked ? 'text-red-500' : 'text-gray-400'}`}
        >
          {count}
        </motion.span>
      </AnimatePresence>

      {/* Particles on click */}
      <AnimatePresence>
        {liked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 3) * 30,
                  y: Math.sin((i * Math.PI) / 3) * 30,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Star Rating with Animation
export function StarRating({ initialRating = 0 }: { initialRating?: number }) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
          whileHover={{ scale: 1.2, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Star
            className={`h-6 w-6 transition-all ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            }`}
          />
        </motion.button>
      ))}
      <span className="ml-2 text-sm text-gray-400">
        {rating > 0 ? `${rating}.0` : 'Rate'}
      </span>
    </div>
  );
}

// Bookmark Button with Flip Animation
export function BookmarkButton() {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <motion.button
      onClick={() => setBookmarked(!bookmarked)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-colors"
    >
      <motion.div
        animate={{ rotateY: bookmarked ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <BookmarkPlus
          className={`h-5 w-5 transition-colors ${
            bookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400'
          }`}
        />
      </motion.div>
    </motion.button>
  );
}

// Share Button with Expand Animation
export function ShareButton() {
  const [expanded, setExpanded] = useState(false);

  const socialLinks = [
    { name: 'Facebook', color: 'bg-blue-600' },
    { name: 'Twitter', color: 'bg-sky-500' },
    { name: 'LinkedIn', color: 'bg-blue-700' },
    { name: 'Copy', color: 'bg-gray-600' },
  ];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-colors"
      >
        <Share2
          className={`h-5 w-5 transition-all ${
            expanded ? 'text-purple-500 rotate-90' : 'text-gray-400'
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-full mt-2 right-0 flex flex-col gap-2 p-2 rounded-lg bg-gray-900 border border-white/10 backdrop-blur-xl"
          >
            {socialLinks.map((link, index) => (
              <motion.button
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, x: 5 }}
                className={`px-4 py-2 rounded ${link.color} text-white text-sm font-medium whitespace-nowrap`}
              >
                {link.name}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Download Button with Progress
export function DownloadButton() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    setDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloading(false);
            setProgress(0);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <motion.button
      onClick={handleDownload}
      disabled={downloading}
      whileHover={{ scale: downloading ? 1 : 1.05 }}
      whileTap={{ scale: downloading ? 1 : 0.95 }}
      className="relative px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium overflow-hidden"
    >
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        className="absolute inset-0 bg-white/20"
      />
      <span className="relative flex items-center gap-2">
        {downloading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Download className="h-5 w-5" />
            </motion.div>
            {progress}%
          </>
        ) : progress === 100 ? (
          <>
            <Check className="h-5 w-5" />
            Downloaded
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download
          </>
        )}
      </span>
    </motion.button>
  );
}

// Notification Bell with Badge
export function NotificationBell() {
  const [hasNotification, setHasNotification] = useState(true);
  const [count, setCount] = useState(5);

  return (
    <motion.button
      onClick={() => setHasNotification(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, rotate: -15 }}
      className="relative p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 transition-colors"
    >
      <motion.div animate={{ rotate: hasNotification ? [0, -15, 15, -15, 0] : 0 }}>
        <Bell className={`h-5 w-5 ${hasNotification ? 'text-yellow-500' : 'text-gray-400'}`} />
      </motion.div>

      <AnimatePresence>
        {hasNotification && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Thumbs Up with Counter
export function ThumbsUpButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(128);

  return (
    <motion.button
      onClick={() => {
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-green-500/50 transition-colors"
    >
      <motion.div
        animate={{
          scale: liked ? [1, 1.3, 1] : 1,
          y: liked ? [-5, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <ThumbsUp
          className={`h-5 w-5 transition-colors ${
            liked ? 'fill-green-500 text-green-500' : 'text-gray-400'
          }`}
        />
      </motion.div>
      <span className={`text-sm font-medium ${liked ? 'text-green-500' : 'text-gray-400'}`}>
        {count}
      </span>
    </motion.button>
  );
}

// Demo Component showing all interactions
export function MicroInteractionsDemo() {
  return (
    <div className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Micro Interactions
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Trải nghiệm các hiệu ứng tương tác tinh tế và mượt mà
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <InteractionCard title="Like Button" description="Click để thích">
            <LikeButton />
          </InteractionCard>

          <InteractionCard title="Star Rating" description="Đánh giá bằng sao">
            <StarRating initialRating={3} />
          </InteractionCard>

          <InteractionCard title="Bookmark" description="Lưu vào mục yêu thích">
            <BookmarkButton />
          </InteractionCard>

          <InteractionCard title="Share" description="Chia sẻ lên mạng xã hội">
            <ShareButton />
          </InteractionCard>

          <InteractionCard title="Download" description="Tải xuống với progress">
            <DownloadButton />
          </InteractionCard>

          <InteractionCard title="Notification" description="Thông báo với badge">
            <NotificationBell />
          </InteractionCard>
        </div>
      </div>
    </div>
  );
}

function InteractionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
    >
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="flex justify-center">{children}</div>
    </motion.div>
  );
}
