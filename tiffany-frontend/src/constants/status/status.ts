export enum Status {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Status configuration with descriptions and helper properties
// Note: Status enum is deprecated in favor of AccountStatus
export const StatusConfig = {
  [Status.ACTIVE]: {
    label: "Active",
    description: "Active",
  },
  [Status.INACTIVE]: {
    label: "Inactive",
    description: "Inactive",
  },
};

export const isActive = (status: Status): boolean => {
  return status === Status.ACTIVE;
};

export const isInactive = (status: Status): boolean => {
  return status === Status.INACTIVE;
};

// AccountStatus aligned with backend User entity
export enum AccountStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  END_WORK = "END_WORK",
  LOCKED = "LOCKED",
}

// Types
export enum ModalMode {
  CREATE_MODE = "create",
  UPDATE_MODE = "update",
}

// UserRole aligned with backend User entity
export enum UserRole {
  ALL = "ALL",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

// Deprecated - use UserRole enum instead
export enum UserPlatformRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

// Deprecated - use UserRole enum instead
export enum BusinessUserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export enum SubscriptionPlanStatus {
  ALL = "ALL",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// UserType aligned with backend User entity
export enum UserGropeType {
  ALL = "ALL",
  OWNER = "OWNER",
  CUSTOMER = "CUSTOMER",
}

// Deprecated - use UserGropeType enum instead
export enum BusinessUserType {
  OWNER = "OWNER",
  CUSTOMER = "CUSTOMER",
}

export enum BusinessStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum SubscriptionStatus {
  ALL = "ALL",
  SUBSCRIBED = "SUBSCRIBED",
  NONE_SUBSCRIBE = "NONE_SUBSCRIBE",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  EXPIRING_SOON = "EXPIRING_SOON",
}

export enum ExchangeRateStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PaymentStatus {
  All = "ALL",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  ONLINE = "ONLINE",
  OTHER = "OTHER",
}

export enum PaymentType {
  SUBSCRIPTION = "SUBSCRIPTION",
  USER_PLAN = "USER_PLAN",
  BUSINESS_RECORD = "BUSINESS_RECORD",
  REFUND = "REFUND",
  OTHER = "OTHER",
}

export enum ProductStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ProductStatus configuration with labels
export const ProductStatusConfig = {
  [ProductStatus.ACTIVE]: {
    label: "Active",
  },
  [ProductStatus.INACTIVE]: {
    label: "Inactive",
  },
};

export enum StockStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

// StockStatus configuration with labels
export const StockStatusConfig = {
  [StockStatus.ENABLED]: {
    label: "Enabled",
  },
  [StockStatus.DISABLED]: {
    label: "Disabled",
  },
};

// Helper function for StockStatus enum
export const getStockStatusLabel = (status: string): string => {
  return StockStatusConfig[status as StockStatus]?.label || status;
};

export enum PromotionType {
  ALL = "ALL",
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  NONE = "NONE",
}
