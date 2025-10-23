"use client";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const { data: prompts } = useQuery({
    queryKey: ["prompts"],
    queryFn: () => fetch("/api/prompts").then((r) => r.json()),
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Rate My Prompt</h1>
      <div className="mt-6 grid gap-4">
        {prompts?.map((p: any) => (
          <article key={p.id} className="p-4 border rounded">
            <h2 className="font-semibold">{p.title}</h2>
            <pre className="whitespace-pre-wrap mt-2">{p.text}</pre>
            <div className="text-sm mt-2">Tags: {p.tags.join(", ")}</div>
            <div className="mt-2">Avg score: {computeAvg(p.ratings)}</div>
          </article>
        ))}
      </div>
    </main>
  );
}

function computeAvg(ratings: any[]) {
  if (!ratings || ratings.length === 0) return "—";
  return (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(2);
}
