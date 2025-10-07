/**
 * ThreadsBackground Component - Animated thread-like background pattern
 * Inspired by modern gradient mesh backgrounds
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface ThreadsBackgroundProps {
  className?: string;
  lineColor?: string;
  backgroundColor?: string;
  opacity?: number;
  speed?: number;
}

export const ThreadsBackground: React.FC<ThreadsBackgroundProps> = ({
  className,
  lineColor = 'rgba(99, 102, 241, 0.1)',
  backgroundColor = '#000000',
  opacity = 0.5,
  speed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawThreads = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lines = 12;
      const spacing = canvas.height / lines;

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = opacity;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 5) {
          const y = spacing * i +
            Math.sin(x * 0.01 + time * speed + i * 0.5) * 30 +
            Math.cos(x * 0.005 + time * speed * 0.5) * 20;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Vertical threads
      const verticalLines = 20;
      const verticalSpacing = canvas.width / verticalLines;

      for (let i = 0; i < verticalLines; i++) {
        ctx.beginPath();

        for (let y = 0; y <= canvas.height; y += 5) {
          const x = verticalSpacing * i +
            Math.sin(y * 0.01 + time * speed + i * 0.3) * 20 +
            Math.cos(y * 0.008 + time * speed * 0.3) * 15;

          if (y === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      time += 0.01;
      animationFrameId = requestAnimationFrame(drawThreads);
    };

    drawThreads();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lineColor, backgroundColor, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 w-full h-full pointer-events-none', className)}
      style={{ zIndex: -1 }}
    />
  );
};

export const ThreadsBackgroundStatic: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('fixed inset-0 overflow-hidden pointer-events-none', className)} style={{ zIndex: -1 }}>
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px),
          linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default ThreadsBackground;
