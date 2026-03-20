import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const SHOES_DIR = path.join(process.cwd(), "public", "shoes");
const UPLOADS_DIR = path.join(process.cwd(), "static", "uploads", "shoes");

// ─── Seed Data ───────────────────────────────────────────────────────────────

const genderData = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Unisex", slug: "unisex" },
];

const colorData = [
  { name: "Black", slug: "black", hexCode: "#000000" },
  { name: "White", slug: "white", hexCode: "#FFFFFF" },
  { name: "Red", slug: "red", hexCode: "#FF0000" },
  { name: "Blue", slug: "blue", hexCode: "#0000FF" },
  { name: "Grey", slug: "grey", hexCode: "#808080" },
  { name: "Green", slug: "green", hexCode: "#008000" },
  { name: "Orange", slug: "orange", hexCode: "#FFA500" },
  { name: "Pink", slug: "pink", hexCode: "#FFC0CB" },
];

const sizeData = [
  { name: "US 6", slug: "us-6", sortOrder: 1 },
  { name: "US 7", slug: "us-7", sortOrder: 2 },
  { name: "US 8", slug: "us-8", sortOrder: 3 },
  { name: "US 9", slug: "us-9", sortOrder: 4 },
  { name: "US 10", slug: "us-10", sortOrder: 5 },
  { name: "US 11", slug: "us-11", sortOrder: 6 },
  { name: "US 12", slug: "us-12", sortOrder: 7 },
  { name: "US 13", slug: "us-13", sortOrder: 8 },
];

const brandData = [{ name: "Nike", slug: "nike", logoUrl: null }];

