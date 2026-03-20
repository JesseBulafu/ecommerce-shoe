"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

/**
 * Wraps a card/child with a subtle GSAP hover float effect:
 * lifts up, scales slightly, and adds a shadow on hover.
 */
export default function CardHover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: -14,
      scale: 1.03,
      rotationX: 2,
      rotationY: -1,
      boxShadow: "0 30px 60px rgba(0,0,0,0.18), 0 10px 20px rgba(0,0,0,0.08)",
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: 0,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ willChange: "transform", perspective: "800px" }}
    >
      {children}
    </div>
  );
}
