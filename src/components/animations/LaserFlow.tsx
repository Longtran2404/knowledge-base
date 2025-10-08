/**
 * Laser Flow Animation
 * Animated laser beams flowing through the background - inspired by reactbits.dev
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LaserFlowProps {
  className?: string;
  lineCount?: number;
  colors?: string[];
}

export function LaserFlow({
  className = '',
  lineCount = 5,
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'],
}: LaserFlowProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: lineCount }).map((_, index) => (
        <LaserLine
          key={index}
          delay={index * 0.8}
          color={colors[index % colors.length]}
          index={index}
          totalLines={lineCount}
        />
      ))}
    </div>
  );
}

interface LaserLineProps {
  delay: number;
  color: string;
  index: number;
  totalLines: number;
}

function LaserLine({ delay, color, index, totalLines }: LaserLineProps) {
  // Random positioning for variety
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const angle = Math.random() * 360;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        x: [0, Math.cos(angle * Math.PI / 180) * 1000],
        y: [0, Math.sin(angle * Math.PI / 180) * 1000],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: totalLines * 0.8,
        ease: 'linear',
      }}
      className="absolute"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: '2px',
        height: '100px',
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
}

// Horizontal Flow variant
export function LaserFlowHorizontal({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: '200%',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: index * 1.3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute h-0.5"
          style={{
            top: `${20 + index * 30}%`,
            width: '300px',
            background: `linear-gradient(to right, transparent, #3b82f6, #8b5cf6, transparent)`,
            boxShadow: '0 0 20px #3b82f6',
          }}
        />
      ))}
    </div>
  );
}

// Canvas-based Laser Flow for better performance
export function CanvasLaserFlow({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Laser {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      angle: number;
      color: string;
      opacity: number;
      life: number;
      maxLife: number;
    }

    const lasers: Laser[] = [];
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

    function createLaser() {
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;

      switch (side) {
        case 0: // Top
          x = Math.random() * canvas.width;
          y = 0;
          vx = (Math.random() - 0.5) * 4;
          vy = Math.random() * 3 + 2;
          break;
        case 1: // Right
          x = canvas.width;
          y = Math.random() * canvas.height;
          vx = -(Math.random() * 3 + 2);
          vy = (Math.random() - 0.5) * 4;
          break;
        case 2: // Bottom
          x = Math.random() * canvas.width;
          y = canvas.height;
          vx = (Math.random() - 0.5) * 4;
          vy = -(Math.random() * 3 + 2);
          break;
        default: // Left
          x = 0;
          y = Math.random() * canvas.height;
          vx = Math.random() * 3 + 2;
          vy = (Math.random() - 0.5) * 4;
      }

      lasers.push({
        x,
        y,
        vx,
        vy,
        length: Math.random() * 100 + 50,
        angle: Math.atan2(vy, vx),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0,
        life: 0,
        maxLife: Math.random() * 100 + 100,
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create new lasers occasionally
      if (Math.random() < 0.02 && lasers.length < 10) {
        createLaser();
      }

      lasers.forEach((laser, index) => {
        laser.x += laser.vx;
        laser.y += laser.vy;
        laser.life++;

        // Update opacity
        if (laser.life < laser.maxLife * 0.2) {
          laser.opacity = laser.life / (laser.maxLife * 0.2);
        } else if (laser.life > laser.maxLife * 0.8) {
          laser.opacity = (laser.maxLife - laser.life) / (laser.maxLife * 0.2);
        } else {
          laser.opacity = 1;
        }

        // Remove if out of bounds or expired
        if (
          laser.x < -laser.length ||
          laser.x > canvas.width + laser.length ||
          laser.y < -laser.length ||
          laser.y > canvas.height + laser.length ||
          laser.life > laser.maxLife
        ) {
          lasers.splice(index, 1);
          return;
        }

        // Draw laser
        const gradient = ctx.createLinearGradient(
          laser.x,
          laser.y,
          laser.x - Math.cos(laser.angle) * laser.length,
          laser.y - Math.sin(laser.angle) * laser.length
        );

        gradient.addColorStop(0, laser.color);
        gradient.addColorStop(0.5, laser.color + 'AA');
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.globalAlpha = laser.opacity;

        ctx.beginPath();
        ctx.moveTo(laser.x, laser.y);
        ctx.lineTo(
          laser.x - Math.cos(laser.angle) * laser.length,
          laser.y - Math.sin(laser.angle) * laser.length
        );
        ctx.stroke();

        // Add glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = laser.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
