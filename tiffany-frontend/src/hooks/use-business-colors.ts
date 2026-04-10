import { useAppSelector } from '@/redux/store/hooks';
import { selectBusinessColors } from "@/redux/features/business/store/selectors/business-settings-selector";

/**
 * Hook to get current business colors (primary, secondary, accent)
 * Colors are fetched from Redux business settings
 * Falls back to defaults if not yet loaded
 */
export function useBusinessColors() {
  const colors = useAppSelector(selectBusinessColors);

  return {
    primary: colors.primary,      // #57823D (Green) - Brand color
  };
}
