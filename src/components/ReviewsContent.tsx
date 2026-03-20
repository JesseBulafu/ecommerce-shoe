import { Star, UserCircle, MessageSquareDashed } from "lucide-react";
import type { ReviewItem } from "@/lib/actions/product";
import { StarRating } from "./CollapsibleSection";

// ---------------------------------------------------------------------------
// Single review card
// ---------------------------------------------------------------------------

function ReviewCard({ review }: { review: ReviewItem }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="flex flex-col gap-2 py-4 first:pt-0">
      {/* Author row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCircle size={20} className="text-dark-500 shrink-0" aria-hidden />
          <span className="text-caption font-jost font-semibold text-dark-900">
            {review.author}
          </span>
        </div>
        <time className="text-footnote font-jost text-dark-500" dateTime={review.createdAt}>
          {date}
        </time>
      </div>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Comment */}
      {review.content && (
        <p className="text-caption font-jost text-dark-700 leading-relaxed">
          {review.content}
        </p>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyReviews() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <MessageSquareDashed size={28} className="text-dark-500" aria-hidden />
      <p className="text-caption font-jost text-dark-500">
        No reviews yet. Be the first to share your thoughts.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewsContent — pure display component (no async, receives data as props)
// ---------------------------------------------------------------------------

interface Props {
  reviews: ReviewItem[];
  /** Rendered below the review list — typically the ReviewForm. */
  formSlot?: React.ReactNode;
}

export default function ReviewsContent({ reviews, formSlot }: Props) {
  return (
    <div>
      {reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <div className="divide-y divide-light-300">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
      {formSlot}
    </div>
  );
}
