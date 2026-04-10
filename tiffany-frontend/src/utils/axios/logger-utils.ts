/**
 * Logger Utilities
 * Centralized logging for API requests and responses
 */

// Environment detection
const isBrowser = typeof window !== "undefined";
const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

// Colors for console output
const colors = {
  green: isBrowser ? "color: #4caf50" : "\x1b[32m",
  red: isBrowser ? "color: #f44336" : "\x1b[31m",
  yellow: isBrowser ? "color: #ff9800" : "\x1b[33m",
  blue: isBrowser ? "color: #2196f3" : "\x1b[34m",
  purple: isBrowser ? "color: #9c27b0" : "\x1b[35m",
  cyan: isBrowser ? "color: #00bcd4" : "\x1b[36m",
  reset: isBrowser ? "" : "\x1b[0m",
};

/**
 * Format timestamp for better readability
 */
export const formatTimestamp = (): string => {
  const now = new Date();
  return (
    now.toISOString().replace("T", " ").replace("Z", "") +
    ` [${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}]`
  );
};

/**
 * Generate unique request ID
 */
export const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

/**
 * Enhanced function to safely truncate or format request data
 */
export const formatRequestData = (data: unknown): unknown => {
  if (!data) return undefined;

  try {
    const dataStr = JSON.stringify(data);
    // If data is large, provide better structured preview
    if (dataStr.length > 5000) {
      if (Array.isArray(data)) {
        const firstThree = data.slice(0, 3);
        // For arrays, also analyze the structure of first items
        const itemAnalysis = firstThree.map((item) => {
          if (typeof item === "object" && item !== null) {
            return {
              type: Array.isArray(item) ? "Array" : "Object",
              keys: Object.keys(item).length,
              properties:
                Object.keys(item).slice(0, 5).join(", ") +
                (Object.keys(item).length > 5 ? "..." : ""),
            };
          }
          return typeof item;
        });

        return {
          type: "Array",
          length: data.length,
          preview: firstThree,
          itemTypes: itemAnalysis,
          note: `Array truncated (${data.length} items total)`,
        };
      } else if (typeof data === "object" && data !== null) {
        const preview: Record<string, unknown> = {};
        const keys = Object.keys(data as Record<string, unknown>);
        const totalKeys = keys.length;
        const previewKeys = keys.slice(0, 5);

        // Create preview with first few properties
        previewKeys.forEach((key) => {
          preview[key] = (data as Record<string, unknown>)[key];
        });

        // Add analysis of property types
        const propertyTypes: Record<string, string> = {};
        keys.forEach((key) => {
          const value = (data as Record<string, unknown>)[key];
          if (Array.isArray(value)) {
            propertyTypes[key] = `Array[${value.length}]`;
          } else if (value && typeof value === "object") {
            propertyTypes[key] = `Object{${
              Object.keys(value as object).length
            } props}`;
          } else {
            propertyTypes[key] = typeof value;
          }
        });

        return {
          type: "Object",
          keys: totalKeys,
          preview,
          propertyTypes: Object.fromEntries(
            Object.entries(propertyTypes).slice(0, 10)
          ),
          note: `Object truncated (${totalKeys} properties total)`,
        };
      }
      return `[Large data: ${dataStr.length} characters]`;
    }
    return data;
  } catch (err) {
    return `[Unserializable data: ${(err as Error).message}]`;
  }
};

/**
 * Simple logger with request ID and improved timestamp
 */
export const logger = {
  log: (message: string, data?: unknown, requestId?: string): void => {
    // Debug logs removed - use error() or warn() for important messages
  },

  success: (message: string, data?: unknown, requestId?: string): void => {
    // Success logs removed - use error() or warn() for important messages
  },

  error: (message: string, data?: unknown, requestId?: string): void => {
    // Always log errors regardless of environment
    const timestamp = formatTimestamp();
    const logId = requestId ? `[${requestId}] ` : "";
    if (isBrowser) {
      console.log(`%c${timestamp} ${logId}${message}`, colors.red, data || "");
    } else {
      console.log(
        `${colors.red}${timestamp} ${logId}${message}${colors.reset}`,
        data || ""
      );
    }
  },

  warn: (message: string, data?: unknown, requestId?: string): void => {
    // Always log warnings regardless of environment
    const timestamp = formatTimestamp();
    const logId = requestId ? `[${requestId}] ` : "";
    if (isBrowser) {
      console.warn(
        `%c${timestamp} ${logId}${message}`,
        colors.yellow,
        data || ""
      );
    } else {
      console.warn(
        `${colors.yellow}${timestamp} ${logId}${message}${colors.reset}`,
        data || ""
      );
    }
  },

  // New method for request body logs specifically
  requestBody: (
    method: string,
    url: string,
    data: unknown,
    requestId?: string
  ): void => {
    // Request body logs removed
  },
};

export { isDevelopment, colors };
