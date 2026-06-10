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
  if (products.length === 0 && !loading) return null;

  return (
    <div className="pt-8 border-t">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold">You May Also Like</h2>
        {products.length > 0 && (
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        )}
      </div>
      <PaginatedProductsGrid
        products={products}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        sectionKey="similar"
      />
    </div>
  );
}
