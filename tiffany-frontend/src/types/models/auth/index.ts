/**
 * Authentication Domain Types
 * User authentication, tokens, permissions, roles
 */

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  userType: UserType;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export type UserType = "CUSTOMER" | "OWNER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// Token Types
export interface TokenPayload {
  sub: string;
  email: string;
  userType: UserType;
  iat: number;
  exp: number;
}

// Auth Response Types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface SignupResponse {
  id: string;
  email: string;
  message: string;
}

// Auth State Types
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
