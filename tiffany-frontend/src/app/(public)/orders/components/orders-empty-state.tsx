import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";

interface OrdersEmptyStateProps {
  hasFilters: boolean;
}

export function OrdersEmptyState({ hasFilters }: OrdersEmptyStateProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? "No Orders Found" : "No Orders Yet"}
      </h3>
      <p className="text-muted-foreground mb-6">
        {hasFilters
          ? "No orders found with the selected filters. Try a different filter."
          : "You haven't placed any orders yet. Start shopping now!"}
      </p>
      <CustomButton
        onClick={() => router.push("/menu")}
        className="rounded-xl h-11 px-6"
      >
        Browse Menu
      </CustomButton>
    </div>
  );
}
