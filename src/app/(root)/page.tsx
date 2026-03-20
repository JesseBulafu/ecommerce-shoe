import Card from "@/components/Card";
import HeroSection from "@/components/animations/HeroSection";
import Marquee from "@/components/animations/Marquee";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerGrid from "@/components/animations/StaggerGrid";
import { formatPrice } from "@/lib/utils/currency";
import { getAllProducts } from "@/lib/actions/product";

export default async function Home() {
  const { products } = await getAllProducts({ page: 1, limit: 8 });

  return (
    <>
      {/* Scrolling marquee banner */}
      <Marquee
        text="FREE SHIPPING ON ORDERS OVER UGX 180,000"
        className="bg-dark-900 py-2.5 text-caption font-jost text-light-100 tracking-widest"
        speed={50}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10">
          <HeroSection title="ARSTRA" />
          <ScrollReveal delay={0.8} from="left">
            <p className="mt-4 text-lead font-jost text-dark-700 max-w-lg">
              Step into the future of sneakers. Premium designs crafted for comfort and style.
            </p>
          </ScrollReveal>
        </section>

        <section>
          <ScrollReveal delay={0.5}>
            <h2 className="text-heading-3 font-jost text-dark-900 mb-6">
              Popular Right Now
            </h2>
          </ScrollReveal>
          <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                href={`/products/${product.id}`}
                image={product.image ?? "/shoes/shoe-5.avif"}
                title={product.name}
                description={`${product.description} · ${product.colorCount} colour${product.colorCount !== 1 ? "s" : ""}`}
                price={formatPrice(product.minPrice)}
                badge={product.badge ?? undefined}
              />
            ))}
          </StaggerGrid>
        </section>
      </div>
    </>
  );
}
