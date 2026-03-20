/** Format a numeric price as Ugandan Shillings. */
export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `UGX ${Math.round(num).toLocaleString("en-UG")}`;
}

/** Conversion rate: 1 USD = 3,600 UGX */
export const USD_TO_UGX = 3600;

/** Standard delivery fee in UGX */
export const DELIVERY_FEE = 7200;
