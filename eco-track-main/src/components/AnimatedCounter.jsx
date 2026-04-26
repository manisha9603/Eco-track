import { useState, useEffect, useRef } from "react";

export default function AnimatedCounter({ target, duration = 1500, prefix = "", suffix = "", decimals = 0, className = "" }) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = prevTarget.current;
    const end = target;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

  return (
    <span className={`animated-counter ${count < target ? "counting" : ""} ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
