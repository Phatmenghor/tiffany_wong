import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";

interface OrdersErrorStateProps {
  errorMessage?: string;
  isUnauthenticated?: boolean;
}

export function OrdersErrorState({
  errorMessage,
  isUnauthenticated,
}: OrdersErrorStateProps) {
  const router = useRouter();

  if (isUnauthenticated) {
    return (
      <div className="rounded-[0.65rem] border border-red-200 bg-red-50 p-[0.975rem]">
        <div className="flex items-start gap-[0.65rem]">
          <AlertCircle className="h-[0.975rem] w-[0.975rem] text-red-600 flex-shrink-0 mt-[0.08125rem]" />
          <div>
            <h3 className="font-semibold text-red-900">Sign In Required</h3>
            <p className="text-red-800 text-[11px] mt-[0.1625rem]">
              Please sign in to view your orders.
            </p>
            <CustomButton
              onClick={() => router.push("/login")}
              className="mt-[0.65rem] h-[1.625rem] rounded-[0.325rem]"
            >
              Sign In
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[0.65rem] border border-red-200 bg-red-50 p-[0.975rem]">
      <div className="flex items-start gap-[0.65rem]">
        <AlertCircle className="h-[0.975rem] w-[0.975rem] text-red-600 flex-shrink-0 mt-[0.08125rem]" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Orders</h3>
          <p className="text-red-800 text-[11px] mt-[0.1625rem]">
            {errorMessage || "An error occurred while loading your orders."}
          </p>
        </div>
      </div>
    </div>
  );
}
