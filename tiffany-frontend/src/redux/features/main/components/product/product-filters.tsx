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
    <div className="space-y-[0.8125rem]">
      {/* Promotion - top, hidden when locked */}
      {!lockedPromotion && (
        <>
          <div
            className={cn(
              "flex items-center justify-between rounded-[0.325rem] px-[0.4875rem] py-[0.4875rem] border transition-colors cursor-pointer",
              hasPromotion
                ? "border-orange-400/60 bg-orange-500/5"
                : "border-border/60 hover:border-border",
            )}
            onClick={() =>
              updateFilter("hasPromotion", hasPromotion ? "" : "true")
            }
          >
            <div className="flex items-center gap-[0.40625rem]">
              <div
                className={cn(
                  "flex items-center justify-center w-[1.1375rem] h-[1.1375rem] rounded-[0.325rem] transition-colors",
                  hasPromotion ? "bg-orange-500/20" : "bg-orange-500/10",
                )}
              >
                <Flame
                  className={cn(
                    "h-[0.56875rem] w-[0.56875rem]",
                    hasPromotion ? "text-orange-500" : "text-orange-400",
                  )}
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-none">
                  On Sale Only
                </p>
                <p className="text-[11px] text-muted-foreground mt-[0.08125rem]">
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
      <div className="space-y-[0.4875rem]">
        <div className="flex items-center gap-[0.325rem]">
          <div className="flex items-center justify-center w-[1.1375rem] h-[1.1375rem] rounded-[0.325rem] bg-blue-500/10">
            <ListChecks className="h-[0.56875rem] w-[0.56875rem] text-blue-600" />
          </div>
          <label className="text-[11px] font-semibold">Product Size</label>
        </div>
        <div className="space-y-[0.40625rem]">
          <label className="flex items-center gap-[0.4875rem] cursor-pointer group">
            <Checkbox
              id="has-sizes-true"
              checked={hasSizes === true}
              onCheckedChange={() =>
                updateFilter("hasSizes", hasSizes === true ? "" : "true")
              }
            />
            <span className="text-[11px] group-hover:text-primary transition-colors select-none">
              Has Sizes
            </span>
          </label>
          <label className="flex items-center gap-[0.4875rem] cursor-pointer group">
            <Checkbox
              id="has-sizes-false"
              checked={hasSizes === false}
              onCheckedChange={() =>
                updateFilter("hasSizes", hasSizes === false ? "" : "false")
              }
            />
            <span className="text-[11px] group-hover:text-primary transition-colors select-none">
              No Sizes
            </span>
          </label>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-[0.4875rem]">
        <div className="flex items-center gap-[0.325rem]">
          <div className="flex items-center justify-center w-[1.1375rem] h-[1.1375rem] rounded-[0.325rem] bg-yellow-500/10">
            <DollarSign className="h-[0.56875rem] w-[0.56875rem] text-yellow-600" />
          </div>
          <label className="text-[11px] font-semibold">Price Range</label>
        </div>
        <div className="flex items-center gap-[0.325rem]">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-[1.4625rem] text-[11px]"
          />
          <span className="text-muted-foreground text-[11px] flex-shrink-0">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-[1.4625rem] text-[11px]"
          />
        </div>
        <div className="flex gap-[0.325rem]">
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
              <X className="h-[0.56875rem] w-[0.56875rem]" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-[11.7rem] flex-shrink-0">
        <div className="sticky top-[3.9rem] h-[calc(100vh-4.55rem)] w-full">
          <div className="bg-card border rounded-[0.4875rem] shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-[0.8125rem] py-[0.65rem] border-b border-border/60 flex-shrink-0">
              <div className="flex items-center gap-[0.40625rem]">
                <SlidersHorizontal className="h-[0.8125rem] w-[0.8125rem] text-primary" />
                <h3 className="font-bold text-[12px]">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge className="rounded-full h-[0.8125rem] w-[0.8125rem] p-0 flex items-center justify-center text-[10px] font-bold">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[1.3rem] px-[0.325rem] text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-[0.24375rem] text-[11px]"
                  onClick={clearAllFilters}
                >
                  <FilterX className="h-[0.56875rem] w-[0.56875rem]" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="px-[0.8125rem] py-[0.4875rem] border-b border-border/40 flex-shrink-0 bg-muted/30">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {totalResults.toLocaleString()}
                </span>{" "}
                result{totalResults !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="p-[0.8125rem]">{filterContent}</div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden w-full">
        <div className="flex items-center gap-[0.4875rem] bg-card border rounded-[0.4875rem] px-[0.65rem] py-[0.4875rem] shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate">
              {totalResults.toLocaleString()} result
              {totalResults !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`
                : "No filters applied"}
            </p>
          </div>

          {/* All buttons have the same h-[2.75rem] touch target on mobile */}
          <div className="flex items-center gap-[0.325rem] flex-shrink-0">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-[2.75rem] px-[0.65rem] text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-[0.325rem] text-[12px]"
                onClick={clearAllFilters}
              >
                <FilterX className="h-[0.75rem] w-[0.75rem]" />
                Clear
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="h-[2.75rem] px-[0.65rem] gap-[0.325rem] text-[12px]">
                  <SlidersHorizontal className="h-[0.75rem] w-[0.75rem]" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-[0.08125rem] rounded-full h-[0.975rem] w-[0.975rem] p-0 flex items-center justify-center text-[10px] font-bold bg-white text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[13rem] sm:w-[15.6rem] p-0 flex flex-col"
              >
                <SheetHeader className="px-[0.8125rem] py-[0.65rem] border-b border-border/60 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-[0.40625rem]">
                      <SlidersHorizontal className="h-[0.8125rem] w-[0.8125rem] text-primary" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="rounded-full h-[0.8125rem] w-[0.8125rem] p-0 flex items-center justify-center text-[10px] font-bold">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </SheetTitle>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[1.3rem] px-[0.325rem] text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-[0.24375rem] text-[11px]"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-[0.56875rem] w-[0.56875rem]" />
                        Clear all
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground text-left mt-[0.1625rem]">
                    <span className="font-semibold text-foreground">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    result{totalResults !== 1 ? "s" : ""} found
                  </p>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-[0.8125rem]">{filterContent}</div>
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
