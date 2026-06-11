"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { getImageWithFallback } from "@/constants/image-defaults";

interface CategoryCardProps {
  category: CategoriesResponseModel;
  className?: string;
}

/**
 * CategoryCard - Reusable category card component for ecommerce
 * Features:
 * - Clean, modern design optimized for ecommerce
 * - Smooth hover animations
 * - Image loading states with skeleton
 * - Responsive sizing
 * - Product count badge
 * - Accessible with proper ARIA labels
 */
export function CategoryCard({ category, className }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-[0.4875rem]"
      aria-label={`Browse ${category.activeProducts} products in ${category.name} category`}
    >
      <Card
        className={cn(
          "overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-[0.1625rem] hover-scale-102",
          className,
        )}
      >
        <CardContent className="p-[0.65rem] sm:p-[0.8125rem] flex flex-col items-center justify-center gap-[0.4875rem]">
          {/* Icon/Image Container - Clean and centered */}
          <div className="relative w-[2.6rem] h-[2.6rem] sm:w-[3.25rem] sm:h-[3.25rem] flex items-center justify-center overflow-hidden rounded-[0.4875rem] bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
            {!imageError && category.imageUrl ? (
              <>
                {!imageLoaded && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded-[0.4875rem]" />
                )}
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={80}
                  height={80}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                    imageLoaded ? "opacity-100" : "opacity-0",
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <Image
                src={getImageWithFallback(undefined, "category")}
                alt={category.name}
                width={80}
                height={80}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Category Name - Clean typography */}
          <div className="text-center w-full">
            <h3 className="font-semibold text-[0.56875rem] sm:text-[0.65rem] line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
              {category.name}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
