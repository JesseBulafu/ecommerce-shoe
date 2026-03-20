import Card from "@/components/Card";

const sampleShoes = [
  {
    id: "2",
    image: "/shoes/shoe-5.avif",
    title: "Nike Air Force 1 Mid '07",
    description: "Men's Shoes",
    price: "$98.30",
    badge: "Best Seller",
  },
  {
    id: "4",
    image: "/shoes/shoe-11.avif",
    title: "Nike Dunk Low Retro",
    description: "Men's Shoes",
    price: "$98.30",
    badge: "Extra 10% off",
  },
  {
    id: "1",
    image: "/shoes/shoe-7.avif",
    title: "Nike Air Max 90 SE",
    description: "Women's Shoes",
    price: "$140.00",
    badge: "Highly Rated",
  },
  {
    id: "5",
    image: "/shoes/shoe-6.avif",
    title: "Nike Blazer Mid '77",
    description: "Men's Shoes",
    price: "$105.00",
  },
  {
    id: "3",
    image: "/shoes/shoe-8.avif",
    title: "Nike Court Vision Low Next Nature",
    description: "Men's Shoes",
    price: "$98.30",
    badge: "Extra 20% off",
  },
  {
    id: "1",
    image: "/shoes/shoe-9.avif",
    title: "Nike Air Max 270",
    description: "Women's Shoes",
    price: "$160.00",
    badge: "Best Seller",
  },
  {
    id: "5",
    image: "/shoes/shoe-14.avif",
    title: "Nike ZoomX Vaporfly",
    description: "Road Racing Shoes",
    price: "$260.00",
  },
  {
    id: "2",
    image: "/shoes/shoe-13.avif",
    title: "Nike Air Jordan 1 Retro",
    description: "Men's Shoes",
    price: "$180.00",
  },
];

export default function Home() {
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
          {sampleShoes.map((shoe, i) => (
            <Card key={`${shoe.id}-${i}`} href={`/products/${shoe.id}`} {...shoe} />
          ))}
        </div>
      </section>
    </div>
  );
}
