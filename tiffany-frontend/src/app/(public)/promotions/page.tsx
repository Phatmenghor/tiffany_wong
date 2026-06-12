"use client";

import { Flame } from "lucide-react";
import { ProductListPage } from "@/redux/features/main/components/product/product-list-page";

function PromotionsHero() {
  return (
    <div className="rounded-[0.65rem] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-[0.8125rem] sm:p-[1.1375rem] text-white shadow-lg">
      <div className="flex items-center gap-[0.4875rem] mb-[0.1625rem]">
        <div className="flex items-center justify-center w-[1.625rem] h-[1.625rem] rounded-[0.4875rem] bg-white/20">
          <Flame className="h-[0.8125rem] w-[0.8125rem]" />
        </div>
        <h1 className="text-[13px] sm:text-[14px] font-bold">Hot Deals &amp; Promotions</h1>
      </div>
      <p className="text-[11px] text-white/80 pl-13">
        Exclusive discounts and limited-time offers — grab them before they&apos;re gone!
      </p>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <ProductListPage
      basePath="/promotions"
      lockedPromotion={true}
      scrollKey="promotions"
      hero={<PromotionsHero />}
    />
  );
}
