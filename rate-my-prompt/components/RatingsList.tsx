"use client";

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

interface RatingsListProps {
  ratings: Rating[];
}

export function RatingsList({ ratings }: RatingsListProps) {
  if (ratings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No ratings yet. Be the first to rate this prompt!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Ratings ({ratings.length})
      </h3>
      {ratings.map((rating) => (
        <div key={rating.id} className="p-4 border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {rating.user?.imageUrl ? (
                <img
                  src={rating.user.imageUrl}
                  alt={rating.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {rating.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">
                  {rating.user?.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">{rating.llm}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {rating.score}
              </span>
              <span className="text-gray-500">/5</span>
            </div>
          </div>
          {rating.comment && (
            <p className="mt-3 text-gray-700">{rating.comment}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(rating.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
