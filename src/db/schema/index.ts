// ─── Auth ────────────────────────────────────────────────────────────────────
export { user } from "./user";
export type { User, NewUser } from "./user";

export { session } from "./session";
export type { Session, NewSession } from "./session";

export { account } from "./account";
export type { Account, NewAccount } from "./account";

export { verification } from "./verification";
export type { Verification, NewVerification } from "./verification";

export { guest } from "./guest";
export type { Guest, NewGuest } from "./guest";

// ─── Filters ─────────────────────────────────────────────────────────────────
export {
  genders,
  insertGenderSchema,
  selectGenderSchema,
  colors,
  insertColorSchema,
  selectColorSchema,
  sizes,
  insertSizeSchema,
  selectSizeSchema,
} from "./filters";
export type {
  Gender,
  NewGender,
  Color,
  NewColor,
  Size,
  NewSize,
} from "./filters";

// ─── Brands ──────────────────────────────────────────────────────────────────
export { brands, insertBrandSchema, selectBrandSchema } from "./brands";
export type { Brand, NewBrand } from "./brands";

// ─── Categories ──────────────────────────────────────────────────────────────
export {
  categories,
  insertCategorySchema,
  selectCategorySchema,
} from "./categories";
export type { Category, NewCategory } from "./categories";

// ─── Products ────────────────────────────────────────────────────────────────
export {
  products,
  insertProductSchema,
  selectProductSchema,
} from "./products";
export type { Product, NewProduct } from "./products";

// ─── Variants & Images ──────────────────────────────────────────────────────
export {
  productVariants,
  productImages,
  insertProductVariantSchema,
  selectProductVariantSchema,
  insertProductImageSchema,
  selectProductImageSchema,
} from "./variants";
export type {
  ProductVariant,
  NewProductVariant,
  ProductImage,
  NewProductImage,
} from "./variants";

// ─── Addresses ───────────────────────────────────────────────────────────────
export {
  addresses,
  addressTypeEnum,
  insertAddressSchema,
  selectAddressSchema,
} from "./addresses";
export type { Address, NewAddress } from "./addresses";

// ─── Reviews ─────────────────────────────────────────────────────────────────
export { reviews, insertReviewSchema, selectReviewSchema } from "./reviews";
export type { Review, NewReview } from "./reviews";

// ─── Wishlists ───────────────────────────────────────────────────────────────
export {
  wishlists,
  insertWishlistSchema,
  selectWishlistSchema,
} from "./wishlists";
export type { Wishlist, NewWishlist } from "./wishlists";

// ─── Carts ───────────────────────────────────────────────────────────────────
export {
  carts,
  cartItems,
  insertCartSchema,
  selectCartSchema,
  insertCartItemSchema,
  selectCartItemSchema,
} from "./carts";
export type { Cart, NewCart, CartItem, NewCartItem } from "./carts";

// ─── Orders ──────────────────────────────────────────────────────────────────
export {
  orders,
  orderItems,
  payments,
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
  insertOrderSchema,
  selectOrderSchema,
  insertOrderItemSchema,
  selectOrderItemSchema,
  insertPaymentSchema,
  selectPaymentSchema,
} from "./orders";
export type {
  Order,
  NewOrder,
  OrderItem,
  NewOrderItem,
  Payment,
  NewPayment,
} from "./orders";

// ─── Coupons ─────────────────────────────────────────────────────────────────
export {
  coupons,
  discountTypeEnum,
  insertCouponSchema,
  selectCouponSchema,
} from "./coupons";
export type { Coupon, NewCoupon } from "./coupons";

// ─── Collections ─────────────────────────────────────────────────────────────
export {
  collections,
  productCollections,
  insertCollectionSchema,
  selectCollectionSchema,
  insertProductCollectionSchema,
  selectProductCollectionSchema,
} from "./collections";
export type {
  Collection,
  NewCollection,
  ProductCollection,
  NewProductCollection,
} from "./collections";

// ─── Relations ───────────────────────────────────────────────────────────────
export * from "./_relations";
