"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  X,
  SlidersHorizontal,
  Flame,
  ListChecks,
  FilterX,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ComboboxSelectCategoriesPublic } from "@/components/shared/combobox/combobox_select_categories_public";

interface ProductFiltersProps {
  totalResults: number;
  basePath?: string;
  lockedPromotion?: boolean;
}

function ProductFiltersComponent({
  totalResults,
  basePath = "/products",
  lockedPromotion = false,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [hasSizes, setHasSizes] = useState<boolean | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Extract all params from URL at the top level
  const categoryIdParam = searchParams.get("categoryId") || "";
  const hasPomParam = searchParams.get("hasPromotion") || "";
  const hasSizesParam = searchParams.get("hasSizes") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  // Sync from URL - depends on parsed string values, not searchParams object
  useEffect(() => {
    setSelectedCategory(categoryIdParam);
    setHasPromotion(hasPomParam === "true");
    setHasSizes(
      hasSizesParam === "true"
        ? true
        : hasSizesParam === "false"
          ? false
          : null,
    );
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
  }, [
    categoryIdParam,
    hasPomParam,
    hasSizesParam,
    minPriceParam,
    maxPriceParam,
  ]);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, basePath],
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      pushParams(params);
    },
    [searchParams, pushParams],
  );

  const applyPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    pushParams(params);
  }, [searchParams, pushParams, minPrice, maxPrice]);

  const clearPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    setMinPrice("");
    setMaxPrice("");
    pushParams(params);
  }, [searchParams, pushParams]);

  const clearAllFilters = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    router.push(basePath);
  }, [router, basePath]);

  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const hasPriceFilter = !!(urlMinPrice || urlMaxPrice);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (!lockedPromotion && hasPromotion ? 1 : 0) +
    (hasSizes !== null ? 1 : 0) +
    (hasPriceFilter ? 1 : 0);

  // Create filter content once to avoid duplicate component instances
  const filterContent = (
    <div className="space-y-5">
      {/* Promotion - top, hidden when locked */}
      {!lockedPromotion && (
        <>
          <div
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-3 border transition-colors cursor-pointer",
              hasPromotion
                ? "border-orange-400/60 bg-orange-500/5"
                : "border-border/60 hover:border-border",
            )}
            onClick={() =>
              updateFilter("hasPromotion", hasPromotion ? "" : "true")
            }
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                  hasPromotion ? "bg-orange-500/20" : "bg-orange-500/10",
                )}
              >
                <Flame
                  className={cn(
                    "h-3.5 w-3.5",
                    hasPromotion ? "text-orange-500" : "text-orange-400",
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">
                  On Sale Only
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Show promotional items
                </p>
              </div>
            </div>
            <Switch
              checked={hasPromotion}
              onCheckedChange={(checked) =>
                updateFilter("hasPromotion", checked ? "true" : "")
              }
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
          <Separator />
        </>
      )}

      {/* Category - Combobox */}
      <ComboboxSelectCategoriesPublic
        selectedCategory={selectedCategory}
        onChangeSelected={(categoryId) =>
          updateFilter("categoryId", categoryId)
        }
        label="Category"
        size="md"
        placeholder="All Categories"
      />

      <Separator />

      {/* Product Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
            <ListChecks className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <label className="text-sm font-semibold">Product Size</label>
        </div>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              id="has-sizes-true"
              checked={hasSizes === true}
              onCheckedChange={() =>
                updateFilter("hasSizes", hasSizes === true ? "" : "true")
              }
            />
            <span className="text-sm group-hover:text-primary transition-colors select-none">
              Has Sizes
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              id="has-sizes-false"
              checked={hasSizes === false}
              onCheckedChange={() =>
                updateFilter("hasSizes", hasSizes === false ? "" : "false")
              }
            />
            <span className="text-sm group-hover:text-primary transition-colors select-none">
              No Sizes
            </span>
          </label>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-500/10">
            <DollarSign className="h-3.5 w-3.5 text-yellow-600" />
          </div>
          <label className="text-sm font-semibold">Price Range</label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-sm"
          />
          <span className="text-muted-foreground text-sm flex-shrink-0">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={applyPrice}
            disabled={!minPrice && !maxPrice}
          >
            Apply
          </Button>
          {hasPriceFilter && (
            <Button size="sm" variant="outline" onClick={clearPrice}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 flex-shrink-0">
        <div className="sticky top-24 h-[calc(100vh-7rem)] w-full">
          <div className="bg-card border rounded-xl shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                  onClick={clearAllFilters}
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="px-5 py-3 border-b border-border/40 flex-shrink-0 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {totalResults.toLocaleString()}
                </span>{" "}
                result{totalResults !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="p-5">{filterContent}</div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between gap-3 bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {totalResults.toLocaleString()} result
              {totalResults !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`
                : "No filters applied"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-1.5 text-xs"
                onClick={clearAllFilters}
              >
                <FilterX className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="h-9 gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-white text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 sm:w-96 p-0 flex flex-col"
              >
                <SheetHeader className="px-5 py-4 border-b border-border/60 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2.5">
                      <SlidersHorizontal className="h-5 w-5 text-primary" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </SheetTitle>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-3.5 w-3.5" />
                        Clear all
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left mt-1">
                    <span className="font-semibold text-foreground">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    result{totalResults !== 1 ? "s" : ""} found
                  </p>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-5">{filterContent}</div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}

export const ProductFilters = memo(
  ProductFiltersComponent,
  (prevProps, nextProps) => {
    // Only re-render if basePath or lockedPromotion changes
    // Ignore totalResults changes as they don't affect filter behavior
    return (
      prevProps.basePath === nextProps.basePath &&
      prevProps.lockedPromotion === nextProps.lockedPromotion
    );
  },
);
