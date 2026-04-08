/**
 * Auth API Models
 * API request/response models for authentication
 */

export interface UserAuthResponseModel {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  userIdentifier: string;
  email: string;
  fullName: string;
  profileImageUrl?: string;
  userType: string;
  userRole: string;
  accountStatus: string;
}
