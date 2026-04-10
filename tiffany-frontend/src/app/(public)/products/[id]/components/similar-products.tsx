"use client";

import { ProductCard } from "@/components/shared/card/product-card";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

interface SimilarProductsProps {
  products: ProductDetailResponseModel[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold">You May Also Like</h2>
        <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{products.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
