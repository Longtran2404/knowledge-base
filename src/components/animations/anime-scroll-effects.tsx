
import React, { useEffect, useRef, useState } from 'react';

interface AnimeScrollEffectsProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInUp' | 'bounceIn' | 'rotateIn' | 'flipInX';
  delay?: number;
  duration?: number;
}

// Component for one-time animations (no reverse on scroll up)
export function AnimeScrollEffects({
  children,
  className = '',
  animationType = 'fadeInUp',
  delay = 0,
  duration = 1000
}: AnimeScrollEffectsProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set CSS custom properties from data attributes
    element.style.setProperty('--animation-duration', `${duration}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [delay, hasAnimated, duration]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';

    if (!isVisible) {
      switch (animationType) {
        case 'fadeInUp': return `${baseClasses} opacity-0 translate-y-8`;
        case 'fadeInLeft': return `${baseClasses} opacity-0 -translate-x-8`;
        case 'fadeInRight': return `${baseClasses} opacity-0 translate-x-8`;
        case 'scaleIn': return `${baseClasses} opacity-0 scale-95`;
        case 'slideInUp': return `${baseClasses} opacity-0 translate-y-16`;
        case 'bounceIn': return `${baseClasses} opacity-0 scale-75`;
        case 'rotateIn': return `${baseClasses} opacity-0 rotate-12 scale-95`;
        case 'flipInX': return `${baseClasses} opacity-0 rotate-x-90`;
        default: return `${baseClasses} opacity-0 translate-y-8`;
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`;
  };

  return (
    <div
      ref={elementRef}
      className={`${className} ${getAnimationClasses()}`}
      data-duration={duration}
    >
      {children}
    </div>
  );
}

interface AnimeScrollObserverProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInUp' | 'bounceIn' | 'rotateIn' | 'flipInX';
  delay?: number;
  duration?: number;
  threshold?: number;
}

// Component for animations with reverse on scroll up
export function AnimeScrollObserver({
  children,
  className = '',
  animationType = 'fadeInUp',
  delay = 0,
  duration = 1000,
  threshold = 0.1,
}: AnimeScrollObserverProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set CSS custom properties from data attributes
    element.style.setProperty('--animation-duration', `${duration}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          } else {
            // Reverse animation when scrolling up/out of view
            setIsVisible(false);
            setHasAnimated(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [delay, threshold, duration]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';

    if (!isVisible) {
      switch (animationType) {
        case 'fadeInUp': return `${baseClasses} opacity-0 translate-y-8`;
        case 'fadeInLeft': return `${baseClasses} opacity-0 -translate-x-8`;
        case 'fadeInRight': return `${baseClasses} opacity-0 translate-x-8`;
        case 'scaleIn': return `${baseClasses} opacity-0 scale-95`;
        case 'slideInUp': return `${baseClasses} opacity-0 translate-y-16`;
        case 'bounceIn': return `${baseClasses} opacity-0 scale-75`;
        case 'rotateIn': return `${baseClasses} opacity-0 rotate-12 scale-95`;
        case 'flipInX': return `${baseClasses} opacity-0 rotate-x-90`;
        default: return `${baseClasses} opacity-0 translate-y-8`;
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`;
  };

  return (
    <div
      ref={elementRef}
      className={`${className} ${getAnimationClasses()}`}
      data-duration={duration}
    >
      {children}
    </div>
  );
}

// Parallax scroll effect component
export function ParallaxScroll({
  children,
  className = '',
  speed = 0.5,
  direction = 'up'
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      
      switch (direction) {
        case 'up':
          element.style.transform = `translateY(${rate}px)`;
          break;
        case 'down':
          element.style.transform = `translateY(-${rate}px)`;
          break;
        case 'left':
          element.style.transform = `translateX(${rate}px)`;
          break;
        case 'right':
          element.style.transform = `translateX(-${rate}px)`;
          break;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Stagger animation component
export function StaggerAnimation({
  children,
  className = '',
  staggerDelay = 100
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          data-delay={isVisible ? index * staggerDelay : 0}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
