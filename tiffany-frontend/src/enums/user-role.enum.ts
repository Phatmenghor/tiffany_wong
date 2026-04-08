/**
 * User Role Enum
 * Defines the role/permission level of a user
 */
export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.STAFF]: "Staff",
  [UserRole.CUSTOMER]: "Customer",
};
