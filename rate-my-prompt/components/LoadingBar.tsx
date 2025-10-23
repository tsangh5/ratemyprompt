"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingBarImpl() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(60), 30);
    const timer2 = setTimeout(() => setProgress(90), 60);
    const timer3 = setTimeout(() => setProgress(100), 100);
    const timer4 = setTimeout(() => setLoading(false), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 100) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ height: "1.5px" }}>
      <div
        className="h-full bg-gradient-to-r from-white to-gray-400 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading ? 1 : 0,
        }}
      />
    </div>
  );
}

export function LoadingBar() {
  return <LoadingBarImpl />;
}
