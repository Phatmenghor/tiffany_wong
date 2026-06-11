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
    <PageContainer className="py-[2.6rem] sm:py-[3.9rem]">
      <div className="max-w-xs mx-auto text-center">
        <div className="w-[3.25rem] h-[3.25rem] rounded-[0.65rem] bg-primary/10 flex items-center justify-center mx-auto mb-[0.8125rem] shadow-sm">
          <ShoppingCart className="h-[1.625rem] w-[1.625rem] text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-[0.8125rem] font-bold mb-[0.325rem]">{title}</h1>
        <p className="text-[0.56875rem] text-muted-foreground mb-[0.975rem] leading-relaxed">{message}</p>
        <div className="flex flex-col gap-[0.40625rem]">
          {showLogin && onLogin && (
            <CustomButton onClick={onLogin} className="w-full gap-[0.325rem] h-[1.7875rem] rounded-[0.4875rem]">
              <LogIn className="h-[0.65rem] w-[0.65rem]" />
              Sign In
            </CustomButton>
          )}
          <CustomButton
            variant={showLogin ? "outline" : "default"}
            onClick={() => router.push("/products")}
            className="w-full gap-[0.325rem] h-[1.7875rem] rounded-[0.4875rem]"
          >
            <ShoppingBag className="h-[0.65rem] w-[0.65rem]" />
            Browse Products
          </CustomButton>
        </div>
      </div>
    </PageContainer>
  );
}
