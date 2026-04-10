"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Badge,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

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
  discountPercent: number;
  hasDiscount: boolean;
}

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
  discountPercent,
  hasDiscount,
}: ProductImageGalleryProps) {
  const allImages = [
    { id: "main", imageUrl: sanitizeImageUrl(mainImageUrl, appImages.NoImage) },
    ...images.map((img) => ({
      id: img.id,
      imageUrl: sanitizeImageUrl(img.imageUrl, appImages.NoImage),
    })),
  ];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted group shadow-sm">
        {!imageLoaded && <Skeleton className="absolute inset-0 rounded-2xl" />}
        <Image
          key={`main-${currentImageIndex}`}
          src={selectedImage || appImages.NoImage}
          alt={productName}
          fill
          className={cn("object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
          onLoad={onImageLoad}
          priority
        />

        {/* Discount badge */}
        {hasDiscount && discountPercent > 0 && (
          <Badge variant="destructive" className="absolute top-3 left-3 text-sm font-bold px-3 py-1.5 shadow">
            -{discountPercent}%
          </Badge>
        )}

        {/* Zoom icon */}
        <button
          onClick={() => onOpenLightbox(currentImageIndex)}
          className="absolute bottom-3 right-3 bg-background/75 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-zoom-in hover:bg-background"
        >
          <ZoomIn className="h-4 w-4 text-foreground/70" />
        </button>

        {/* Prev / Next */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={`thumb-${i}`}
              onClick={() => onSelectImage(img.imageUrl, i)}
              className={cn(
                "relative flex-shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-150",
                i === currentImageIndex
                  ? "ring-2 ring-primary ring-offset-2 shadow-sm"
                  : "opacity-55 hover:opacity-100 hover:ring-2 hover:ring-primary/40 hover:ring-offset-1"
              )}
            >
              <Image src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)} alt={`View ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
