/**
 * Image Default URLs and Fallbacks
 * Used throughout the application for consistent image handling
 */

export const IMAGE_DEFAULTS = {
  // Primary default images (from Unsplash)
  PLACEHOLDER_MAIN: "https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce",

  // Fallback options
  FALLBACK_1: "https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce",

  // Local fallbacks
  NO_IMAGE: "/assets/image/no-image.png",
  NO_PROFILE: "/assets/image/no-image.png",
  NO_PRODUCT: "/assets/image/no-image.png",
  NO_CATEGORY: "/assets/image/no-image.png",
  NO_BANNER: "/assets/image/no-image.png",
};

/**
 * Get appropriate fallback image based on type
 */
export function getImageFallback(type: "profile" | "product" | "category" | "banner" | "logo" | "default" = "default"): string {
  const fallbacks = {
    profile: IMAGE_DEFAULTS.PLACEHOLDER_MAIN,
    product: IMAGE_DEFAULTS.PLACEHOLDER_MAIN,
    category: IMAGE_DEFAULTS.PLACEHOLDER_MAIN,
    banner: IMAGE_DEFAULTS.PLACEHOLDER_MAIN,
    logo: IMAGE_DEFAULTS.PLACEHOLDER_MAIN,
    default: IMAGE_DEFAULTS.PLACEHOLDER_MAIN,
  };

  return fallbacks[type];
}

/**
 * Check if image URL is valid and not null/empty
 */
export function isValidImageUrl(url?: string | null): boolean {
  return !!url && url.trim().length > 0;
}

/**
 * Get image URL with fallback
 * Returns the provided URL if valid, otherwise returns the appropriate fallback
 */
export function getImageWithFallback(
  url?: string | null,
  type: "profile" | "product" | "category" | "banner" | "logo" | "default" = "default"
): string {
  return isValidImageUrl(url) ? url : getImageFallback(type);
}
