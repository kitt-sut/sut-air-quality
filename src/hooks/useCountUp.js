import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from its *previous* value to `end` over `duration` ms.
 * - ป้องกัน flicker: ไม่ reset กลับ 0 ทุกครั้งที่ค่าเปลี่ยน
 * - ยกเลิก animation frame อย่างถูกต้องเมื่อ unmount หรือค่าเปลี่ยน
 */
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(end);
  const prevRef = useRef(end);   // เก็บค่าก่อนหน้า เพื่อเริ่ม animate จากตรงนั้น
  const rafRef  = useRef(null);

  useEffect(() => {
    const startVal = prevRef.current;
    const diff     = end - startVal;

    // ถ้าค่าไม่เปลี่ยนเลย ไม่ต้อง animate
    if (diff === 0) return;

    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic — ทำให้การเคลื่อนไหวดูเป็นธรรมชาติมากขึ้น
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(startVal + diff * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end; // บันทึกค่าปัจจุบันไว้เป็น startVal ของรอบหน้า
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // บันทึกค่า ณ จุดที่ยกเลิก เพื่อให้รอบหน้า animate ต่อจากตรงนี้ได้อย่างราบรื่น
      prevRef.current = end;
    };
  }, [end, duration]);

  return count;
};

export default useCountUp;