const categoryData = [
  { name: "Running", slug: "running" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Basketball", slug: "basketball" },
  { name: "Training", slug: "training" },
  { name: "Skateboarding", slug: "skateboarding" },
];

const collectionData = [
  { name: "Summer '25", slug: "summer-25" },
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Best Sellers", slug: "best-sellers" },
];

const productData = [
  {
    name: "Nike Air Max 90",
    description:
      "The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays, and classic TPU accents.",
    category: "running",
    gender: "men",
    basePrice: "130.00",
    collections: ["best-sellers"],
  },
  {
    name: "Nike Air Force 1 '07",
    description:
      "The radiance lives on in the Nike Air Force 1 '07, the b-ball OG with soft leather, bold colors, and timeless style.",
    category: "lifestyle",
    gender: "unisex",
    basePrice: "115.00",
    collections: ["best-sellers", "new-arrivals"],
  },
  {
    name: "Nike Dunk Low Retro",
    description:
      "Created for the hardwood but taken to the streets, this '80s basketball icon returns with classic details and court-ready colors.",
    category: "lifestyle",
    gender: "men",
    basePrice: "110.00",
    collections: ["best-sellers"],
  },
  {
    name: "Nike Air Jordan 1 Retro High OG",
    description:
      "The Air Jordan 1 Retro High remakes the classic sneaker with new colors and premium materials, channeling icons of the past.",
    category: "basketball",
    gender: "men",
    basePrice: "180.00",
    collections: ["new-arrivals"],
  },
  {
    name: "Nike ZoomX Vaporfly NEXT% 3",
    description:
      "Continuing to help shatter expectations, the Nike ZoomX Vaporfly NEXT% 3 is designed for the record-breaking speed you need.",
    category: "running",
    gender: "unisex",
    basePrice: "260.00",
    collections: ["new-arrivals"],
  },
  {
    name: "Nike Pegasus 41",
    description:
      "Responsive cushioning in the Pegasus provides an energized ride for everyday road running with a sleek, breathable design.",
    category: "running",
    gender: "men",
    basePrice: "140.00",
    collections: ["summer-25"],
  },
  {
    name: "Nike Blazer Mid '77 Vintage",
    description:
      "In the '77 Blazer, classic basketball styling meets vintage vibes. Exposed foam on the tongue and a crisp leather upper add retro flair.",
    category: "lifestyle",
    gender: "unisex",
    basePrice: "105.00",
    collections: ["best-sellers"],
  },
  {
    name: "Nike Air Max 270",
    description:
      "Nike's first lifestyle Air Max brings you style, comfort, and big attitude with the largest-ever Max Air unit for a super-soft ride.",
    category: "lifestyle",
    gender: "women",
    basePrice: "160.00",
    collections: ["summer-25"],
  },
  {
    name: "Nike Air Max Plus",
    description:
      "The Nike Air Max Plus features flowing lines, a bold gradient upper, and Tuned Air cushioning for a ride that's soft and bouncy.",
    category: "lifestyle",
    gender: "men",
    basePrice: "175.00",
    collections: ["summer-25", "new-arrivals"],
  },
  {
    name: "Nike Free Metcon 5",
    description:
      "The Nike Free Metcon 5 combines flexibility with stability to help you get the most out of your training session.",
    category: "training",
    gender: "men",
    basePrice: "120.00",
    collections: [],
  },
  {
    name: "Nike SB Dunk Low Pro",
    description:
      "The Nike SB Dunk Low Pro features a durable leather upper, Zoom Air cushioning in the heel, and a sticky rubber outsole for great boardfeel.",
    category: "skateboarding",
    gender: "unisex",
    basePrice: "115.00",
    collections: ["new-arrivals"],
  },
  {
    name: "Nike Air Zoom Alphafly NEXT% 3",
    description:
      "Engineered with a new ZoomX foam and a responsive Air Zoom unit, the Alphafly NEXT% 3 delivers unmatched energy return.",
    category: "running",
    gender: "unisex",
    basePrice: "285.00",
    collections: [],
  },
  {
    name: "Nike React Infinity Run 4",
    description:
      "The Nike React Infinity Run 4 provides a smooth, stable ride for daily training while helping reduce the risk of injury.",
    category: "running",
    gender: "women",
    basePrice: "160.00",
    collections: ["summer-25"],
  },
  {
    name: "Nike Air Huarache",
    description:
      "The Nike Air Huarache brings back the revolutionary '91 design with its neoprene sleeve and bold style. Lightweight, comfortable, iconic.",
    category: "lifestyle",
    gender: "men",
    basePrice: "130.00",
    collections: ["best-sellers"],
  },
  {
    name: "Nike Metcon 9",
    description:
      "The Nike Metcon 9 is the gold standard for weight training shoes, delivering the stable, durable platform you need to conquer any WOD.",
    category: "training",
    gender: "unisex",
    basePrice: "150.00",
    collections: [],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const shoeImages = [
  "shoe-5.avif",
  "shoe-6.avif",
  "shoe-7.avif",
  "shoe-8.avif",
  "shoe-9.avif",
  "shoe-10.avif",
  "shoe-11.avif",
  "shoe-12.avif",
  "shoe-13.avif",
  "shoe-14.avif",
  "shoe-15.avif",
];

// ─── Seed Function ───────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Copy images to static/uploads
  console.log("📸 Copying shoe images to static/uploads/shoes...");
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  let copied = 0;
  for (const img of shoeImages) {
    const src = path.join(SHOES_DIR, img);
    const dest = path.join(UPLOADS_DIR, img);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      copied++;
    } else {
      console.warn(`   ⚠ Missing source image: ${src}`);
    }
  }
  console.log(`   Copied ${copied}/${shoeImages.length} images\n`);

  // Clear existing ecommerce data (respecting FK order)
  console.log("🗑️  Clearing existing data...");
  await db.delete(schema.productCollections);
  await db.delete(schema.cartItems);
  await db.delete(schema.orderItems);
  await db.delete(schema.payments);
  await db.delete(schema.orders);
  await db.delete(schema.carts);
  await db.delete(schema.reviews);
  await db.delete(schema.wishlists);
  await db.delete(schema.coupons);
  await db.delete(schema.addresses);
  await db.delete(schema.productImages);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.productCollections).catch(() => {});
  await db.delete(schema.collections);
  await db.delete(schema.categories);
  await db.delete(schema.brands);
  await db.delete(schema.genders);
  await db.delete(schema.colors);
  await db.delete(schema.sizes);
  console.log("   Done\n");

  // Seed genders
  console.log("👤 Seeding genders...");
  const insertedGenders = await db
    .insert(schema.genders)
    .values(genderData)
    .returning();
  const genderMap = Object.fromEntries(
    insertedGenders.map((g) => [g.slug, g])
  );
  console.log(`   Seeded ${insertedGenders.length} genders`);

  // Seed colors
  console.log("🎨 Seeding colors...");
  const insertedColors = await db
    .insert(schema.colors)
    .values(colorData)
    .returning();
  console.log(`   Seeded ${insertedColors.length} colors`);

  // Seed sizes
  console.log("📏 Seeding sizes...");
  const insertedSizes = await db
    .insert(schema.sizes)
    .values(sizeData)
    .returning();
  console.log(`   Seeded ${insertedSizes.length} sizes`);

  // Seed brands
  console.log("🏷️  Seeding brands...");
  const insertedBrands = await db
    .insert(schema.brands)
    .values(brandData)
    .returning();
  const nikeBrand = insertedBrands[0];
  console.log(`   Seeded ${insertedBrands.length} brands`);

  // Seed categories
  console.log("📂 Seeding categories...");
  const insertedCategories = await db
    .insert(schema.categories)
    .values(categoryData)
    .returning();
  const categoryMap = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c])
  );
  console.log(`   Seeded ${insertedCategories.length} categories`);

  // Seed collections
  console.log("📦 Seeding collections...");
  const insertedCollections = await db
    .insert(schema.collections)
    .values(collectionData)
    .returning();
  const collectionMap = Object.fromEntries(
    insertedCollections.map((c) => [c.slug, c])
  );
  console.log(`   Seeded ${insertedCollections.length} collections\n`);

  // Seed products with variants
  console.log("👟 Seeding products with variants...");
  let totalVariants = 0;
  let totalImages = 0;

  for (let i = 0; i < productData.length; i++) {
    const p = productData[i];
    const category = categoryMap[p.category];
    const gender = genderMap[p.gender];

    const [product] = await db
      .insert(schema.products)
      .values({
        name: p.name,
        description: p.description,
        categoryId: category.id,
        genderId: gender.id,
        brandId: nikeBrand.id,
        isPublished: true,
      })
      .returning();

    // Random colors (2-4) and sizes (5-8) per product
    const productColors = getRandomItems(insertedColors, getRandomInt(2, 4));
    const productSizes = getRandomItems(insertedSizes, getRandomInt(5, 8)).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    const productImage = shoeImages[i % shoeImages.length];
    const imageUrl = `/uploads/shoes/${productImage}`;

    // Primary product image
    await db.insert(schema.productImages).values({
      productId: product.id,
      url: imageUrl,
      sortOrder: 0,
      isPrimary: true,
    });
    totalImages++;

    // Per-color images for the first 5 products
    if (i < 5) {
      for (let ci = 0; ci < productColors.length; ci++) {
        const colorImageIdx = (i + ci) % shoeImages.length;
        await db.insert(schema.productImages).values({
          productId: product.id,
          url: `/uploads/shoes/${shoeImages[colorImageIdx]}`,
          sortOrder: ci + 1,
          isPrimary: false,
        });
        totalImages++;
      }
    }

    // Create variants: one per color × size combination
    let firstVariantId: string | null = null;

    for (const color of productColors) {
      for (const size of productSizes) {
        const hasSale = Math.random() < 0.2;
        const salePrice = hasSale
          ? (
              parseFloat(p.basePrice) *
              (1 - getRandomInt(10, 30) / 100)
            ).toFixed(2)
          : null;

        const sku = `NK-${String(i + 1).padStart(2, "0")}-${color.slug.toUpperCase()}-${size.slug.toUpperCase()}`;

        const [variant] = await db
          .insert(schema.productVariants)
          .values({
            productId: product.id,
            sku,
            price: p.basePrice,
            salePrice,
            colorId: color.id,
            sizeId: size.id,
            inStock: getRandomInt(0, 50),
            weight: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)),
            dimensions: {
              length: parseFloat((Math.random() * 5 + 28).toFixed(1)),
              width: parseFloat((Math.random() * 3 + 10).toFixed(1)),
              height: parseFloat((Math.random() * 3 + 8).toFixed(1)),
            },
          })
          .returning();

        if (!firstVariantId) firstVariantId = variant.id;
        totalVariants++;
      }
    }

    // Set default variant
    if (firstVariantId) {
      await db
        .update(schema.products)
        .set({ defaultVariantId: firstVariantId })
        .where(eq(schema.products.id, product.id));
    }

    // Assign to collections
    for (const collSlug of p.collections) {
      const collection = collectionMap[collSlug];
      if (collection) {
        await db.insert(schema.productCollections).values({
          productId: product.id,
          collectionId: collection.id,
        });
      }
    }

    console.log(
      `   [${i + 1}/${productData.length}] ${p.name} — ${productColors.length} colors × ${productSizes.length} sizes`
    );
  }

  console.log(`\n   Total variants: ${totalVariants}`);
  console.log(`   Total images: ${totalImages}\n`);
  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
