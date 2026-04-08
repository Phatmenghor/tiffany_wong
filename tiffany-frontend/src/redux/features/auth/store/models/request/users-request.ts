/**
 * User Request Types - Aligned with Tiffany Cambodia backend
 */

import { BaseGetAllRequest } from "@/utils/common/get-all-request";

/**
 * Create User Request
 */
export interface CreateUserRequest {
  userIdentifier: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  userType: string;
  userRole: string;
  accountStatus?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  remark?: string;
}

/**
 * Update User Request
 */
export interface UpdateUserRequest {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  accountStatus?: string;
  userRole?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  remark?: string;
}

/**
 * Fetch All Users Request
 */
export interface AllUserRequest extends BaseGetAllRequest {
  accountStatuses?: string[];
  userRoles?: string[];
  userTypes?: string[];
}

/**
 * Update User Params (for thunk)
 */
export interface UpdateUserParams {
  userId: string;
  userData: UpdateUserRequest;
}

/**
 * Toggle User Status Request
 */
export interface ToggleUserStatusRequest {
  id: string;
  accountStatus: string;
}

export interface AdminChangePasswordRequest {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}
