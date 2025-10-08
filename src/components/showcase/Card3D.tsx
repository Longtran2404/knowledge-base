/**
 * 3D Card Component với Parallax Effect
 * Card hover effect cực kỳ ấn tượng với chuyển động 3D
 */

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function Card3D({ children, className = '', glowColor = 'rgba(59, 130, 246, 0.5)' }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['17.5deg', '-17.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-17.5deg', '17.5deg']);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      <div
        style={{
          transform: 'translateZ(75px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>

      {/* Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-lg blur-xl"
        style={{
          background: glowColor,
          transform: 'translateZ(-50px)',
        }}
      />
    </motion.div>
  );
}

// Preset 3D Cards

interface Course3DCardProps {
  title: string;
  description: string;
  image: string;
  level: string;
  students: number;
  rating: number;
  price?: string;
}

export function Course3DCard({
  title,
  description,
  image,
  level,
  students,
  rating,
  price,
}: Course3DCardProps) {
  return (
    <Card3D className="w-full max-w-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-lg overflow-hidden backdrop-blur-xl">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs font-medium text-white">
            {level}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span>{rating}</span>
            </div>
            <div>{students.toLocaleString()} học viên</div>
          </div>

          {price && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-2xl font-bold text-white">{price}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm"
              >
                Đăng ký
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </Card3D>
  );
}

interface Feature3DCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export function Feature3DCard({ icon, title, description, color }: Feature3DCardProps) {
  return (
    <Card3D glowColor={color}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-lg p-6 backdrop-blur-xl min-h-[200px] flex flex-col">
        <div className={`text-${color.replace('rgba(', '').split(',')[0]}-400 mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm flex-1">{description}</p>
      </div>
    </Card3D>
  );
}

interface Stat3DCardProps {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
  trend?: number;
}

export function Stat3DCard({ value, suffix = '', label, icon, trend }: Stat3DCardProps) {
  return (
    <Card3D>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-lg p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="text-blue-400">{icon}</div>
          {trend && (
            <div className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {value.toLocaleString()}{suffix}
        </div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </Card3D>
  );
}
