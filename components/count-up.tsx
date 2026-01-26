
'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface CountUpProps {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export default function CountUp({ 
  end, 
  duration = 2, 
  start = 0, 
  decimals = 0 
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (inView && !hasStarted) {
      setHasStarted(true);
      const increment = (end - start) / (duration * 60);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [inView, hasStarted, end, start, duration]);

  return (
    <span ref={ref} className="animate-count-up">
      {count.toFixed(decimals)}
    </span>
  );
}
