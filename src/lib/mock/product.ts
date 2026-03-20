/** ---------------------------------------------------------------------------
 * Mock product data — UI-only, no DB or fetching involved.
 * ---------------------------------------------------------------------------*/

export interface MockVariant {
  id: string;
  color: string;
  images: string[];
}

export interface MockSize {
  label: string;
  available: boolean;
}

export interface MockProduct {
  id: string;
  name: string;
  category: string;
  gender: string;
  /** Promotional badge shown on image and top of info panel (e.g. "Highly Rated") */
  badge: string | null;
  price: number;
  compareAtPrice: number | null;
  /** Promo discount text shown below price */
  promoText: string | null;
  description: string;
  specs: string[];
  styleCode: string;
  variants: MockVariant[];
  sizes: MockSize[];
  /**
   * Maps "ColorName:SizeName" → real DB product_variant UUID.
   * Empty for mock/demo products; populated by dbProductToMock for DB products.
   * Used by ProductGallery to call addCartItem with the correct variant ID.
   */
  variantMap: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Shared size run
// ---------------------------------------------------------------------------

const ALL_SIZES: MockSize[] = [
  { label: "5",    available: true  },
  { label: "5.5",  available: true  },
  { label: "6",    available: true  },
  { label: "6.5",  available: true  },
  { label: "7",    available: true  },
  { label: "7.5",  available: true  },
  { label: "8",    available: true  },
  { label: "8.5",  available: true  },
  { label: "9",    available: true  },
  { label: "9.5",  available: true  },
  { label: "10",   available: false },
  { label: "10.5", available: false },
  { label: "11",   available: false },
  { label: "11.5", available: false },
  { label: "12",   available: false },
];

// ---------------------------------------------------------------------------
// Mock catalogue
// ---------------------------------------------------------------------------

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    name: "Nike Air Max 90 SE",
    category: "Women's Shoes",
    gender: "Women",
    badge: "Highly Rated",
    price: 140,
    compareAtPrice: null,
    promoText: "Extra 20% off w/ code SPORT",
    description:
      "The Air Max 90 stays true to its running roots with the iconic Waffle sole. Plus, stitched overlays and textured accents create the '90s look you love. Complete with romantic hues, its visible Air cushioning adds comfort to your journey.",
    specs: [
      "Padded collar",
      "Foam midsole",
      "Shown: Dark Team Red/Platinum Tint/Pure Platinum/White",
      "Style: HM9451-600",
    ],
    styleCode: "HM9451-600",
    variants: [
      {
        id: "v1",
        color: "Dark Team Red",
        images: [
          "/shoes/shoe-5.avif",
          "/shoes/shoe-6.avif",
          "/shoes/shoe-7.avif",
          "/shoes/shoe-8.avif",
          "/shoes/shoe-9.avif",
          "/shoes/shoe-10.avif",
        ],
      },
      {
        id: "v2",
        color: "Black / White",
        images: [
          "/shoes/shoe-11.avif",
          "/shoes/shoe-12.avif",
          "/shoes/shoe-13.avif",
          "/shoes/shoe-14.avif",
          "/shoes/shoe-15.avif",
        ],
      },
      {
        id: "v3",
        color: "Pure Platinum",
        images: [
          "/shoes/shoe-5.avif",
          "/shoes/shoe-7.avif",
          "/shoes/shoe-9.avif",
          "/shoes/shoe-11.avif",
        ],
      },
      {
        id: "v4",
        color: "White / Navy",
        images: [
          "/shoes/shoe-13.avif",
          "/shoes/shoe-14.avif",
          "/shoes/shoe-15.avif",
        ],
      },
      {
        id: "v5",
        color: "Grey Fog",
        images: [
          "/shoes/shoe-6.avif",
          "/shoes/shoe-8.avif",
          "/shoes/shoe-10.avif",
        ],
      },
      {
        id: "v6",
        color: "Obsidian",
        images: [
          "/shoes/shoe-12.avif",
          "/shoes/shoe-13.avif",
        ],
      },
    ],
    sizes: ALL_SIZES,
    variantMap: {},
  },
  {
    id: "2",
    name: "Nike Air Force 1 Mid '07",
    category: "Men's Shoes",
    gender: "Men",
    badge: "Best Seller",
    price: 98.30,
    compareAtPrice: null,
    promoText: null,
    description:
      "The radiance lives on in the Nike Air Force 1 Mid '07, combining classic style with plush comfort for an elevated everyday look.",
    specs: [
      "Mid-top silhouette",
      "Air-sole unit for cushioning",
      "Shown: White / Black",
      "Style: CW2289-111",
    ],
    styleCode: "CW2289-111",
    variants: [
      {
        id: "v7",
        color: "White / Black",
        images: [
          "/shoes/shoe-5.avif",
          "/shoes/shoe-6.avif",
          "/shoes/shoe-7.avif",
          "/shoes/shoe-8.avif",
        ],
      },
      {
        id: "v8",
        color: "Black",
        images: [
          "/shoes/shoe-9.avif",
          "/shoes/shoe-10.avif",
        ],
      },
    ],
    sizes: ALL_SIZES,
    variantMap: {},
  },
  {
    id: "3",
    name: "Nike Court Vision Low Next Nature",
    category: "Men's Shoes",
    gender: "Men",
    badge: "Extra 20% off",
    price: 98.30,
    compareAtPrice: null,
    promoText: "Extra 20% off w/ code SPORT",
    description:
      "Channel '80s basketball style in the Nike Court Vision Low. Casual enough for everyday wear, this shoe lets you live the laid-back life.",
    specs: [
      "Foam midsole",
      "Rubber outsole for durability",
      "Shown: Black / Laser Blue",
      "Style: DH3158-001",
    ],
    styleCode: "DH3158-001",
    variants: [
      {
        id: "v9",
        color: "Black / Laser Blue",
        images: [
          "/shoes/shoe-8.avif",
          "/shoes/shoe-9.avif",
          "/shoes/shoe-10.avif",
          "/shoes/shoe-11.avif",
        ],
      },
    ],
    sizes: ALL_SIZES,
    variantMap: {},
  },
  {
    id: "4",
    name: "Nike Dunk Low Retro",
    category: "Men's Shoes",
    gender: "Men",
    badge: "Extra 10% off",
    price: 98.30,
    compareAtPrice: null,
    promoText: "Extra 10% off w/ code SHOES",
    description:
      "Created for the hardwood, taken to the streets. The Nike Dunk Low Retro returns with a crisp look that's inspired by the game.",
    specs: [
      "Padded, low-cut collar",
      "Foam midsole",
      "Shown: Brazil",
      "Style: DD1391-701",
    ],
    styleCode: "DD1391-701",
    variants: [
      {
        id: "v10",
        color: "Brazil",
        images: [
          "/shoes/shoe-11.avif",
          "/shoes/shoe-12.avif",
          "/shoes/shoe-13.avif",
          "/shoes/shoe-14.avif",
          "/shoes/shoe-15.avif",
        ],
      },
    ],
    sizes: ALL_SIZES,
    variantMap: {},
  },
  {
    id: "5",
    name: "Nike Blazer Mid '77",
    category: "Men's Shoes",
    gender: "Men",
    badge: null,
    price: 105,
    compareAtPrice: null,
    promoText: null,
    description:
      "Vintage meets modern in the Nike Blazer Mid '77. This iconic silhouette delivers clean style with cushioned comfort.",
    specs: [
      "High-top collar",
      "Foam midsole",
      "Style: BQ6806-100",
    ],
    styleCode: "BQ6806-100",
    variants: [
      {
        id: "v11",
        color: "White / Black",
        images: [
          "/shoes/shoe-5.avif",
          "/shoes/shoe-6.avif",
          "/shoes/shoe-7.avif",
        ],
      },
    ],
    sizes: ALL_SIZES,
    variantMap: {},
  },
];

// ---------------------------------------------------------------------------
// "You Might Also Like" — three products shown at bottom of detail page
// ---------------------------------------------------------------------------

export const RELATED_PRODUCTS = [
  {
    id: "2",
    image: "/shoes/shoe-5.avif",
    title: "Nike Air Force 1 Mid '07",
    description: "Men's Shoes",
    colorCount: 6,
    price: "$98.30",
    badge: "Best Seller",
  },
  {
    id: "3",
    image: "/shoes/shoe-8.avif",
    title: "Nike Court Vision Low Next Nature",
    description: "Men's Shoes",
    colorCount: 4,
    price: "$98.30",
    badge: "Extra 20% off",
  },
  {
    id: "4",
    image: "/shoes/shoe-11.avif",
    title: "Nike Dunk Low Retro",
    description: "Men's Shoes",
    colorCount: 8,
    price: "$98.30",
    badge: "Extra 10% off",
  },
];

// ---------------------------------------------------------------------------
// Lookup helper
// ---------------------------------------------------------------------------

export function getProductById(id: string): MockProduct | null {
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}
