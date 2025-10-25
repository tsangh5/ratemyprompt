"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RatingForm } from "@/components/RatingForm";
import { RatingsList } from "@/components/RatingsList";
import { getLLMsByIds } from "@/lib/llms";

interface Rating {
  id: string;
  llm: string;
  score: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  } | null;
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
    imageUrl: string | null;
  } | null;
  category: Category | null;
}

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.id as string;

  const { data: prompt, isLoading, refetch } = useQuery<Prompt>({
    queryKey: ["prompt", promptId],
    queryFn: () => fetch(`/api/prompts/${promptId}`).then((r) => {
      if (!r.ok) throw new Error("Failed to fetch prompt");
      return r.json();
    }),
  });

  const handleRatingSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">
          Loading prompt...
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-gray-400 mb-4">Prompt not found</p>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-600 hover:to-gray-800 border border-gray-600 transition-all"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = prompt.ratings.length > 0
    ? (prompt.ratings.reduce((s, r) => s + r.score, 0) / prompt.ratings.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {prompt.category && (
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-900 text-gray-300 text-sm rounded border border-gray-600">
                {prompt.category.name}
              </span>
            )}
            {prompt.llms && prompt.llms.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tested with:</span>
                <div className="flex items-center gap-1.5">
                  {getLLMsByIds(prompt.llms).map((llm) => (
                    <div key={llm.id} className="flex items-center gap-1.5 px-2 py-1 bg-black border border-gray-700 rounded">
                      <div className="w-4 h-4 bg-white rounded flex items-center justify-center p-0.5">
                        <img
                          src={llm.logo}
                          alt={llm.name}
                          title={llm.name}
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
                      <span className="text-xs text-gray-400">{llm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4 text-white">{prompt.title}</h1>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {prompt.author?.imageUrl && (
                <img
                  src={prompt.author.imageUrl}
                  alt={prompt.author.name || "Author"}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>By {prompt.author?.name || "Anonymous"}</span>
            </div>
            <span>•</span>
            <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="prose max-w-none mb-4">
            <pre className="whitespace-pre-wrap bg-black border border-gray-800 p-4 rounded-md text-sm text-gray-300">
{prompt.text}
            </pre>
          </div>

          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 rounded-full text-sm border border-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-gray-800 to-black border border-gray-700 rounded-lg">
            <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{avgRating}</div>
            <div className="text-sm text-gray-400">
              <div>Average Rating</div>
              <div>{prompt.ratings.length} {prompt.ratings.length === 1 ? "rating" : "ratings"}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <RatingForm promptId={promptId} onSuccess={handleRatingSuccess} />
          </div>
          <div>
            <RatingsList ratings={prompt.ratings} />
          </div>
        </div>
      </div>
    </div>
  );
}
