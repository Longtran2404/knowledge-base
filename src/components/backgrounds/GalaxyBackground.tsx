/**
 * Galaxy Background Component
 * Animated starfield with galaxies, nebulas, and shooting stars
 */

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface Galaxy {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create stars
    const stars: Star[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Create shooting stars
    const shootingStars: ShootingStar[] = [];
    for (let i = 0; i < 3; i++) {
      shootingStars.push({
        x: 0,
        y: 0,
        length: 0,
        speed: 0,
        angle: 0,
        opacity: 0,
        active: false,
      });
    }

    // Create galaxies/nebulas
    const galaxies: Galaxy[] = [];
    for (let i = 0; i < 3; i++) {
      galaxies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 200 + 100,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }

    let animationFrameId: number;
    let time = 0;

    // Animation loop
    const animate = () => {
      time += 0.016; // ~60fps

      // Dark space background with subtle gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, '#0a0e27');
      gradient.addColorStop(0.5, '#050810');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw galaxies/nebulas
      galaxies.forEach((galaxy) => {
        galaxy.rotation += galaxy.rotationSpeed;

        ctx.save();
        ctx.translate(galaxy.x, galaxy.y);
        ctx.rotate(galaxy.rotation);

        // Create galaxy gradient
        const galaxyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
        galaxyGradient.addColorStop(0, `rgba(147, 51, 234, ${galaxy.opacity})`); // Purple
        galaxyGradient.addColorStop(0.3, `rgba(59, 130, 246, ${galaxy.opacity * 0.6})`); // Blue
        galaxyGradient.addColorStop(0.6, `rgba(236, 72, 153, ${galaxy.opacity * 0.3})`); // Pink
        galaxyGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = galaxyGradient;
        ctx.fillRect(-galaxy.size, -galaxy.size, galaxy.size * 2, galaxy.size * 2);

        // Add spiral arms
        ctx.strokeStyle = `rgba(147, 51, 234, ${galaxy.opacity * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
          const distance = angle * 10;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        ctx.restore();
      });

      // Draw and animate stars
      stars.forEach((star) => {
        // Twinkling effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const finalOpacity = star.opacity * twinkle;

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow for larger stars
        if (star.size > 1.5) {
          const glowGradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 3
          );
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.5})`);
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Parallax movement
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // Shooting stars
      shootingStars.forEach((shootingStar) => {
        // Create new shooting star randomly
        if (!shootingStar.active && Math.random() < 0.002) {
          shootingStar.x = Math.random() * canvas.width;
          shootingStar.y = Math.random() * canvas.height * 0.5;
          shootingStar.length = Math.random() * 80 + 50;
          shootingStar.speed = Math.random() * 10 + 15;
          shootingStar.angle = Math.random() * Math.PI / 4 + Math.PI / 6; // 30-75 degrees
          shootingStar.opacity = 1;
          shootingStar.active = true;
        }

        if (shootingStar.active) {
          // Draw shooting star trail
          const endX = shootingStar.x + Math.cos(shootingStar.angle) * shootingStar.length;
          const endY = shootingStar.y + Math.sin(shootingStar.angle) * shootingStar.length;

          const gradient = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            endX,
            endY
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Move shooting star
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.opacity -= 0.01;

          // Deactivate if off screen or faded
          if (
            shootingStar.opacity <= 0 ||
            shootingStar.x > canvas.width ||
            shootingStar.y > canvas.height
          ) {
            shootingStar.active = false;
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
}
