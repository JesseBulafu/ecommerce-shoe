import Card from "./Card";
import { getRecommendedProducts } from "@/lib/actions/product";

interface Props {
  productId: string;
}

/**
 * Async server component — fetches and renders recommended products.
 * Intended to be wrapped in a <Suspense> boundary by the page.
 * Returns null when there are no related products or all images are missing.
 */
export default async function RecommendedProductsSection({ productId }: Props) {
  const recommended = await getRecommendedProducts(productId);

  // Filter out products that have no image (ensures no broken img elements)
  const valid = recommended.filter((p) => p.image !== null);

  if (!valid.length) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {valid.map((p) => (
        <Card
          key={p.id}
          href={`/products/${p.id}`}
          image={p.image!}
          title={p.name}
          description={p.description}
          price={p.price}
          badge={p.badge ?? undefined}
        />
      ))}
    </div>
  );
}
