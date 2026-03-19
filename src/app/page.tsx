import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";

const sampleShoes = [
  {
    image: "/shoes/shoe-1.jpg",
    title: "Nike Air Force 1 Mid '07",
    description: "Men's Shoes",
    price: "$130.00",
    badge: "Best Seller",
  },
  {
    image: "/shoes/shoe-2.webp",
    title: "Nike Dunk Low Retro",
    description: "Men's Shoes",
    price: "$110.00",
  },
  {
    image: "/shoes/shoe-3.webp",
    title: "Nike Air Max 90",
    description: "Women's Shoes",
    price: "$130.00",
    badge: "Best Seller",
  },
  {
    image: "/shoes/shoe-4.webp",
    title: "Nike Pegasus 41",
    description: "Men's Running Shoes",
    price: "$140.00",
  },
  {
    image: "/shoes/shoe-5.avif",
    title: "Nike Blazer Mid '77",
    description: "Men's Shoes",
    price: "$105.00",
  },
  {
    image: "/shoes/shoe-6.avif",
    title: "Nike Air Max 270",
    description: "Women's Shoes",
    price: "$160.00",
    badge: "Best Seller",
  },
  {
    image: "/shoes/shoe-7.avif",
    title: "Nike ZoomX Vaporfly",
    description: "Road Racing Shoes",
    price: "$260.00",
  },
  {
    image: "/shoes/shoe-8.avif",
    title: "Nike Air Jordan 1 Retro",
    description: "Men's Shoes",
    price: "$180.00",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10">
          <h1 className="text-heading-1 font-jost text-dark-900">Nike</h1>
        </section>

        <section>
          <h2 className="text-heading-3 font-jost text-dark-900 mb-6">
            Popular Right Now
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sampleShoes.map((shoe) => (
              <Card key={shoe.title} {...shoe} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}