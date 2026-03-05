import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 up to `end` over `duration` milliseconds.
 * Properly cancels the animation frame on unmount or when `end` changes.
 */
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    setCount(0); // reset before each animation
    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;

      if (elapsed < duration) {
        setCount(Math.floor((elapsed / duration) * end));
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  return count;
};

export default useCountUp;
