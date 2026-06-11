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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Sign In Required</h3>
            <p className="text-red-800 text-sm mt-1">
              Please sign in to view your orders.
            </p>
            <CustomButton
              onClick={() => router.push("/login")}
              className="mt-4 h-10 rounded-lg"
            >
              Sign In
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Orders</h3>
          <p className="text-red-800 text-sm mt-1">
            {errorMessage || "An error occurred while loading your orders."}
          </p>
        </div>
      </div>
    </div>
  );
}
