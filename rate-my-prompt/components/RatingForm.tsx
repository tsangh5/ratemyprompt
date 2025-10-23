"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface RatingFormProps {
  promptId: string;
  onSuccess?: () => void;
}

export function RatingForm({ promptId, onSuccess }: RatingFormProps) {
  const { user, isSignedIn } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    llm: "",
    score: 0,
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      alert("Please sign in to rate prompts");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit rating");
      }

      // Reset form
      setFormData({ llm: "", score: 0, comment: "" });

      if (onSuccess) {
        onSuccess();
      }

      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(error instanceof Error ? error.message : "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">Please sign in to rate this prompt</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">Rate this prompt</h3>

      <div>
        <label htmlFor="llm" className="block text-sm font-medium mb-1">
          LLM Used *
        </label>
        <select
          id="llm"
          required
          value={formData.llm}
          onChange={(e) => setFormData({ ...formData, llm: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select an LLM</option>
          <option value="GPT-4">GPT-4</option>
          <option value="GPT-3.5">GPT-3.5</option>
          <option value="Claude 3 Opus">Claude 3 Opus</option>
          <option value="Claude 3 Sonnet">Claude 3 Sonnet</option>
          <option value="Claude 3 Haiku">Claude 3 Haiku</option>
          <option value="Gemini Pro">Gemini Pro</option>
          <option value="Llama 2">Llama 2</option>
          <option value="Mistral">Mistral</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="score" className="block text-sm font-medium mb-1">
          Score (1-5) *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setFormData({ ...formData, score: num })}
              className={`w-12 h-12 rounded-md font-semibold transition-colors ${
                formData.score === num
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share your thoughts about this prompt..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || formData.score === 0}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}
