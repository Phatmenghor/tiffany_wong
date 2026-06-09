"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchProductByIdService,
  createProductService,
  updateProductService,
} from "../store/thunks/product-thunks";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedProduct } from "../store/slice/product-slice";
import {
  selectError,
  selectOperations,
  selectSelectedProduct,
  selectIsFetchingDetail,
} from "../store/selectors/product-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, ProductStatus } from "@/constants/status/status";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  createProductSchema,
  ProductFormData,
  updateProductSchema,
} from "../store/models/schema/product-schema";
import { Loading } from "@/components/shared/common/loading";
import { ProductBasicInfo } from "./product-modal/product-basic-info";
import { ProductMainImage } from "./product-modal/product-main-image";
import { ProductPricing } from "./product-modal/product-pricing";
import { ProductSizes } from "./product-modal/product-sizes";
import { ProductImagesGallery } from "./product-modal/product-images-gallery";

type Props = {
  mode: ModalMode;
  productId?: string;
  onClose: () => void;
  isOpen: boolean;
};

const MAX_PRODUCT_IMAGES = 5;

export default function ProductModal({
  isOpen,
  onClose,
  productId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const productData = useAppSelector(selectSelectedProduct);
  const { isCreating, isUpdating } = operations;

  const [selectedCategory, setSelectedCategory] =
    useState<CategoriesResponseModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(
      isCreate ? createProductSchema : updateProductSchema,
    ) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
      categoryId: "",
      price: 0,
      mainImageUrl: "",
      promotionType: "NONE",
      promotionValue: undefined,
      promotionFromDate: "",
      promotionToDate: "",
      images: [],
      sizes: [],
      status: ProductStatus.ACTIVE,
    },
    mode: "onChange",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const hasSizes = sizeFields.length > 0;

  // Fetch product data for edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchProductByIdService(productId));

        if (fetchProductByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          if (data.categoryId) {
            setSelectedCategory({
              id: data.categoryId,
              name: data.categoryName,
            } as CategoriesResponseModel);
          }

          reset({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            categoryId: data.categoryId || "",
            price: data.price || 0,
            mainImageUrl: data.mainImageUrl || "",
            promotionType: data.promotionType || "NONE",
            promotionValue: data.promotionValue || undefined,
            promotionFromDate: data.promotionFromDate || "",
            promotionToDate: data.promotionToDate || "",
            images: data.images || [],
            sizes: data.sizes || [],
            status: data.status || ProductStatus.ACTIVE,
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [productId, isOpen, isCreate, reset, dispatch]);

  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedCategory(null);
      reset({
        name: "",
        description: "",
        categoryId: "",
        price: 0,
        mainImageUrl: "",
        promotionType: "NONE",
        promotionValue: undefined,
        promotionFromDate: "",
        promotionToDate: "",
        images: [],
        sizes: [],
        status: ProductStatus.ACTIVE,
      });
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const cleanPromotionData = (
    promotionType?: string,
    promotionValue?: number,
    promotionFromDate?: string,
    promotionToDate?: string,
  ) => {
    if (!promotionType || promotionType === "NONE") {
      return {
        promotionType: null,
        promotionValue: null,
        promotionFromDate: null,
        promotionToDate: null,
      };
    }

    return {
      promotionType: promotionType || undefined,
      promotionValue: promotionValue || undefined,
      promotionFromDate: promotionFromDate || undefined,
      promotionToDate: promotionToDate || undefined,
    };
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const cleanedSizes = (data.sizes || []).map((size) => ({
        id: size.id,
        name: size.name,
        price: size.price,
        ...cleanPromotionData(
          size.promotionType,
          size.promotionValue,
          size.promotionFromDate,
          size.promotionToDate,
        ),
      }));

      const validImages = (data.images || []).filter(
        (img: any) => img !== null && !!img.imageUrl,
      );

      const basePayload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        mainImageUrl: data.mainImageUrl,
        images: validImages.length > 0 ? validImages : undefined,
        sizes: cleanedSizes.length > 0 ? cleanedSizes : undefined,
        status: data.status,
      };

      const payload = hasSizes
        ? {
            ...basePayload,
            price: null,
            promotionType: null,
            promotionValue: null,
            promotionFromDate: null,
            promotionToDate: null,
          }
        : {
            ...basePayload,
            price: data.price,
            ...cleanPromotionData(
              data.promotionType,
              data.promotionValue,
              data.promotionFromDate,
              data.promotionToDate,
            ),
          };

      if (isCreate) {
        await dispatch(createProductService(payload as any)).unwrap();
        showToast.success("Product created successfully");
        handleClose();
      } else {
        await dispatch(
          updateProductService({
            productId: data.id!,
            productData: payload as any,
          }),
        ).unwrap();
        showToast.success("Product updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} product`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCategory(null);
    dispatch(clearError());
    dispatch(clearSelectedProduct());
    onClose();
  };

  const isProcessing = isCreate ? isCreating : isUpdating;
  const productName = watch("name");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">
          {isCreate ? "Create New Product" : `Edit Product - ${productName}`}
        </DialogTitle>

        <FormHeader
          title={isCreate ? "Create New Product" : "Edit Product"}
          description={
            isCreate
              ? "Fill out the form to create a new product"
              : "Update product information below"
          }
          avatarName={productName || "Product"}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              <div className="space-y-6">
                {reduxError && (
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      {reduxError}
                    </p>
                  </div>
                )}

                <ProductBasicInfo
                  control={control}
                  errors={errors}
                  isProcessing={isProcessing}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onCategoryIdChange={(categoryId) =>
                    setValue("categoryId", categoryId, { shouldDirty: true })
                  }
                />

                <ProductMainImage
                  control={control}
                  errors={errors}
                  isProcessing={isProcessing}
                  onImageChange={(url) =>
                    setValue("mainImageUrl", url, { shouldDirty: true })
                  }
                />

                <ProductPricing
                  control={control}
                  errors={errors}
                  isProcessing={isProcessing}
                  hasSizes={hasSizes}
                  setValue={setValue}
                  onResetPromotion={() => {
                    setValue("promotionType", "NONE", { shouldDirty: true });
                    setValue("promotionValue", undefined, { shouldDirty: true });
                    setValue("promotionFromDate", "", { shouldDirty: true });
                    setValue("promotionToDate", "", { shouldDirty: true });
                  }}
                />

                <ProductSizes
                  control={control}
                  errors={errors}
                  isProcessing={isProcessing}
                  sizeFields={sizeFields}
                  watch={watch}
                  setValue={setValue}
                  onAddSize={() =>
                    appendSize({
                      name: "",
                      price: 0,
                      promotionType: "NONE",
                      promotionValue: undefined,
                      promotionFromDate: "",
                      promotionToDate: "",
                    })
                  }
                  onRemoveSize={removeSize}
                  onResetPromotion={(index) => {
                    setValue(`sizes.${index}.promotionType`, "NONE", {
                      shouldDirty: true,
                    });
                    setValue(`sizes.${index}.promotionValue`, undefined, {
                      shouldDirty: true,
                    });
                    setValue(`sizes.${index}.promotionFromDate`, "", {
                      shouldDirty: true,
                    });
                    setValue(`sizes.${index}.promotionToDate`, "", {
                      shouldDirty: true,
                    });
                  }}
                  onResetAllPromotions={() => {
                    sizeFields.forEach((_, idx) => {
                      setValue(`sizes.${idx}.promotionType`, "NONE", {
                        shouldDirty: true,
                      });
                      setValue(`sizes.${idx}.promotionValue`, undefined, {
                        shouldDirty: true,
                      });
                      setValue(`sizes.${idx}.promotionFromDate`, "", {
                        shouldDirty: true,
                      });
                      setValue(`sizes.${idx}.promotionToDate`, "", {
                        shouldDirty: true,
                      });
                    });
                  }}
                />

                <ProductImagesGallery
                  control={control}
                  errors={errors}
                  isProcessing={isProcessing}
                  imageFields={imageFields}
                  onAddImages={(urls) =>
                    urls.forEach((url) => appendImage({ imageUrl: url }))
                  }
                  onRemoveImage={removeImage}
                  onImageChange={(index, url) =>
                    setValue(`images.${index}.imageUrl`, url, {
                      shouldDirty: true,
                    })
                  }
                  watch={watch}
                />
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating product..."
              updateMessage="Updating product..."
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Product"
                updateText="Update Product"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
