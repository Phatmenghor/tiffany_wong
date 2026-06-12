"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/utils/debounce/debounce";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  Square,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { TextField } from "@/components/shared/form-field/text-field";
import { CustomSelect } from "@/components/shared/common/custom-select";
import {
  DataTableWithPagination,
  TableColumn,
} from "@/components/shared/common/data-table";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { useProductState } from "@/redux/features/business/store/state/product-state";
import {
  fetchAllProductAdminService,
  createBulkPromotionsService,
  resetAllPromotionsService,
  resetProductPromotionService,
  resetSelectedPromotionsService,
} from "@/redux/features/business/store/thunks/product-thunks";
import { ConfirmationModal } from "@/components/shared/modal/confirmation-modal";
import { ProductDetailModal } from "@/redux/features/business/components/product-detail-modal";
import {
  setPageNo,
  resetProductPromotionOptimistic,
} from "@/redux/features/business/store/slice/product-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import {
  bulkPromotionSchema,
  BulkPromotionFormData,
} from "@/redux/features/business/store/models/schema/bulk-promotion-schema";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import {
  PROMOTION_TYPES,
  PROMOTION_DEFAULT_DURATION_DAYS,
} from "@/constants/form-options";
import { AppDefault } from "@/constants/app-resource/default/default";
import { bulkPromotionTableColumns } from "@/redux/features/business/table/bulk-promotion-table";
import {
  PRODUCT_STATUS_FILTER,
  PRODUCT_SIZE_FILTER,
} from "@/constants/status/filter-status";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { ProductStatus } from "@/constants/status/status";
import { selectProductStatus } from "@/redux/features/business/store/slice/product-slice";
import {
  setSelectedProducts,
  toggleSelectedProduct,
  clearSelectedProducts,
} from "@/redux/features/business/store/slice/bulk-promotion-slice";
import {
  createBulkPromotionsOptimistic,
  resetSelectedPromotionsOptimistic,
} from "@/redux/features/business/store/slice/product-slice";
import { selectSelectedProductIds } from "@/redux/features/business/store/selectors/bulk-promotion-selector";
import { useBulkPromotionStorageSync } from "@/hooks/useBulkPromotionStorageSync";
import { useBulkPromotionSizesStorageSync } from "@/hooks/useBulkPromotionSizesStorageSync";
import {
  toggleSizeForProduct,
  clearAllSizeSelections,
  selectAllSizesForProduct,
  clearSizesForProduct,
} from "@/redux/features/business/store/slice/promotion-size-selection-slice";
import { selectPromotionSizeSelections } from "@/redux/features/business/store/selectors/promotion-size-selection-selector";

