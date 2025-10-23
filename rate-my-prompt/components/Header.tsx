"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: {
    prompts: number;
  };
}

export function Header() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

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

  const currentCategory = searchParams.get("category");

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent whitespace-nowrap">
            Rate My Prompt
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
              >
                🔍
              </button>
            </div>
          </form>

          <nav className="flex items-center gap-6">
            <Link
              href="/prompt/new"
              className="text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Create
            </Link>

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
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
          <div className="pb-4 overflow-x-auto scrollbar-hide">
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
        )}
      </div>
    </header>
  );
}
