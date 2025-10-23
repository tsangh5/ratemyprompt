"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUser, SignInButton } from "@clerk/nextjs";

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
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    tags: "",
    categoryId: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      if (!response.ok) throw new Error("Failed to create prompt");

      const prompt = await response.json();

      // Invalidate the prompts list cache so it refetches
      queryClient.invalidateQueries({ queryKey: ["prompts"] });

      router.push(`/prompt/${prompt.id}`);
    } catch (error) {
      console.error("Error creating prompt:", error);
      alert("Failed to create prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Create New Prompt</h1>

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
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
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
