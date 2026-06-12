/**
 * Frontend promotion calculator. Mirrors the backend pricing logic
 * (ProductMapper.isPromotionActive / getFinalPrice) so the edit/create product
 * modal can preview the resulting price without a round-trip, and correctly
 * distinguish active vs scheduled (future) vs expired promotions.
 */

export type PromotionStatus = "none" | "active" | "upcoming" | "expired";

export interface PromotionInput {
  price?: number | string | null;
  promotionType?: string | null;
  promotionValue?: number | string | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;
}

export interface PromotionPreview {
  status: PromotionStatus;
  basePrice: number;
  finalPrice: number;
  savings: number;
  savingsPercent: number;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

/** Parse "YYYY-MM-DD" (or an ISO datetime) into a local date at midnight. */
function toDateOnly(value?: string | null): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("T")[0].split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function getPromotionPreview(input: PromotionInput): PromotionPreview {
  const basePrice = toNumber(input.price);
  const value = toNumber(input.promotionValue);
  const type = input.promotionType;

  if (!type || type === "NONE" || value <= 0) {
    return {
      status: "none",
      basePrice,
      finalPrice: basePrice,
      savings: 0,
      savingsPercent: 0,
    };
  }

  const today = toDateOnly(new Date().toISOString())!;
  const from = toDateOnly(input.promotionFromDate);
  const to = toDateOnly(input.promotionToDate);

  let status: PromotionStatus = "active";
  if (from && today < from) status = "upcoming";
  else if (to && today > to) status = "expired";

  // Always compute the deal price from the schedule so the preview shows what
  // the promotion will do, even when it is upcoming.
  let finalPrice = basePrice;
  if (type === "PERCENTAGE") {
    finalPrice = basePrice - (basePrice * value) / 100;
  } else if (type === "FIXED_AMOUNT") {
    finalPrice = basePrice - value;
  }
  finalPrice = round2(Math.max(finalPrice, 0));

  const savings = round2(basePrice - finalPrice);
  const savingsPercent =
    basePrice > 0 ? Math.round((savings / basePrice) * 100) : 0;

  return { status, basePrice, finalPrice, savings, savingsPercent };
}
