import Card from "@/components/Card";
import { getAllProducts } from "@/lib/actions/product";

export default async function Home() {
  const { products } = await getAllProducts({ page: 1, limit: 8 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-10">
        <h1 className="text-heading-1 font-jost text-dark-900">ARSTRA</h1>
      </section>

      <section>
        <h2 className="text-heading-3 font-jost text-dark-900 mb-6">
          Popular Right Now
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              href={`/products/${product.id}`}
              image={product.image ?? "/shoes/shoe-5.avif"}
              title={product.name}
              description={`${product.description} · ${product.colorCount} colour${product.colorCount !== 1 ? "s" : ""}`}
              price={`$${Number(product.minPrice).toFixed(2)}`}
              badge={product.badge ?? undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
