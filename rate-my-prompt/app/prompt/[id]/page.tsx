"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RatingForm } from "@/components/RatingForm";
import { RatingsList } from "@/components/RatingsList";

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
    imageUrl: string | null;
  } | null;
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
      <div className="max-w-4xl mx-auto p-8 text-center">
        Loading prompt...
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-gray-500 mb-4">Prompt not found</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go back home
        </Link>
      </div>
    );
  }

  const avgRating = prompt.ratings.length > 0
    ? (prompt.ratings.reduce((s, r) => s + r.score, 0) / prompt.ratings.length).toFixed(1)
    : "—";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg border p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{prompt.title}</h1>

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
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm">
{prompt.text}
          </pre>
        </div>

        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {prompt.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
          <div className="text-4xl font-bold text-blue-600">{avgRating}</div>
          <div className="text-sm text-gray-600">
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
  );
}
