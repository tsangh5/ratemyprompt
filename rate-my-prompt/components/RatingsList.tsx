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
      <div className="text-center text-gray-400 py-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg">
        No ratings yet. Be the first to rate this prompt!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Ratings ({ratings.length})
      </h3>
      {ratings.map((rating) => (
        <div key={rating.id} className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {rating.user?.imageUrl ? (
                <img
                  src={rating.user.imageUrl}
                  alt={rating.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center">
                  <span className="text-gray-300 font-semibold">
                    {rating.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-white">
                  {rating.user?.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">{rating.llm}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {rating.score}
              </span>
              <span className="text-gray-500">/5</span>
            </div>
          </div>
          {rating.comment && (
            <p className="mt-3 text-gray-300">{rating.comment}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {new Date(rating.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
