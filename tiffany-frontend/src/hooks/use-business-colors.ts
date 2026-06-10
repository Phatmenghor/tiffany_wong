import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

export function useBusinessColors() {
  return {
    primary: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
    secondary: "#FCD34D",
  };
}
