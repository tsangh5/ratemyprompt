"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "./Logo";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: {
    prompts: number;
  };
}

function HeaderContent() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showRightScrollIndicator, setShowRightScrollIndicator] = useState(false);
  const [showLeftScrollIndicator, setShowLeftScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync search query with URL params after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  // Check if there's more content to scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !categories) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowRightScrollIndicator(scrollLeft + clientWidth < scrollWidth - 10);
      setShowLeftScrollIndicator(scrollLeft > 10);
    };

    // Delay check to ensure content is rendered
    setTimeout(checkScroll, 100);

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string | null) => {
    const params = new URLSearchParams();
    if (categoryId) {
      params.set("category", categoryId);
    }
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleScrollToEnd = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToStart = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  };

  // Use mounted to avoid hydration mismatch
  const currentCategory = mounted ? searchParams.get("category") : null;

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-8">
        {/* Top bar */}
        <div className="py-4 pb-0 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-11 h-8 text-white transition-transform group-hover:scale-105 self-end mt-1.5" />
            <span className="hidden md:inline text-2xl font-bold text-white whitespace-nowrap">
              Rate My Prompt
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-white placeholder-gray-500 pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          <nav className="flex items-center gap-6">
            <Link
              href="/prompt/new"
              className="text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="md:hidden text-xl">+</span>
              <span className="hidden md:inline">Create</span>
            </Link>

            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-600 hover:to-gray-800 border border-gray-600 transition-all whitespace-nowrap">
                  Sign In
                </button>
              </SignInButton>
            )}
          </nav>
        </div>

        {/* Category filters */}
        {categories && categories.length > 0 && (
          <div className="p-4 relative">
            <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-8 items-center">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`transition-colors whitespace-nowrap ${
                    !currentCategory
                      ? "text-white font-semibold"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleCategoryClick("trending")}
                  className={`transition-colors whitespace-nowrap ${
                    currentCategory === "trending"
                      ? "text-white font-semibold"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Trending
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`transition-colors whitespace-nowrap ${
                      currentCategory === category.id
                        ? "text-white font-semibold"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            {showLeftScrollIndicator && (
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-start pl-3">
                <button
                  onClick={handleScrollToStart}
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer bg-gradient-to-r from-black via-black/80 to-transparent w-20 h-full flex items-center justify-start pl-3"
                  aria-label="Scroll back to see previous categories"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
            {showRightScrollIndicator && (
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-3">
                <button
                  onClick={handleScrollToEnd}
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer bg-gradient-to-l from-black via-black/80 to-transparent w-20 h-full flex items-center justify-end pr-3"
                  aria-label="Scroll to see more categories"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-4" />
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
}
