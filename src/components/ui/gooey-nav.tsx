/**
 * GooeyNav Component - Modern navigation with gooey blob effect
 * Perfect for dark theme with smooth animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface GooeyNavProps {
  items: NavItem[];
  className?: string;
  variant?: 'horizontal' | 'vertical';
  activeColor?: string;
  hoverColor?: string;
}

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  className,
  variant = 'horizontal',
  activeColor = 'from-blue-500 to-purple-600',
  hoverColor = 'from-blue-400 to-purple-500',
}) => {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav
      className={cn(
        'relative',
        variant === 'horizontal' ? 'flex items-center gap-2' : 'flex flex-col gap-2',
        className
      )}
    >
      {/* Gooey SVG filter */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {items.map((item, index) => {
        const isActive = location.pathname === item.href;
        const isHovered = hoveredIndex === index;

        return (
          <Link
            key={item.href}
            to={item.href}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative"
          >
            <motion.div
              className={cn(
                'relative px-6 py-3 rounded-full text-sm font-medium transition-colors overflow-hidden',
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background blob */}
              <AnimatePresence>
                {(isActive || isHovered) && (
                  <motion.div
                    layoutId={isActive ? 'activeBlob' : undefined}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 25,
                    }}
                    className={cn(
                      'absolute inset-0 rounded-full bg-gradient-to-r',
                      isActive ? activeColor : hoverColor,
                      'blur-sm'
                    )}
                    style={{ filter: 'url(#gooey-effect)' }}
                  />
                )}
              </AnimatePresence>

              {/* Content */}
              <span className="relative z-10 flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
};

interface GooeyNavMobileProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const GooeyNavMobile: React.FC<GooeyNavMobileProps> = ({
  items,
  isOpen,
  onClose,
  className,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 p-6',
              className
            )}
          >
            <nav className="flex flex-col gap-2 mt-20">
              {items.map((item) => {
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className="relative"
                  >
                    <motion.div
                      className={cn(
                        'px-6 py-4 rounded-2xl text-base font-medium transition-colors overflow-hidden',
                        isActive ? 'text-white' : 'text-gray-400'
                      )}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeMobileBlob"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600"
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 25,
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GooeyNav;
