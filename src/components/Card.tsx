import Image from "next/image";

interface CardProps {
  image: string;
  title: string;
  description?: string;
  price: string;
  badge?: string;
}

export default function Card({
  image,
  title,
  description,
  price,
  badge,
}: CardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-light-100 shadow-sm transition hover:shadow-md">
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-light-200">
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
        <h3 className="text-body-medium font-jost text-dark-900 leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-caption font-jost text-dark-700 line-clamp-2">
            {description}
          </p>
        )}
        <span className="mt-2 text-body-medium font-jost text-dark-900">
          {price}
        </span>
      </div>
    </div>
  );
}
