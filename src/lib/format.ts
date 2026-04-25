// Centralized currency + image helpers
export const CURRENCY_SYMBOL = "₹";

export const formatPrice = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return `${CURRENCY_SYMBOL}${n.toLocaleString("en-IN")}`;
};

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

export const productImage = (url?: string | null) =>
  url && url.trim().length > 0 ? url : PLACEHOLDER_IMAGE;
