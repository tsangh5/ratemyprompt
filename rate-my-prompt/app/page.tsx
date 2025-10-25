"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getLLMsByIds } from "@/lib/llms";

interface Rating {
  id: string;
  score: number;
  llm: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface Prompt {
  id: string;
  title: string;
  text: string;
  tags: string[];
  llms: string[];
  createdAt: string;
  ratings: Rating[];
  author: {
    id: string;
    name: string | null;
  } | null;
  category: Category | null;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  const { data: prompts, isLoading, error, refetch } = useQuery<Prompt[]>({
    queryKey: ["prompts", categoryId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.set("categoryId", categoryId);
      if (searchQuery) params.set("search", searchQuery);

      const url = `/api/prompts${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data: trendingPrompts } = useQuery<Prompt[]>({
    queryKey: ["prompts", "trending"],
    queryFn: () => fetch("/api/prompts?categoryId=trending").then((r) => r.json()),
    enabled: !categoryId && !searchQuery, // Only fetch when viewing "All"
  });

  // Refetch when component mounts (e.g., when navigating back)
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Group prompts by category when viewing "All"
  const promptsByCategory = prompts && !categoryId && !searchQuery
    ? categories?.reduce((acc, category) => {
        const categoryPrompts = prompts.filter(p => p.category?.id === category.id);
        if (categoryPrompts.length > 0) {
          acc[category.id] = {
            category,
            prompts: categoryPrompts.slice(0, 10), // Top 10 per category
          };
        }
        return acc;
      }, {} as Record<string, { category: Category; prompts: Prompt[] }>)
    : null;

  if (isLoading) {
    return <main className="min-h-screen bg-black" />;
  }

  return (
    <main className="min-h-screen bg-black">
      <div className={promptsByCategory ? "max-w-7xl mx-auto p-8" : "max-w-4xl mx-auto p-8"}>
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-2">Failed to load prompts</p>
            <p className="text-sm text-gray-500 mb-4">{error instanceof Error ? error.message : "Unknown error"}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-600 hover:to-gray-800 border border-gray-600 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : !prompts ? (
          <div className="text-center py-12 text-gray-500">No data available</div>
        ) : promptsByCategory ? (
          // Category sections with carousels for "All" view
          <div className="space-y-12">
            {/* Trending Section */}
            {trendingPrompts && trendingPrompts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Trending
                  </h2>
                  <Link
                    href="/?category=trending"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <div className="overflow-x-auto scrollbar-hide -mx-8 px-8">
                  <div className="flex gap-6 pb-4">
                    {trendingPrompts.slice(0, 10).map((prompt) => (
                      <Link
                        key={prompt.id}
                        href={`/prompt/${prompt.id}`}
                        className="flex-none w-80 p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg hover:border-gray-600 hover:shadow-xl hover:shadow-gray-900/50 transition-all"
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="text-lg font-semibold mb-2 text-white line-clamp-2">{prompt.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{prompt.text}</p>
                          <div className="flex items-center justify-between mt-auto">
                            {prompt.llms && prompt.llms.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {getLLMsByIds(prompt.llms).slice(0, 4).map((llm) => (
                                  <div key={llm.id} className="w-9 h-9 bg-white rounded flex items-center justify-center p-0.5" title={llm.name}>
                                    <img
                                      src={llm.logo}
                                      alt={llm.name}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        if (llm.logoFallback && e.currentTarget.src !== llm.logoFallback) {
                                          e.currentTarget.src = llm.logoFallback;
                                        } else {
                                          e.currentTarget.style.display = "none";
                                        }
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-right">
                              <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {computeAvg(prompt.ratings)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {prompt.ratings.length} {prompt.ratings.length === 1 ? "rating" : "ratings"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category Sections */}
            {Object.values(promptsByCategory).map(({ category, prompts }) => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {category.name}
                  </h2>
                  <Link
                    href={`/?category=${category.id}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <div className="overflow-x-auto scrollbar-hide -mx-8 px-8">
                  <div className="flex gap-6 pb-4">
                    {prompts.map((prompt) => (
                      <Link
                        key={prompt.id}
                        href={`/prompt/${prompt.id}`}
                        className="flex-none w-80 p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg hover:border-gray-600 hover:shadow-xl hover:shadow-gray-900/50 transition-all"
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="text-lg font-semibold mb-2 text-white line-clamp-2">{prompt.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{prompt.text}</p>

                          <div className="flex items-center justify-between mt-auto">
                            {prompt.llms && prompt.llms.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {getLLMsByIds(prompt.llms).slice(0, 4).map((llm) => (
                                  <div key={llm.id} className="w-9 h-9 bg-white rounded flex items-center justify-center p-0.5" title={llm.name}>
                                    <img
                                      src={llm.logo}
                                      alt={llm.name}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        if (llm.logoFallback && e.currentTarget.src !== llm.logoFallback) {
                                          e.currentTarget.src = llm.logoFallback;
                                        } else {
                                          e.currentTarget.style.display = "none";
                                        }
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-right">
                              <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {computeAvg(prompt.ratings)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {prompt.ratings.length} {prompt.ratings.length === 1 ? "rating" : "ratings"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : prompts.length > 0 ? (
          // Regular grid view for filtered results
          <div className="grid gap-6">
            {prompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/prompt/${prompt.id}`}
                className="block p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg hover:border-gray-600 hover:shadow-xl hover:shadow-gray-900/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-white">{prompt.title}</h2>
                    <p className="text-gray-400 line-clamp-3 mb-4">{prompt.text}</p>

                    {prompt.llms && prompt.llms.length > 0 && (
                      <div className="flex items-center gap-2">
                        {getLLMsByIds(prompt.llms).map((llm) => (
                          <div key={llm.id} className="w-8 h-8 bg-white rounded flex items-center justify-center p-0.5" title={llm.name}>
                            <img
                              src={llm.logo}
                              alt={llm.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                if (llm.logoFallback && e.currentTarget.src !== llm.logoFallback) {
                                  e.currentTarget.src = llm.logoFallback;
                                } else {
                                  e.currentTarget.style.display = "none";
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {computeAvg(prompt.ratings)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {prompt.ratings.length} {prompt.ratings.length === 1 ? "rating" : "ratings"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No prompts yet</p>
            <Link
              href="/prompt/new"
              className="inline-block px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-600 hover:to-gray-800 border border-gray-600 transition-all"
            >
              Create the first prompt
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <HomePageContent />
    </Suspense>
  );
}

function computeAvg(ratings: Rating[]) {
  if (!ratings || ratings.length === 0) return "—";
  return (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1);
}
