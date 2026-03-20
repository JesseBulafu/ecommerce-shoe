"use client";

import Image from "next/image";
import Link from "next/link";
import CardHover from "./animations/CardHover";

interface CardProps {
  image: string;
  title: string;
  description?: string;
  price: string;
  badge?: string;
  /** When provided, the entire card becomes a link to this URL. */
  href?: string;
}

export default function Card({
  image,
  title,
  description,
  price,
  badge,
  href,
}: CardProps) {
  const inner = (
    <>
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f5]">
        {badge && (
          <span className="absolute top-3 left-3 z-10 rounded bg-red px-2 py-0.5 text-caption font-jost text-light-100">
            {badge}
          </span>
        )}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-body-medium font-jost text-[#111111] leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-caption font-jost text-[#757575] line-clamp-2">
            {description}
          </p>
        )}
        <span className="mt-2 text-body-medium font-jost text-[#111111]">
          {price}
        </span>
      </div>
    </>
  );

  const cardClasses = "group flex flex-col overflow-hidden rounded-2xl bg-white border border-[#e5e5e5] shadow-[0_8px_30px_rgba(0,0,0,0.08)]";

  return (
    <CardHover>
      {href ? (
        <Link href={href} className={cardClasses}>
          {inner}
        </Link>
      ) : (
        <div className={cardClasses}>
          {inner}
        </div>
      )}
    </CardHover>
  );
}
