import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allProducts = await db.select().from(products);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ecommerce Shoe Store
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Premium Nike sneakers — browse the latest collection.
        </p>
      </section>

      {allProducts.length === 0 ? (
        <p className="text-center text-gray-400">
          No products yet. Run{" "}
          <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono">
            npm run db:seed
          </code>{" "}
          to add sample items.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
