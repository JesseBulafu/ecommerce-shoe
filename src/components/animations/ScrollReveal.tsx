"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Direction the element slides in from. Default: "up" */
  from?: "up" | "down" | "left" | "right";
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** Duration in seconds. Default: 0.8 */
  duration?: number;
  /** Travel distance in px. Default: 60 */
  distance?: number;
  /** HTML tag to render. Default: "div" */
  as?: keyof React.JSX.IntrinsicElements;
}

export default function ScrollReveal({
  children,
  className,
  from = "up",
  delay = 0,
  duration = 0.8,
  distance = 60,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const axis = from === "up" || from === "down" ? "y" : "x";
    const sign = from === "up" || from === "left" ? 1 : -1;

    gsap.from(ref.current, {
      [axis]: distance * sign,
      opacity: 0,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: ref });

  // @ts-expect-error — dynamic tag is safe here
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
