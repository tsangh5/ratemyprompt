"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

interface Rating {
  id: string;
  score: number;
  llm: string;
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
}

export default function HomePage() {
  const { data: prompts, isLoading, refetch } = useQuery<Prompt[]>({
    queryKey: ["prompts"],
    queryFn: () => fetch("/api/prompts").then((r) => r.json()),
  });

  // Refetch when component mounts (e.g., when navigating back)
  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Rate My Prompt</h1>
        <Link
          href="/prompt/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Prompt
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading prompts...</div>
      ) : prompts && prompts.length > 0 ? (
        <div className="grid gap-6">
          {prompts.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/prompt/${prompt.id}`}
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{prompt.title}</h2>
                  <p className="text-gray-700 line-clamp-3 mb-3">{prompt.text}</p>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {prompt.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
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
                  <div className="text-3xl font-bold text-blue-600">
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
          <p className="text-gray-500 mb-4">No prompts yet</p>
          <Link
            href="/prompt/new"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create the first prompt
          </Link>
        </div>
      )}
    </main>
  );
}

function computeAvg(ratings: Rating[]) {
  if (!ratings || ratings.length === 0) return "—";
  return (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1);
}
