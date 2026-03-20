"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay between each child. Default: 0.1 */
  stagger?: number;
  /** Duration per child. Default: 0.7 */
  duration?: number;
}

export default function StaggerGrid({
  children,
  className,
  stagger = 0.1,
  duration = 0.7,
}: StaggerGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const items = ref.current.children;
    if (!items.length) return;

    gsap.from(items, {
      y: 50,
      opacity: 0,
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
