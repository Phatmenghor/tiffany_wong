"use client";

import { PaginatedProductsGrid } from "@/components/shared/grid/paginated-products-grid";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

interface SimilarProductsProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function SimilarProducts({ products, loading, hasMore, onLoadMore }: SimilarProductsProps) {
  const isInitialLoading = loading && products.length === 0;

  if (!isInitialLoading && products.length === 0) return null;

  return (
    <div className="pt-[1.3rem] border-t">
      <div className="flex items-center gap-[0.325rem] mb-[0.8125rem]">
        <h2 className="text-[13px] sm:text-[14px] font-bold">You May Also Like</h2>
        {products.length > 0 && (
          <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-[0.325rem] py-[0.08125rem] rounded-full">
            {products.length}
          </span>
        )}
      </div>
      <PaginatedProductsGrid
        products={products}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        isInitialLoading={isInitialLoading}
        sectionKey="similar"
      />
    </div>
  );
}
