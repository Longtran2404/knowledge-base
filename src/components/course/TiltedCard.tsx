/**
 * Tilted Card Component
 * 3D tilted card with mouse tracking - inspired by reactbits.dev
 */

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Users, Clock, Award } from 'lucide-react';

interface TiltedCardProps {
  title: string;
  description: string;
  image: string;
  level?: string;
  students?: number;
  duration?: string;
  rating?: number;
  price?: string;
  badge?: string;
  className?: string;
}

export function TiltedCard({
  title,
  description,
  image,
  level,
  students,
  duration,
  rating,
  price,
  badge,
  className = '',
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

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
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative group ${className}`}
    >
      <div
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10 hover:border-white/20 transition-all"
        style={{
          transform: 'translateZ(50px)',
        }}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            style={{
              transform: 'translateZ(75px)',
            }}
          />

          {/* Badge */}
          {badge && (
            <motion.div
              style={{ transform: 'translateZ(100px)' }}
              className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold"
            >
              {badge}
            </motion.div>
          )}

          {/* Level */}
          {level && (
            <motion.div
              style={{ transform: 'translateZ(100px)' }}
              className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium"
            >
              {level}
            </motion.div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div
          className="p-6"
          style={{
            transform: 'translateZ(75px)',
          }}
        >
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-white">{rating}</span>
              </div>
            )}
            {students && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{students.toLocaleString()}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
          </div>

          {/* Price & CTA */}
          {price && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-2xl font-bold text-white">{price}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ transform: 'translateZ(125px)' }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm shadow-lg shadow-blue-500/30"
              >
                Đăng ký ngay
              </motion.button>
            </div>
          )}
        </div>

        {/* Hover Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"
        />
      </div>

      {/* Shadow */}
      <div
        className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          transform: 'translateZ(-50px)',
        }}
      />
    </motion.div>
  );
}

// Course Grid with Tilted Cards
export function TiltedCourseGrid({ courses }: { courses: TiltedCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <TiltedCard {...course} />
        </motion.div>
      ))}
    </div>
  );
}