export default function BulkPromotionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { productContent, filters, pagination, isLoading } = useProductState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const selectedProductIdsFromRedux = useAppSelector(selectSelectedProductIds);
  const selectedSizesFromRedux = useAppSelector(selectPromotionSizeSelections);

  // Convert array to Map for efficient lookup
  const selectedProductIds = useMemo(() => {
    return new Map(selectedProductIdsFromRedux.map((id) => [id, true]));
  }, [selectedProductIdsFromRedux]);

  // Convert Redux size selections (arrays) to Map<string, Set<string>> for efficient lookup in table
  const selectedSizes = useMemo(() => {
    const sizeMap = new Map<string, Set<string>>();
    Object.entries(selectedSizesFromRedux).forEach(([productId, sizeArray]) => {
      if (Array.isArray(sizeArray) && sizeArray.length > 0) {
        sizeMap.set(productId, new Set(sizeArray));
      }
    });
    return sizeMap;
  }, [selectedSizesFromRedux]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageSize, setPageSize] = useState<number>(globalPageSize);
  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasPromotionFilter, setHasPromotionFilter] = useState<string>("ALL");
  const [hasSizeFilter, setHasSizeFilter] = useState<string>("ALL");
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Debounce search query for performance (400ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Detail modal state
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    productId: "",
  });

  // Reset promotion modal state
  const [resetPromotionState, setResetPromotionState] = useState({
    isOpen: false,
    product: null as ProductDetailResponseModel | null,
  });

  // Clear selected promotions modal state
  const [showClearSelectedModal, setShowClearSelectedModal] = useState(false);
  const [isClearingSelected, setIsClearingSelected] = useState(false);

  // Helper to set date to 23:59:59 (last second of the day)
  const getDateAt1159PM = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 0);
    return d;
  };

  const form = useForm<BulkPromotionFormData>({
    resolver: zodResolver(bulkPromotionSchema),
    mode: "onBlur",
    defaultValues: {
      productIds: [],
      promotionType: undefined,
      promotionValue: undefined,
      promotionFromDate: getDateAt1159PM(new Date()).toISOString(),
      promotionToDate: getDateAt1159PM(
        new Date(Date.now() + PROMOTION_DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000),
      ).toISOString(),
    },
  });

  // ─── localStorage Sync with Redux (Bulk Promotion Selections) ───
  // Same pattern as POS cart sync - clean and simple!
  const { clearSelections } = useBulkPromotionStorageSync({
    storageKey: "bulk-promotion:selected-products",
    debounceMs: 1000,
    enabled: true,
  });

  // ─── localStorage Sync for Size Selections ───
  const { clearSelections: clearSizeSelections } =
    useBulkPromotionSizesStorageSync({
      storageKey: "bulk-promotion:selected-sizes",
      debounceMs: 1000,
      enabled: true,
    });

  // Fetch products on mount and when filters change
  useEffect(() => {
    let hasSizeValue: boolean | undefined;
    if (hasSizeFilter === "true") {
      hasSizeValue = true;
    } else if (hasSizeFilter === "false") {
      hasSizeValue = false;
    }

    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearchQuery,
        pageNo: 1,
        pageSize: globalPageSize,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        categoryId: selectedCategories?.id,
        hasPromotion:
          hasPromotionFilter === "HAS_PROMOTION"
            ? true
            : hasPromotionFilter === "NO_PROMOTION"
              ? false
              : undefined,
        hasSize: hasSizeValue,
      }),
    );
  }, [
    dispatch,
    globalPageSize,
    filters.status,
    selectedCategories,
    debouncedSearchQuery,
    hasPromotionFilter,
    hasSizeFilter,
  ]);

  // Toggle product selection (and auto-select/deselect all sizes)
  const handleSelectProduct = useCallback(
    (productId: string) => {
      const isCurrentlySelected = selectedProductIds.has(productId);

      // Get the product to access its sizes
      const product = productContent.find((p) => p.id === productId);

      // Always toggle the product regardless of sizes
      dispatch(toggleSelectedProduct(productId));

      if (
        !isCurrentlySelected &&
        product &&
        product.hasSizes &&
        product.sizes
      ) {
        // Selecting product WITH sizes: auto-select all sizes
        const sizeIds = product.sizes.map((s) => s.id);
        dispatch(selectAllSizesForProduct({ productId, sizeIds }));
      } else if (isCurrentlySelected) {
        // Deselecting: clear all sizes for this product (if any)
        dispatch(clearSizesForProduct(productId));
      }
    },
    [dispatch, selectedProductIds, productContent],
  );

  // Toggle size selection for a product
  const handleSizeToggle = useCallback(
    (productId: string, sizeId: string) => {
      // Get current selected sizes for this product
      const currentSizesForProduct = selectedSizes.get(productId);
      const sizeIsCurrentlySelected =
        currentSizesForProduct && currentSizesForProduct.has(sizeId);

      // Check if product is already selected
      const isProductSelected = selectedProductIds.has(productId);

      if (!sizeIsCurrentlySelected) {
        // User is SELECTING a size
        // If product is not selected, auto-select it
        if (!isProductSelected) {
          dispatch(toggleSelectedProduct(productId));
        }
      } else {
        // User is DESELECTING a size
        // Check if this is the last size for this product
        const remainingSizes = currentSizesForProduct
          ? new Set(
              Array.from(currentSizesForProduct).filter((s) => s !== sizeId),
            )
          : new Set();

        // If no more sizes selected for this product, auto-deselect the product
        if (remainingSizes.size === 0 && isProductSelected) {
          dispatch(toggleSelectedProduct(productId));
        }
      }

      // Toggle the size
      dispatch(toggleSizeForProduct({ productId, sizeId }));
    },
    [dispatch, selectedProductIds, selectedSizes],
  );

  // Select/deselect all products on current page (and auto-select/deselect sizes)
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && productContent.length > 0) {
        const currentPageIds = productContent.map((p) => p.id);
        const combined = new Set([
          ...selectedProductIdsFromRedux,
          ...currentPageIds,
        ]);
        dispatch(setSelectedProducts(Array.from(combined)));

        // Auto-select all sizes for newly selected products (only if they have sizes)
        productContent.forEach((product) => {
          if (
            !selectedProductIds.has(product.id) &&
            product.hasSizes &&
            product.sizes
          ) {
            const sizeIds = product.sizes.map((s) => s.id);
            dispatch(
              selectAllSizesForProduct({ productId: product.id, sizeIds }),
            );
          }
        });
      } else {
        const pageIdsSet = new Set(productContent.map((p) => p.id));
        const filtered = selectedProductIdsFromRedux.filter(
          (id) => !pageIdsSet.has(id),
        );
        dispatch(setSelectedProducts(filtered));

        // Clear all sizes for deselected products
        productContent.forEach((product) => {
          if (pageIdsSet.has(product.id)) {
            dispatch(clearSizesForProduct(product.id));
          }
        });
      }
    },
    [selectedProductIdsFromRedux, selectedProductIds, productContent, dispatch],
  );

  // Check if all products on current page are selected
  const allSelected =
    productContent.length > 0 &&
    productContent.every((p) => selectedProductIds.has(p.id));

  // Check if some products are selected
  const someSelected =
    productContent.some((p) => selectedProductIds.has(p.id)) && !allSelected;

  // Filter handlers
  const handleCategoriesChange = (
    categories: CategoriesResponseModel | null,
  ) => {
    setSelectedCategories(categories);
    dispatch(setPageNo(1));
  };

  const handleProductStatusChange = (status: ProductStatus) => {
    dispatch(selectProductStatus(status));
    dispatch(setPageNo(1));
  };

  const handlePromotionFilterChange = (value: string) => {
    setHasPromotionFilter(value);
    dispatch(setPageNo(1));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    dispatch(setPageNo(1));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(setPageNo(1));
  };

  // Clear all selections (for testing/resetting)
  const handleClearAllSelections = () => {
    dispatch(clearSelectedProducts());
    dispatch(clearAllSizeSelections());
    clearSelections();
    clearSizeSelections();
    showToast.success("All selections cleared");
  };

  // Get selected product IDs as array
  const selectedIds = Array.from(selectedProductIds.keys());

  // Handle view product details
  const handleViewDetails = useCallback(
    (product: ProductDetailResponseModel) => {
      setDetailModalState({
        isOpen: true,
        productId: product.id || "",
      });
    },
    [],
  );

  // Handle edit product
  const handleEditProduct = useCallback(
    (product: ProductDetailResponseModel) => {
      // Navigate to product edit or show modal
    },
    [],
  );

  // Handle reset promotion
  const handleResetPromotion = useCallback(
    (product: ProductDetailResponseModel) => {
      setResetPromotionState({
        isOpen: true,
        product: product,
      });
    },
    [],
  );

  // Close detail modal
  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      productId: "",
    });
  };

  // Close reset promotion modal
  const closeResetPromotionModal = () => {
    setResetPromotionState({
      isOpen: false,
      product: null,
    });
  };

  // Confirm reset promotion (single product only)
  const handleConfirmResetPromotion = async () => {
    if (!resetPromotionState.product?.id) return;

    try {
      // Optimistic update - update state immediately
      dispatch(resetProductPromotionOptimistic(resetPromotionState.product.id));

      // Call API and wait for response before closing modal
      await dispatch(resetProductPromotionService(resetPromotionState.product.id)).unwrap();

      showToast.success(
        `Promotion reset for product "${resetPromotionState.product?.name ?? ""}"`,
      );

      // Close modal only after API succeeds
      closeResetPromotionModal();
    } catch (error: any) {
      showToast.error(error?.message || error || "Failed to reset promotion");
      // Modal stays open on error so user can retry
    }
  };

  // Sync selected products to form
  useEffect(() => {
    form.setValue("productIds", selectedIds);
  }, [selectedIds, form]);

  // Watch form values
  const promotionType = form.watch("promotionType");
  const promotionValue = form.watch("promotionValue");

  // Discount display
  const discountDisplay = useMemo(() => {
    if (!promotionType || !promotionValue) return null;
    return promotionType === "PERCENTAGE"
      ? `${promotionValue}%`
      : `$${promotionValue}`;
  }, [promotionType, promotionValue]);

  // Form validity - check required fields manually
  const hasValidPromotionType = !!promotionType;
  const hasValidPromotionValue = promotionValue && promotionValue > 0;
  const hasValidDates =
    form.watch("promotionFromDate") &&
    form.watch("promotionToDate") &&
    new Date(form.watch("promotionFromDate")) <=
      new Date(form.watch("promotionToDate"));
  const hasSelectedProducts = selectedIds.length > 0;

  const isFormValid =
    hasValidPromotionType &&
    hasValidPromotionValue &&
    hasValidDates &&
    hasSelectedProducts;

  // Define table columns using bulk promotion table
  const columns = useMemo<TableColumn<ProductDetailResponseModel>[]>(
    () =>
      bulkPromotionTableColumns({
        selectedProductIds,
        onSelectProduct: handleSelectProduct,
        onSelectAll: handleSelectAll,
        allSelected,
        someSelected,
        isLoading,
        pageNo: filters.pageNo,
        pageSize,
        selectedSizes,
        onSizeToggle: handleSizeToggle,
        onViewDetails: handleViewDetails,
        onEditProduct: handleEditProduct,
        onResetPromotion: handleResetPromotion,
      }),
    [
      selectedProductIds,
      handleSelectProduct,
      handleSelectAll,
      allSelected,
      someSelected,
      isLoading,
      filters.pageNo,
      pageSize,
      selectedSizes,
      handleSizeToggle,
      handleViewDetails,
      handleEditProduct,
      handleResetPromotion,
    ],
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    let hasSizeValue: boolean | undefined;
    if (hasSizeFilter === "true") {
      hasSizeValue = true;
    } else if (hasSizeFilter === "false") {
      hasSizeValue = false;
    }

    dispatch(setPageNo(page));
    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearchQuery,
        pageNo: page,
        pageSize: pageSize,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        categoryId: selectedCategories?.id,
        hasPromotion:
          hasPromotionFilter === "HAS_PROMOTION"
            ? true
            : hasPromotionFilter === "NO_PROMOTION"
              ? false
              : undefined,
        hasSize: hasSizeValue,
      }),
    );
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    let hasSizeValue: boolean | undefined;
    if (hasSizeFilter === "true") {
      hasSizeValue = true;
    } else if (hasSizeFilter === "false") {
      hasSizeValue = false;
    }

    setPageSize(newPageSize);
    dispatch(setPageNo(1));
    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearchQuery,
        pageNo: 1,
        pageSize: newPageSize,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        categoryId: selectedCategories?.id,
        hasPromotion:
          hasPromotionFilter === "HAS_PROMOTION"
            ? true
            : hasPromotionFilter === "NO_PROMOTION"
              ? false
              : undefined,
        hasSize: hasSizeValue,
      }),
    );
  };

  // Handle form submission
  const onSubmit = async (data: BulkPromotionFormData) => {
    if (selectedIds.length === 0) {
      showToast.error("Please select at least one product");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build product size mapping
      const productSizeMapping: Record<string, string[]> = {};
      selectedIds.forEach((productId) => {
        const sizeSet = selectedSizes.get(productId);
        if (sizeSet && sizeSet.size > 0) {
          productSizeMapping[productId] = Array.from(sizeSet);
        }
      });

      // ✅ OPTIMISTIC UPDATE: Update local state immediately
      dispatch(
        createBulkPromotionsOptimistic({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      );

      // ✅ BACKGROUND API CALL: Make API request in background
      const result = await dispatch(
        createBulkPromotionsService({
          productIds: selectedIds,
          promotionType: data.promotionType,
          promotionValue: data.promotionValue,
          promotionFromDate: data.promotionFromDate,
          promotionToDate: data.promotionToDate,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      ).unwrap();

      showToast.success(
        result.message || "Bulk promotion created successfully!",
      );
      // Clear selections after successful creation (keep discount settings for reuse)
      dispatch(clearSelectedProducts());
      dispatch(clearAllSizeSelections());
      clearSelections();

      // Reset form but keep discount type and amount for reuse
      form.reset({
        ...form.getValues(),
        productIds: [],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? (error as Record<string, unknown>).message
            : "Failed to create bulk promotion";

      showToast.error(String(errorMessage));
      // Note: Optimistic update remains in state. User can refresh if needed.
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle apply button click
  const handleApplyClick = async () => {
    // Manually trigger validation first
    const isValidForm = await form.trigger();

    if (!isValidForm) {
      return;
    }

    // Trigger form submission
    await form.handleSubmit(onSubmit)();
  };

  // Handle reset all promotions
  const handleResetAllPromotions = async () => {
    try {
      setIsResetting(true);
      let hasSizeValue: boolean | undefined;
      if (hasSizeFilter === "true") {
        hasSizeValue = true;
      } else if (hasSizeFilter === "false") {
        hasSizeValue = false;
      }

      await dispatch(resetAllPromotionsService()).unwrap();
      showToast.success("All promotions have been reset successfully!");
      setShowResetModal(false);
      // Clear size selections as well
      dispatch(clearAllSizeSelections());
      // Refresh products list
      dispatch(
        fetchAllProductAdminService({
          search: debouncedSearchQuery,
          pageNo: filters.pageNo,
          pageSize: pageSize,
          statuses:
            filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
          categoryId: selectedCategories?.id,
          hasPromotion:
            hasPromotionFilter === "HAS_PROMOTION"
              ? true
              : hasPromotionFilter === "NO_PROMOTION"
                ? false
                : undefined,
          hasSize: hasSizeValue,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset promotions";
      showToast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle clear selected promotions - shows confirmation modal
  const handleClearSelectedPromotionsClick = () => {
    if (selectedIds.length === 0) {
      showToast.error("Please select at least one product");
      return;
    }
    setShowClearSelectedModal(true);
  };

  // Execute clear selected promotions after confirmation
  const handleConfirmClearSelected = async () => {
    setIsClearingSelected(true);
    try {
      // Build product size mapping
      const productSizeMapping: Record<string, string[]> = {};
      selectedIds.forEach((productId) => {
        const sizeSet = selectedSizes.get(productId);
        if (sizeSet && sizeSet.size > 0) {
          productSizeMapping[productId] = Array.from(sizeSet);
        }
      });

      // ✅ OPTIMISTIC UPDATE: Clear promotions immediately
      dispatch(
        resetSelectedPromotionsOptimistic({
          productIds: selectedIds,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      );

      showToast.success("Clearing promotions... (updating in background)");

      // ✅ BACKGROUND API CALL
      await dispatch(
        resetSelectedPromotionsService({
          productIds: selectedIds,
          productSizeMapping:
            Object.keys(productSizeMapping).length > 0
              ? productSizeMapping
              : undefined,
        }),
      ).unwrap();

      showToast.success("Promotions cleared successfully!");
      // Clear selections after successful reset
      dispatch(clearSelectedProducts());
      dispatch(clearAllSizeSelections());
      clearSelections();
      setShowClearSelectedModal(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear promotions";
      showToast.error(String(errorMessage));
    } finally {
      setIsClearingSelected(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background scroll-smooth">
      {/* Header */}
      <div className="flex items-center justify-between px-[0.65rem] sm:px-[0.975rem] py-[0.65rem] bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-[0.4875rem]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
            className="h-[1.4625rem] w-[1.4625rem] hover:bg-muted"
            title="Go back"
          >
            <ArrowLeft className="h-[0.8125rem] w-[0.8125rem]" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-[13px] sm:text-[14px] font-bold text-foreground">
              Create Bulk Promotion
            </h1>
            <p className="text-[11px] sm:text-[11px] text-muted-foreground mt-[0.08125rem]">
              Select products and apply discount settings
            </p>
          </div>
        </div>
        <div className="flex gap-[0.325rem]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelectedPromotionsClick}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="gap-[0.325rem]"
            title="Clear promotion for selected products and sizes"
          >
            <Trash2 className="h-[0.65rem] w-[0.65rem]" />
            <span className="hidden sm:inline">Clear Promotion Selected</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowResetModal(true)}
            className="gap-[0.325rem]"
            title="Reset all promotions"
          >
            <Trash2 className="h-[0.65rem] w-[0.65rem]" />
            <span className="hidden sm:inline">Reset All</span>
          </Button>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-no-progress="true"
        className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0"
      >
        {/* Left Column - Product Selection */}
        <div className="flex-1 flex flex-col gap-[0.65rem] px-[0.325rem] sm:px-[0.65rem] py-[0.65rem] overflow-y-auto min-h-0 lg:border-r lg:border-border scroll-smooth">
          {/* Filters + Select All Control - Modern Responsive Design */}
          <div className="rounded-[0.325rem] border border-border/60 bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30 transition-all duration-200 overflow-hidden">
            {/* Top Row - Select All Control + Search (Responsive) */}
            <div className="px-[0.65rem] py-[0.4875rem] border-b border-border/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[0.4875rem]">
                {/* Left Side - Checkbox + Status Text */}
                <div className="flex items-center gap-[0.4875rem] min-w-0 flex-1">
                  <CustomCheckbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading}
                    size="lg"
                    variant="default"
                    ariaLabel="Select all products on this page"
                    className="flex-shrink-0"
                  />

                  {/* Status Text */}
                  <div className="flex flex-col gap-[0.08125rem] min-w-0">
                    <span className="text-[11px] font-semibold text-foreground">
                      {allSelected
                        ? "All products selected"
                        : someSelected
                          ? `${
                              Array.from(selectedProductIds.keys()).filter(
                                (id) => productContent.some((p) => p.id === id),
                              ).length
                            } products selected`
                          : "Select all products"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {productContent.length} products on this page
                    </span>
                  </div>
                </div>

                {/* Right Side - Search + Clear Button */}
                <div className="flex items-center gap-[0.325rem] flex-wrap w-full sm:w-auto">
                  {/* Search Input - Constrained width */}
                  <div className="relative flex-1 sm:flex-none sm:w-auto sm:min-w-[300px] sm:max-w-[370px]">
                    <Search className="absolute left-[0.4875rem] top-1/2 transform -translate-y-1/2 h-[0.65rem] w-[0.65rem] text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-[1.4625rem] pr-[1.4625rem] py-[0.325rem] rounded-[0.24375rem] border border-border bg-background text-[11px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-[0.4875rem] top-1/2 transform -translate-y-1/2 p-[0.1625rem] hover:bg-muted rounded-[0.1625rem] transition-colors"
                        title="Clear search"
                      >
                        <X className="h-[0.65rem] w-[0.65rem] text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Clear Selection Button */}
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSelections}
                      className="inline-flex items-center gap-[0.24375rem] px-[0.4875rem] py-[0.325rem] rounded-[0.24375rem] text-[11px] font-medium text-destructive border border-destructive/40 bg-destructive/5 hover:border-destructive/70 hover:bg-destructive/15 hover:text-destructive transition-colors duration-150 flex-shrink-0"
                      title="Clear all selections (stored in browser)"
                    >
                      <Trash2 className="h-[0.56875rem] w-[0.56875rem]" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Row - Responsive Grid */}
            <div className="px-[0.65rem] py-[0.4875rem] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.40625rem]">
              {/* Category Filter */}
              <div className="min-w-0">
                <ComboboxSelectCategories
                  dataSelect={selectedCategories}
                  onChangeSelected={handleCategoriesChange}
                  placeholder="All Categories"
                  showAllOption={true}
                />
              </div>

              {/* Product Status Filter */}
              <div className="min-w-0">
                <CustomSelect
                  options={PRODUCT_STATUS_FILTER}
                  value={filters.status}
                  placeholder="All Status"
                  onValueChange={(value) =>
                    handleProductStatusChange(value as ProductStatus)
                  }
                  className="w-full"
                  label="Product Status"
                  size="md"
                />
              </div>

              {/* Has Size Filter */}
              <div className="min-w-0">
                <CustomSelect
                  options={PRODUCT_SIZE_FILTER}
                  value={hasSizeFilter}
                  placeholder="All Products"
                  onValueChange={setHasSizeFilter}
                  className="w-full"
                  label="Product Size"
                  size="md"
                />
              </div>

              {/* Is Promotion Filter */}
              <div className="min-w-0">
                <CustomSelect
                  options={[
                    { value: "ALL", label: "All Products" },
                    { value: "HAS_PROMOTION", label: "Has Promotion" },
                    { value: "NO_PROMOTION", label: "No Promotion" },
                  ]}
                  value={hasPromotionFilter}
                  placeholder="All Products"
                  onValueChange={setHasPromotionFilter}
                  className="w-full"
                  label="Promotion Status"
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Products Table with DataTableWithPagination */}
          <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
            <DataTableWithPagination<ProductDetailResponseModel>
              data={productContent}
              columns={columns}
              loading={isLoading}
              currentPage={filters.pageNo}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
              showPagination={pagination.totalPages > 1}
              showPageSizeSelector={true}
              emptyMessage="No products found"
            />
          </div>
        </div>

        {/* Right Column - Promotion Settings */}
        <div className="w-full lg:w-[15.6rem] flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0 overflow-hidden scroll-smooth bg-gradient-to-b from-background via-background to-primary/5">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-[0.65rem] sm:px-[0.8125rem] md:px-[0.65rem] lg:px-[0.8125rem] py-[0.975rem] sm:py-[1.3rem] md:py-[0.975rem] lg:py-[1.3rem] space-y-[0.975rem] sm:space-y-[1.3rem] md:space-y-[0.975rem] lg:space-y-[1.3rem]">
              {/* Header Section */}
              <div className="space-y-[0.1625rem]">
                <h2 className="text-[13px] sm:text-[13px] font-bold text-foreground">
                  Promotion Setup
                </h2>
                <p className="text-[11px] sm:text-[11px] text-muted-foreground">
                  Configure discount details below
                </p>
              </div>

              {/* Selected Count Card */}
              <div className="rounded-[0.325rem] p-[0.8125rem] bg-gradient-to-r from-primary/15 to-green-500/15 border border-primary/25 shadow-sm">
                <div className="space-y-[0.4875rem]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
                    Selection Status
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-[0.975rem] sm:gap-[1.3rem]">
                    {/* Products Count */}
                    <div className="flex items-baseline gap-[0.325rem]">
                      <p className="text-[1.95rem] sm:text-[2.4375rem] font-black text-primary">
                        {selectedIds.length}
                      </p>
                      <p className="text-[11px] sm:text-[11px] font-semibold text-foreground/60">
                        {selectedIds.length === 1 ? "Product" : "Products"}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-[1.95rem] w-px bg-primary/20" />

                    {/* Sizes Count */}
                    <div className="flex items-baseline gap-[0.325rem]">
                      <p className="text-[1.21875rem] sm:text-[1.4625rem] font-black text-green-600">
                        {Object.values(selectedSizesFromRedux).reduce(
                          (sum, sizeArray) => sum + sizeArray.length,
                          0,
                        )}
                      </p>
                      <p className="text-[11px] sm:text-[11px] font-semibold text-foreground/60">
                        {Object.values(selectedSizesFromRedux).reduce(
                          (sum, sizeArray) => sum + sizeArray.length,
                          0,
                        ) === 1
                          ? "Size"
                          : "Sizes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Sections - Grouped */}
              <div className="space-y-[0.975rem] sm:space-y-[1.1375rem] md:space-y-[0.975rem] lg:space-y-[1.1375rem]">
                {/* Discount Section */}
                <div className="space-y-[0.4875rem] sm:space-y-[0.65rem] md:space-y-[0.4875rem] lg:space-y-[0.65rem]">
                  <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider px-[0.1625rem]">
                    Discount Settings
                  </h3>
                  <div className="space-y-[0.4875rem] sm:space-y-[0.65rem] md:space-y-[0.4875rem] lg:space-y-[0.65rem]">
                    <CustomSelect
                      placeholder="Choose discount type..."
                      label="Discount Type"
                      options={PROMOTION_TYPES}
                      value={promotionType}
                      onValueChange={(value) =>
                        form.setValue(
                          "promotionType",
                          value as "FIXED_AMOUNT" | "PERCENTAGE",
                        )
                      }
                      disabled={isSubmitting}
                      required
                    />
                    {form.formState.errors.promotionType && (
                      <p className="text-[11px] text-destructive font-medium px-[0.1625rem]">
                        {form.formState.errors.promotionType.message}
                      </p>
                    )}

                    <TextField
                      control={form.control}
                      name="promotionValue"
                      label={
                        promotionType === "PERCENTAGE"
                          ? "Discount Percentage"
                          : "Discount Amount"
                      }
                      type="number"
                      placeholder={
                        promotionType === "PERCENTAGE"
                          ? "Enter percentage (0-100)"
                          : "Enter amount"
                      }
                      disabled={isSubmitting}
                      error={form.formState.errors.promotionValue as any}
                      valueAsNumber={true}
                      min={0}
                      step="0.01"
                      allowZero={false}
                      required
                    />
                  </div>
                </div>

                {/* Duration Section */}
                <div className="space-y-[0.4875rem] sm:space-y-[0.65rem] md:space-y-[0.4875rem] lg:space-y-[0.65rem]">
                  <div className="space-y-[0.4875rem] sm:space-y-[0.65rem] md:space-y-[0.4875rem] lg:space-y-[0.65rem]">
                    <DateTimePickerField
                      control={form.control}
                      className="h-[1.625rem]"
                      name="promotionFromDate"
                      label="Start Date"
                      required
                      mode="date"
                      error={form.formState.errors.promotionFromDate}
                    />

                    <DateTimePickerField
                      control={form.control}
                      className="h-[1.625rem]"
                      name="promotionToDate"
                      label="End Date"
                      required
                      mode="date"
                      error={form.formState.errors.promotionToDate}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons - Modern Style */}
              <div className="flex gap-[0.4875rem] sm:gap-[0.65rem] md:gap-[0.4875rem] lg:gap-[0.65rem] pt-[0.325rem] sm:pt-[0.65rem] md:pt-[0.325rem] lg:pt-[0.65rem]">
                <CustomButton
                  onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_PROMOTION)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 h-[1.625rem] sm:h-[1.7875rem] md:h-[1.625rem] lg:h-[1.7875rem] text-[11px] sm:text-[11px] md:text-[11px] lg:text-[11px] font-semibold rounded-[0.325rem] border-2 hover:bg-muted/50"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  disabled={!isFormValid || isSubmitting}
                  onClick={handleApplyClick}
                  variant="default"
                  className="flex-1 h-[1.625rem] sm:h-[1.7875rem] md:h-[1.625rem] lg:h-[1.7875rem] text-[11px] sm:text-[11px] md:text-[11px] lg:text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-[0.325rem] shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Applying..." : "Apply Promotion"}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Product Detail Modal */}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Reset Promotion Modal */}
      <ConfirmationModal
        isOpen={resetPromotionState.isOpen}
        onClose={closeResetPromotionModal}
        onConfirm={handleConfirmResetPromotion}
        title="Reset Promotion"
        description="Clear all promotional discounts and restore product to regular pricing"
        itemName={resetPromotionState.product?.name || ""}
        actionLabel="Reset Promotion"
        actionVariant="secondary"
        headerBgColor="bg-yellow-50"
        buttonColor="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
        isDangerous={false}
      />

      {/* Reset All Promotions Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetAllPromotions}
        title="Reset All Promotions"
        description="Are you sure you want to reset all promotions? This will remove all current and future promotion data from all products and sizes."
        actionLabel="Reset All"
        actionVariant="destructive"
        headerBgColor="bg-red-50"
        isDangerous={true}
        isSubmitting={isResetting}
      />

      {/* Clear Selected Promotions Modal */}
      <ConfirmationModal
        isOpen={showClearSelectedModal}
        onClose={() => setShowClearSelectedModal(false)}
        onConfirm={handleConfirmClearSelected}
        title="Clear Promotions for Selected Items"
        description={`You are about to clear promotions for ${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} ${
          Array.from(selectedSizes.values()).some((s) => s.size > 0)
            ? `with ${Array.from(selectedSizes.values()).reduce((sum, s) => sum + s.size, 0)} size${
                Array.from(selectedSizes.values()).reduce(
                  (sum, s) => sum + s.size,
                  0,
                ) !== 1
                  ? "s"
                  : ""
              }`
            : ""
        }. This will remove all promotion data from the selected products${
          Array.from(selectedSizes.values()).some((s) => s.size > 0)
            ? " and sizes"
            : ""
        }.`}
        actionLabel="Clear Promotion"
        actionVariant="warning"
        headerBgColor="bg-yellow-50"
        isDangerous={false}
        isSubmitting={isClearingSelected}
      />
    </div>
  );
}
