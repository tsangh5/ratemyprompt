"use client";

import { useState } from "react";

interface AutoScrollCarouselProps {
  children: React.ReactNode;
  shouldAutoScroll?: boolean;
}

export function AutoScrollCarousel({ children, shouldAutoScroll = true }: AutoScrollCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleScroll = () => {
    setIsPaused(true);
  };

  return (
    <div
      className="overflow-x-auto scrollbar-hide -mx-8 px-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onScroll={handleScroll}
    >
      <div
        className="flex gap-6 pb-4"
        style={{
          animation: shouldAutoScroll && !isPaused ? 'scroll 18s linear infinite' : 'none',
        }}
      >
        {children}
        {children}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
