import { useRouter } from "next/navigation";
import { ShoppingCart, ShoppingBag, LogIn } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";

interface CartEmptyStateProps {
  title: string;
  message: string;
  onLogin?: () => void;
  showLogin?: boolean;
}

export function CartEmptyState({
  title,
  message,
  onLogin,
  showLogin,
}: CartEmptyStateProps) {
  const router = useRouter();
  return (
    <PageContainer className="py-16 sm:py-24">
      <div className="max-w-xs mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShoppingCart className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-2.5">
          {showLogin && onLogin && (
            <CustomButton onClick={onLogin} className="w-full gap-2 h-11 rounded-xl">
              <LogIn className="h-4 w-4" />
              Sign In
            </CustomButton>
          )}
          <CustomButton
            variant={showLogin ? "outline" : "default"}
            onClick={() => router.push("/products")}
            className="w-full gap-2 h-11 rounded-xl"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </CustomButton>
        </div>
      </div>
    </PageContainer>
  );
}
