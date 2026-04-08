/**
 * Image Default URLs and Fallbacks
 * Used throughout the application for consistent image handling
 */

export const IMAGE_DEFAULTS = {
  // Local fallback image (no external dependencies)
  NO_IMAGE: "/assets/image/no-image.png",
};

/**
 * Get appropriate fallback image based on type
 */
export function getImageFallback(type: "profile" | "product" | "category" | "banner" | "logo" | "default" = "default"): string {
  // All types use the same local no-image fallback
  return IMAGE_DEFAULTS.NO_IMAGE;
}

/**
 * Check if image URL is valid and not null/empty
 */
export function isValidImageUrl(url?: string | null): boolean {
  return !!url && url.trim().length > 0;
}

/**
 * Get image URL with fallback
 * Returns the provided URL if valid, otherwise returns the local no-image fallback
 */
export function getImageWithFallback(
  url?: string | null,
  type: "profile" | "product" | "category" | "banner" | "logo" | "default" = "default"
): string {
  return isValidImageUrl(url) ? url : getImageFallback(type);
}

