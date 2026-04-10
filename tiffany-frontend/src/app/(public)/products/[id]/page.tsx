"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchPublicProductById, fetchPublicProducts } from "@/redux/features/main/store/thunks/public-product-thunks";
import { clearSelectedProduct } from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import { toggleFavorite } from "@/redux/features/main/store/thunks/favorite-thunks";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";
import { ProductDetailResponseModel, ProductSize } from "@/redux/features/business/store/models/response/product-response";
import { useScrollToTop } from "@/hooks/use-scroll-restoration";
import { getSizeQuantity } from "@/utils/common/quantity-utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { ProductImageGallery } from "./components/product-image-gallery";
import { ProductInfo } from "./components/product-info";
import { ProductActionsSection } from "./components/product-actions-section";
import { SimilarProducts } from "./components/similar-products";
import { ImageLightbox } from "./components/image-lightbox";
import { ProductDetailSkeleton } from "./components/product-detail-skeleton";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { dispatch, selectedProduct, loading, error } = usePublicProductState();
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const productId = params.id as string;
  const product = selectedProduct;
  const isLoading = loading.detail;

  useScrollToTop();

  const [similarProducts, setSimilarProducts] = useState<ProductDetailResponseModel[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ── Pending qty state for sized products (modal-like flow, no immediate API) ──
  const [pendingQuantities, setPendingQuantities] = useState<Map<string, number>>(new Map());
  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [clearingSize, setClearingSize] = useState<string | null>(null);

  // ── Favorite sync ──
  const isFavoritedFromStore = favLoaded && product ? favoriteItems.some((item) => item.id === product.id) : product?.isFavorited ?? false;
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);

  // Get quantity for a size - standardized naming
  // Returns: quantity from Redux cart if available, otherwise from API quantity
  const getQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!product) return 0;
      const cartItem = cartItems.find(
        (item) => item.productId === product.id && item.productSizeId === sizeId
      );
      // Use Redux cart state if available (authoritative during session)
      if (cartItem) return cartItem.quantity;

      // Fallback to API response quantity
      if (sizeId) {
        const size = product.sizes?.find((s) => s.id === sizeId);
        return getSizeQuantity(size);
      }
      // For unsized products
      return product.quantity || 0;
    },
    [cartItems, product]
  );

  // Get display quantity - shows pending edits if any, otherwise actual quantity
  // Standard naming: displayQuantity = UI quantity (includes pending/unsaved edits)
  const getDisplayQuantity = useCallback(
    (sizeId: string | null) => {
      const key = sizeId || "no_size";
      // If user made unsaved edits, show those (pendingQuantity)
      if (pendingQuantities.has(key)) return pendingQuantities.get(key)!;
      // Otherwise show actual quantity from cart/API
      return getQuantityForSize(sizeId);
    },
    [pendingQuantities, getQuantityForSize]
  );

  // Reset pending state when product changes
  useEffect(() => {
    setPendingQuantities(new Map());
    setModifiedSizes(new Set());
  }, [product?.id]);

  // Build image list
  const allImages = product
    ? [
        { id: "main", imageUrl: sanitizeImageUrl(product.mainImageUrl, appImages.NoImage) },
        ...(product.images || []).map((img) => ({
          id: img.id,
          imageUrl: sanitizeImageUrl(img.imageUrl, appImages.NoImage),
        })),
      ]
    : [];

  // Guard against double-fetch
  const fetchedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!productId || fetchedIdRef.current === productId) return;
    fetchedIdRef.current = productId;
    dispatch(clearSelectedProduct());
    dispatch(fetchPublicProductById(productId));
  }, [productId, dispatch]);

  // Sync image + size when product loads
  useEffect(() => {
    if (!product) return;
    setSelectedImage(sanitizeImageUrl(product.mainImageUrl, appImages.NoImage));
    setCurrentImageIndex(0);
    setImageLoaded(false);
    setSelectedSize(product.hasSizes && product.sizes?.length ? product.sizes[0] : null);
  }, [product?.id]);

  // Fetch similar products
  const fetchedSimilarRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product?.id || fetchedSimilarRef.current === product.id) return;
    fetchedSimilarRef.current = product.id;
    dispatch(
      fetchPublicProducts({
        pageNo: 1,
        pageSize: 6,
        categoryId: product.categoryId || undefined,
        statuses: ["ACTIVE"],
      })
    )
      .unwrap()
      .then((res) => {
        setSimilarProducts(
          (res.content || [])
            .filter((p: any) => p.id !== productId)
            .slice(0, 4)
        );
      })
      .catch(() => {});
  }, [product?.id, product?.categoryId, productId, dispatch]);

  const selectImage = (url: string, index: number) => {
    setCurrentImageIndex(index);
    if (url !== selectedImage) {
      setSelectedImage(url);
      setImageLoaded(false);
    }
  };

  const prevImage = () => {
    const idx = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    selectImage(allImages[idx].imageUrl, idx);
  };

  const nextImage = () => {
    const idx = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
    selectImage(allImages[idx].imageUrl, idx);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const prevLightbox = () => setLightboxIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextLightbox = () => setLightboxIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const getDisplayPrice = () => selectedSize?.finalPrice ?? product?.displayPrice ?? 0;
  const getOriginalPrice = () => {
    if (selectedSize?.hasPromotion) return selectedSize.price;
    if (product?.hasPromotion && product.displayOriginPrice) return product.displayOriginPrice;
    return null;
  };
  const hasDiscount = selectedSize ? selectedSize.hasPromotion : product?.hasPromotion;
  const discountPercent = (() => {
    const orig = getOriginalPrice();
    if (!orig) return 0;
    return Math.round(((orig - getDisplayPrice()) / orig) * 100);
  })();

  // ── Pending qty handlers (sized products) ──────────────────────────────
  const handlePendingQtyChange = useCallback(
    (sizeId: string | null, newQty: number) => {
      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }
      const key = sizeId || "no_size";
      const currentQuantity = getQuantityForSize(sizeId);
      setPendingQuantities((prev) => {
        const n = new Map(prev);
        n.set(key, newQty);
        return n;
      });
      setModifiedSizes((prev) => {
        const n = new Set(prev);
        if (newQty === currentQuantity) n.delete(key);
        else n.add(key);
        return n;
      });
    },
    [isAuthenticated, getQuantityForSize]
  );

  const handleClearSize = useCallback(
    async (sizeId: string | null) => {
      if (!product) return;
      const key = sizeId || "no_size";
      const currentQty = getQuantityForSize(sizeId);
      if (currentQty === 0) {
        setPendingQuantities((prev) => {
          const n = new Map(prev);
          n.delete(key);
          return n;
        });
        setModifiedSizes((prev) => {
          const n = new Set(prev);
          n.delete(key);
          return n;
        });
        return;
      }
      cartDispatch(
        updateLocalCartItem({
          productId: product.id,
          productSizeId: sizeId,
          quantity: 0,
        })
      );
      setPendingQuantities((prev) => {
        const n = new Map(prev);
        n.delete(key);
        return n;
      });
      setModifiedSizes((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
      setClearingSize(key);
      try {
        await cartDispatch(
          updateCartItem({
            productId: product.id,
            productSizeId: sizeId,
            quantity: 0,
          })
        ).unwrap();
        showToast.success("Removed from cart");
      } catch (err: any) {
        showToast.error(err?.message || "Failed to remove");
      } finally {
        setClearingSize(null);
      }
    },
    [product, cartDispatch, getQuantityForSize]
  );

  const handleSave = useCallback(async () => {
    if (!product || modifiedSizes.size === 0) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [];
      const ts = Date.now();
      for (const key of modifiedSizes) {
        const sizeId = key === "no_size" ? null : key;
        const newQty = pendingQuantities.get(key) ?? getQuantityForSize(sizeId);
        const currentQuantity = getQuantityForSize(sizeId);
        if (newQty === currentQuantity) continue;
        if (currentQuantity === 0 && newQty > 0) {
          const size = product.sizes?.find((s) => s.id === sizeId);
          const finalPrice = size?.finalPrice ?? product.displayPrice ?? 0;
          const isPromo = size ? size.hasPromotion : (product.hasPromotion ?? false);
          cartDispatch(
            addLocalCartItem({
              productId: product.id,
              productSizeId: sizeId,
              quantity: newQty,
              productName: product.name,
              productImageUrl: product.mainImageUrl,
              sizeName: size?.name ?? null,
              finalPrice,
              currentPrice: size?.hasPromotion
                ? size.price
                : product.displayOriginPrice ?? finalPrice,
              hasPromotion: isPromo,
              promotionType:
                size?.promotionType ?? product.displayPromotionType ?? null,
              promotionValue:
                size?.promotionValue ?? product.displayPromotionValue ?? null,
              promotionFromDate:
                size?.promotionFromDate ??
                product.displayPromotionFromDate ??
                null,
              promotionToDate:
                size?.promotionToDate ?? product.displayPromotionToDate ?? null,
              optimisticTimestamp: ts,
            })
          );
          promises.push(
            cartDispatch(
              addToCart({
                productId: product.id,
                productSizeId: sizeId,
                quantity: newQty,
                optimisticTimestamp: ts,
              })
            ).unwrap()
          );
        } else {
          cartDispatch(
            updateLocalCartItem({
              productId: product.id,
              productSizeId: sizeId,
              quantity: newQty,
              optimisticTimestamp: ts,
            })
          );
          promises.push(
            cartDispatch(
              updateCartItem({
                productId: product.id,
                productSizeId: sizeId,
                quantity: newQty,
                optimisticTimestamp: ts,
              })
            ).unwrap()
          );
        }
      }
      await Promise.all(promises);
      showToast.success("Cart updated");
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
    } catch (err: any) {
      showToast.error(err?.message || "Failed to update cart");
    } finally {
      setIsSaving(false);
    }
  }, [product, isAuthenticated, modifiedSizes, pendingQuantities, cartDispatch, getQuantityForSize]);

  const handleToggleFavorite = () => {
    if (!product) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setIsFavorited((prev) => !prev);
    setIsTogglingFavorite(true);
    favoriteDispatch(toggleFavorite({ productId: product.id, isFavorited }))
      .unwrap()
      .then(() => {
        setIsTogglingFavorite(false);
      })
      .catch((err: any) => {
        setIsFavorited((prev) => !prev);
        setIsTogglingFavorite(false);
        showToast.error(err?.message || "Failed to update favorites");
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Product",
          url: window.location.href,
        });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied to clipboard");
    }
  };

  if (isLoading || (!product && !error.detail)) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <PageContainer className="py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </PageContainer>
    );
  }

  // Calculate totals for actions section
  const totalCartQtyAllSizes = product.hasSizes
    ? product.sizes?.reduce((sum, s) => sum + getQuantityForSize(s.id), 0) ?? 0
    : getQuantityForSize(null);
  const totalCartValueAllSizes = product.hasSizes
    ? product.sizes?.reduce((sum, s) => sum + s.finalPrice * getQuantityForSize(s.id), 0) ?? 0
    : getDisplayPrice() * getQuantityForSize(null);
  const totalDisplayValueAllSizes = product.hasSizes
    ? product.sizes?.reduce((sum, s) => sum + s.finalPrice * getDisplayQuantity(s.id), 0) ?? 0
    : getDisplayPrice() * getDisplayQuantity(null);
  const totalOrigValueAllSizes = product.hasSizes
    ? product.sizes?.reduce(
        (sum, s) =>
          sum +
          (s.hasPromotion ? s.price : s.finalPrice) * getDisplayQuantity(s.id),
        0
      ) ?? 0
    : (getOriginalPrice() ?? getDisplayPrice()) * getDisplayQuantity(null);
  const hasAnyPromotion = product.hasSizes
    ? product.sizes?.some((s) => s.hasPromotion && getDisplayQuantity(s.id) > 0) ??
      false
    : !!(getOriginalPrice() && getDisplayQuantity(null) > 0);

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-6">
        {/* Back */}
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-5 -ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </CustomButton>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-8 lg:gap-10 mb-16">
          {/* ──── LEFT: Image Gallery ──── */}
          <ProductImageGallery
            mainImageUrl={product.mainImageUrl}
            images={product.images || []}
            productName={product.name}
            imageLoaded={imageLoaded}
            onImageLoad={() => setImageLoaded(true)}
            currentImageIndex={currentImageIndex}
            selectedImage={selectedImage}
            onSelectImage={selectImage}
            onPrevImage={prevImage}
            onNextImage={nextImage}
            onOpenLightbox={openLightbox}
            discountPercent={discountPercent}
            hasDiscount={!!hasDiscount}
          />

          {/* ──── RIGHT: Product Info & Actions ──── */}
          <div className="flex flex-col gap-4">
            <ProductInfo
              categoryName={product.categoryName}
              brandName={product.brandName}
              status={product.status}
              name={product.name}
              displayPrice={getDisplayPrice()}
              originalPrice={getOriginalPrice() || undefined}
              description={product.description}
            />

            <ProductActionsSection
              hasSizes={product.hasSizes}
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              displayQuantity={getDisplayQuantity}
              cartQuantity={getQuantityForSize}
              modifiedSizes={modifiedSizes}
              onQtyChange={handlePendingQtyChange}
              onClearSize={handleClearSize}
              onSave={handleSave}
              isSaving={isSaving}
              clearingSize={clearingSize}
              totalCartQtyAllSizes={totalCartQtyAllSizes}
              totalCartValueAllSizes={totalCartValueAllSizes}
              totalDisplayValueAllSizes={totalDisplayValueAllSizes}
              totalOrigValueAllSizes={totalOrigValueAllSizes}
              hasAnyPromotion={hasAnyPromotion}
              displayPrice={getDisplayPrice()}
              productStatus={product.status}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
              isTogglingFavorite={isTogglingFavorite}
              viewCount={product.viewCount}
              favoriteCount={product.favoriteCount}
              productId={product.id}
            />
          </div>
        </div>

        {/* ── Similar Products ── */}
        <SimilarProducts products={similarProducts} />
      </PageContainer>

      {/* ── Image Lightbox ── */}
      <ImageLightbox
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        images={allImages}
        productName={product.name}
        onClose={() => setLightboxOpen(false)}
        onPrevImage={prevLightbox}
        onNextImage={nextLightbox}
        onSelectImage={setLightboxIndex}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
