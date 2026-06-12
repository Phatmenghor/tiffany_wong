"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface ProductImage {
  id: string;
  imageUrl: string;
}

interface ProductImageGalleryProps {
  mainImageUrl: string;
  images: Array<{ id: string; imageUrl: string }>;
  productName: string;
  imageLoaded: boolean;
  onImageLoad: () => void;
  currentImageIndex: number;
  selectedImage: string;
  onSelectImage: (url: string, index: number) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onOpenLightbox: (index: number) => void;
  discountLabel: string;
  hasDiscount: boolean;
}

const VISIBLE_THUMBS = 5;

export function ProductImageGallery({
  mainImageUrl,
  images,
  productName,
  imageLoaded,
  onImageLoad,
  currentImageIndex,
  selectedImage,
  onSelectImage,
  onPrevImage,
  onNextImage,
  onOpenLightbox,
  discountLabel,
  hasDiscount,
}: ProductImageGalleryProps) {
  const [thumbOffset, setThumbOffset] = useState(0);

  const allImages: ProductImage[] = [
    { id: "main", imageUrl: sanitizeImageUrl(mainImageUrl, appImages.NoImage) },
    ...(images || []).map((img) => ({
      id: img.id,
      imageUrl: sanitizeImageUrl(img.imageUrl, appImages.NoImage),
    })),
  ];

  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + VISIBLE_THUMBS < allImages.length;
  const visibleThumbs = allImages.slice(thumbOffset, thumbOffset + VISIBLE_THUMBS);

  return (
    <div className="flex gap-[0.4875rem]">
      {/* Vertical thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex flex-col items-center gap-[0.24375rem] w-[60px] shrink-0">
          <button
            onClick={() => setThumbOffset((p) => Math.max(0, p - 1))}
            disabled={!canScrollUp}
            className="p-[0.1625rem] rounded-[0.325rem] border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="h-[0.56875rem] w-[0.56875rem]" />
          </button>

          <div className="flex flex-col gap-[0.24375rem]">
            {visibleThumbs.map((img, i) => {
              const absIndex = thumbOffset + i;
              const isActive = absIndex === currentImageIndex;
              return (
                <button
                  key={img.id}
                  onClick={() => onSelectImage(img.imageUrl, absIndex)}
                  className={cn(
                    "relative w-[52px] h-[52px] rounded-[0.4875rem] overflow-hidden border-2 transition-all shrink-0",
                    isActive
                      ? "border-primary shadow-sm ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40 opacity-70 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={`${productName} ${absIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setThumbOffset((p) => Math.min(allImages.length - VISIBLE_THUMBS, p + 1))}
            disabled={!canScrollDown}
            className="p-[0.1625rem] rounded-[0.325rem] border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="h-[0.56875rem] w-[0.56875rem]" />
          </button>
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-square rounded-[0.65rem] overflow-hidden bg-muted group cursor-zoom-in shadow-sm">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-[0.65rem]" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={selectedImage}
          src={selectedImage || appImages.NoImage}
          alt={productName}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={onImageLoad}
          onClick={() => onOpenLightbox(currentImageIndex)}
        />

        {/* Discount badge */}
        {hasDiscount && discountLabel && (
          <Badge className="absolute top-[0.4875rem] left-[0.4875rem] bg-rose-500 hover:bg-rose-500 text-white text-[11px] font-bold z-10 pointer-events-none">
            {discountLabel}
          </Badge>
        )}

        {/* Zoom button */}
        <button
          onClick={() => onOpenLightbox(currentImageIndex)}
          className="absolute top-[0.4875rem] right-[0.4875rem] bg-white/80 hover:bg-white text-foreground p-[0.325rem] rounded-[0.4875rem] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="h-[0.65rem] w-[0.65rem]" />
        </button>

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-[0.4875rem] right-[0.4875rem] bg-black/50 text-white text-[11px] px-[0.40625rem] py-[0.1625rem] rounded-full pointer-events-none">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}

        {/* Prev / Next arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrevImage(); }}
              className="absolute left-[0.4875rem] top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-[0.24375rem] rounded-[0.4875rem] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-[0.65rem] w-[0.65rem]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNextImage(); }}
              className="absolute right-[0.4875rem] top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-[0.24375rem] rounded-[0.4875rem] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-[0.65rem] w-[0.65rem]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
