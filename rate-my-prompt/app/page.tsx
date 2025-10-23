"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

  // Refetch when component mounts (e.g., when navigating back)
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return <main className="min-h-screen bg-black" />;
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-8">
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
        ) : prompts.length > 0 ? (
          <div className="grid gap-6">
            {prompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/prompt/${prompt.id}`}
                className="block p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg hover:border-gray-600 hover:shadow-xl hover:shadow-gray-900/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {prompt.category && (
                        <span className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-900 text-gray-300 text-xs rounded border border-gray-600">
                          {prompt.category.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-white">{prompt.title}</h2>
                    <p className="text-gray-400 line-clamp-3 mb-3">{prompt.text}</p>

                    {prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {prompt.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 text-sm rounded border border-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        By {prompt.author?.name || "Anonymous"}
                      </span>
                      <span>
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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
