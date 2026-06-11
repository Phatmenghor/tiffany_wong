"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface Image {
  id: string;
  imageUrl: string;
}

interface ImageLightboxProps {
  isOpen: boolean;
  currentIndex: number;
  images: Image[];
  productName: string;
  onClose: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
}

export function ImageLightbox({ isOpen, currentIndex, images, productName, onClose, onPrevImage, onNextImage, onSelectImage }: ImageLightboxProps) {
  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-between" onClick={onClose}>
      <div className="w-full flex items-center justify-between px-[0.65rem] py-[0.4875rem] shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/70 text-[0.56875rem] font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-[0.325rem] rounded-full transition-colors">
          <X className="h-[0.8125rem] w-[0.8125rem]" />
        </button>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center px-[2.275rem]" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`lightbox-${currentIndex}`}
          src={currentImage?.imageUrl || appImages.NoImage}
          alt={productName}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-[0.325rem] select-none"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={onPrevImage}
              className="absolute left-[0.325rem] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-[0.4875rem] rounded-full transition-colors"
            >
              <ChevronLeft className="h-[0.975rem] w-[0.975rem]" />
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-[0.325rem] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-[0.4875rem] rounded-full transition-colors"
            >
              <ChevronRight className="h-[0.975rem] w-[0.975rem]" />
            </button>
          </>
        )}
      </div>

      <div className="w-full flex justify-center gap-[0.325rem] px-[0.65rem] py-[0.4875rem] overflow-x-auto shrink-0" onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <button
            key={`lb-thumb-${i}`}
            onClick={() => onSelectImage(i)}
            className={cn(
              "relative flex-shrink-0 w-[2.275rem] h-[2.275rem] rounded-[0.325rem] overflow-hidden transition-all",
              i === currentIndex ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-80"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)} alt={`${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
