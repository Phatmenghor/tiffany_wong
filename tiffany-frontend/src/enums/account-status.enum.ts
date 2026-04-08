/**
 * Account Status Enum
 * Defines the account status of a user
 */
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: "Active",
  [AccountStatus.INACTIVE]: "Inactive",
};
