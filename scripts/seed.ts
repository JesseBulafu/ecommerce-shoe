import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { products } from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const nikeProducts = [
  {
    name: "Nike Air Max 90",
    brand: "Nike",
    description:
      "The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays, and classic TPU accents.",
    price: "130.00",
    image: "/images/air-max-90.png",
    category: "Running",
    stock: 25,
  },
  {
    name: "Nike Air Force 1 '07",
    brand: "Nike",
    description:
      "The radiance lives on in the Nike Air Force 1 '07, the b-ball OG with soft leather, bold colors, and timeless style.",
    price: "115.00",
    image: "/images/air-force-1.png",
    category: "Lifestyle",
    stock: 40,
  },
  {
    name: "Nike Dunk Low Retro",
    brand: "Nike",
    description:
      "Created for the hardwood but taken to the streets, this '80s basketball icon returns with classic details and court-ready colors.",
    price: "110.00",
    image: "/images/dunk-low.png",
    category: "Lifestyle",
    stock: 30,
  },
  {
    name: "Nike Air Jordan 1 Retro High OG",
    brand: "Nike",
    description:
      "The Air Jordan 1 Retro High remakes the classic sneaker with new colors and premium materials, channeling icons of the past.",
    price: "180.00",
    image: "/images/jordan-1-retro.png",
    category: "Basketball",
    stock: 15,
  },
  {
    name: "Nike ZoomX Vaporfly NEXT% 3",
    brand: "Nike",
    description:
      "Continuing to help shatter satisfactions, the Nike ZoomX Vaporfly NEXT% 3 is designed for the record-breaking speed you need.",
    price: "260.00",
    image: "/images/vaporfly.png",
    category: "Running",
    stock: 10,
  },
  {
    name: "Nike Pegasus 41",
    brand: "Nike",
    description:
      "Responsive cushioning in the Pegasus provides an energized ride for everyday road running with a sleek, breathable design.",
    price: "140.00",
    image: "/images/pegasus-41.png",
    category: "Running",
    stock: 35,
  },
  {
    name: "Nike Blazer Mid '77 Vintage",
    brand: "Nike",
    description:
      "In the '77 Blazer, classic basketball styling meets vintage vibes. Exposed foam on the tongue and a crisp leather upper add retro flair.",
    price: "105.00",
    image: "/images/blazer-mid.png",
    category: "Lifestyle",
    stock: 20,
  },
  {
    name: "Nike Air Max 270",
    brand: "Nike",
    description:
      "Nike's first lifestyle Air Max brings you style, comfort, and big attitude with the largest-ever Max Air unit for a super-soft ride.",
    price: "160.00",
    image: "/images/air-max-270.png",
    category: "Lifestyle",
    stock: 22,
  },
];

async function seed() {
  console.log("🌱 Seeding products...");

  await db.delete(products);
  await db.insert(products).values(nikeProducts);

  console.log(`✅ Seeded ${nikeProducts.length} Nike products`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
