/**
 * User Type Enum
 * Defines the type of user in the system
 */
export enum UserType {
  OWNER = "OWNER",
  CUSTOMER = "CUSTOMER",
}

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.OWNER]: "Owner",
  [UserType.CUSTOMER]: "Customer",
};
