/**
 * User Domain Types
 * User profile, preferences, settings
 */

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  address?: UserAddress;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  notifications?: NotificationPreferences;
  theme?: "light" | "dark" | "auto";
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  timestamp: string;
}
