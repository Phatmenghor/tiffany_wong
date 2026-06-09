import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";

export function useDashboardState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.dashboard);
  return { ...state, dispatch };
}
