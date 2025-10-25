"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUser, SignInButton } from "@clerk/nextjs";
import { LLMS } from "@/lib/llms";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export default function NewPromptPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSignedIn, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    tags: "",
    categoryId: "",
    llms: [] as string[],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  // Show loading state while Clerk is checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center py-12 text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Sign In Required</h1>
            <p className="text-gray-400 mb-6">
              You need to sign in to create a prompt
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-600 hover:to-gray-800 border border-gray-600 transition-all">
                Sign In
              </button>
            </SignInButton>
            <div className="mt-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLLMToggle = (llmId: string) => {
    setError(null); // Clear error when user interacts
    setFormData((prev) => ({
      ...prev,
      llms: prev.llms.includes(llmId)
        ? prev.llms.filter((id) => id !== llmId)
        : [...prev.llms, llmId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.categoryId) {
      setError("Please select a category");
      return;
    }

    if (formData.llms.length === 0) {
      setError("Please select at least one LLM");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!formData.text.trim()) {
      setError("Please enter prompt text");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          text: formData.text,
          tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          categoryId: formData.categoryId || null,
          llms: formData.llms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create prompt");
      }

      const prompt = await response.json();

      // Invalidate the prompts list cache so it refetches
      queryClient.invalidateQueries({ queryKey: ["prompts"] });

      router.push(`/prompt/${prompt.id}`);
    } catch (error) {
      console.error("Error creating prompt:", error);
      setError(error instanceof Error ? error.message : "Failed to create prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Create New Prompt</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-300">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-white"
            >
              <option value="">Select a category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              LLMs Tested * (Select one or more)
            </label>
            <div className={`grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 bg-black border rounded-md ${
              error && formData.llms.length === 0 ? "border-red-600" : "border-gray-700"
            }`}>
              {LLMS.map((llm) => (
                <button
                  key={llm.id}
                  type="button"
                  onClick={() => handleLLMToggle(llm.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                    formData.llms.includes(llm.id)
                      ? "bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600"
                      : "bg-gray-900 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center p-0.5">
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
                  <span className="text-sm text-gray-300">{llm.name}</span>
                </button>
              ))}
            </div>
            {formData.llms.length === 0 && (
              <p className={`text-xs mt-1 ${error ? "text-red-400" : "text-gray-500"}`}>
                Please select at least one LLM
              </p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-white placeholder-gray-500"
              placeholder="Enter prompt title"
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium mb-2 text-gray-300">
              Prompt Text
            </label>
            <textarea
              id="text"
              required
              rows={6}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-white placeholder-gray-500"
              placeholder="Enter your prompt here..."
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2 text-gray-300">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-white placeholder-gray-500"
              placeholder="e.g. creative, technical, marketing"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-600 hover:to-gray-800 border border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Prompt"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-black border border-gray-700 text-gray-300 rounded-md hover:border-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
