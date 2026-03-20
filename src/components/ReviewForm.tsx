"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview, type SubmitReviewResult } from "@/lib/actions/product";

interface Props {
  productId: string;
  /** Whether the user is signed in. Guests see a sign-up prompt instead. */
  isAuthenticated: boolean;
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <span
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="p-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 rounded"
          >
            <Star
              size={22}
              className={
                filled
                  ? "text-dark-900 fill-dark-900"
                  : "text-light-400 fill-light-400"
              }
              aria-hidden
            />
          </button>
        );
      })}
    </span>
  );
}

export default function ReviewForm({ productId, isAuthenticated }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Guest: show sign-up prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2 py-4 border-t border-light-300">
        <p className="text-caption font-jost text-dark-700">
          Want to leave a review?{" "}
          <button
            type="button"
            onClick={() =>
              router.push(
                `/sign-up?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`,
              )
            }
            className="text-dark-900 font-semibold underline underline-offset-2 hover:text-dark-700 transition"
          >
            Sign up
          </button>{" "}
          or{" "}
          <button
            type="button"
            onClick={() =>
              router.push(
                `/sign-in?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`,
              )
            }
            className="text-dark-900 font-semibold underline underline-offset-2 hover:text-dark-700 transition"
          >
            sign in
          </button>{" "}
          to share your thoughts.
        </p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (rating === 0) {
      setMessage("Please select a star rating.");
      return;
    }

    setMessage("");
    startTransition(async () => {
      try {
        const result: SubmitReviewResult = await submitReview(
          productId,
          rating,
          comment,
        );

        if (result.success) {
          setMessage("✓ Review submitted!");
          setRating(0);
          setComment("");
        } else {
          setMessage(result.error ?? "Something went wrong.");
        }
      } catch {
        setMessage("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 py-4 border-t border-light-300">
      <p className="text-caption font-jost font-semibold text-dark-900">
        Write a Review
      </p>

      {/* Star rating */}
      <div className="flex flex-col gap-1">
        <label className="text-footnote font-jost text-dark-700">
          Your rating
        </label>
        <InteractiveStarRating value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="review-comment"
          className="text-footnote font-jost text-dark-700"
        >
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Tell us what you think…"
          className="w-full rounded-lg border border-light-300 bg-light-100 px-3 py-2 text-caption font-jost text-dark-900 placeholder:text-dark-500 focus:border-dark-500 focus:outline-none focus:ring-1 focus:ring-dark-500 transition resize-y"
        />
      </div>

      {/* Feedback message */}
      {message && (
        <p
          className={`text-caption font-jost ${
            message.startsWith("✓") ? "text-green" : "text-red"
          }`}
        >
          {message}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="self-start rounded-full bg-dark-900 px-5 py-2.5 text-caption font-jost font-medium text-light-100 hover:bg-dark-700 disabled:opacity-60 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
      >
        {isPending ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}
