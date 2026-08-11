"use client";

import { useEffect, useRef } from "react";

interface HeroScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroScrollAnimation({
  children,
  className,
}: HeroScrollAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;

        const gsap = gsapModule.default;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);

        const media = gsap.matchMedia();
        media.add("(min-width: 1024px)", () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });

          timeline.to(target, {
            scale: 1.06,
            y: -36,
            ease: "none",
          });

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        });

        dispose = () => media.revert();
      }
    );

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div ref={targetRef}>{children}</div>
    </div>
  );
}
