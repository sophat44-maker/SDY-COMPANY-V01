import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: string;
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          startCounterAnimation();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [value, hasAnimated]);

  const startCounterAnimation = () => {
    // Parse value: extract number and suffix/prefix
    const cleanValue = value.replace(/,/g, '');
    const numberMatch = cleanValue.match(/(\d+)/);
    
    if (!numberMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNumber = parseInt(numberMatch[0], 10);
    const nonNumericParts = cleanValue.split(numberMatch[0]);
    const prefix = nonNumericParts[0] || '';
    const suffix = nonNumericParts[1] || '';

    // Duration of 1.5 seconds for counts
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic: f(t) = 1 - (1-t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeProgress * targetNumber);

      // Format current number with commas
      const formattedCount = currentCount.toLocaleString('en-US');
      
      // Re-apply original suffix/prefix formatting (retaining "sqm" or "+")
      setDisplayValue(`${prefix}${formattedCount}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <span ref={containerRef} className="tabular-nums">
      {displayValue}
    </span>
  );
}
