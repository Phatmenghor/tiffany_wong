/**
 * Business Settings Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * These are the authoritative frontend defaults. Update this single file to
 * change any of these values across the entire application.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const BUSINESS_SETTINGS_DEFAULTS = {
  /** Business name shown in header, footer, and page titles */
  BUSINESS_NAME: "Tiffany Furniture",

  /**
   * Primary brand color (hex).
   * Changing this value updates the color site-wide — no other files need
   * to be touched.
   */
  PRIMARY_COLOR: "#57823D",

  /**
   * Tax percentage applied to all transactions.
   * 0 = tax-free.
   */
  TAX_PERCENTAGE: 0,
} as const;
