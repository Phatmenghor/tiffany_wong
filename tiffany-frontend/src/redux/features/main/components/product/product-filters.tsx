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
  SheetClose,
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

// Keep only digits and a single decimal point (no spinner arrows, no negatives)
function sanitizePrice(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
}

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

  // Filter content — shared between desktop sidebar and mobile bottom sheet
  const filterContent = (
    <div className="space-y-[1rem]">
      {/* Promotion toggle */}
      {!lockedPromotion && (
        <div
          className={cn(
            "flex items-center justify-between rounded-[0.65rem] px-[0.75rem] py-[0.65rem] border-2 transition-all cursor-pointer active:opacity-75",
            hasPromotion
              ? "border-orange-400/70 bg-orange-500/8"
              : "border-border/50 hover:border-orange-300/60",
          )}
          onClick={() => updateFilter("hasPromotion", hasPromotion ? "" : "true")}
        >
          <div className="flex items-center gap-[0.6rem]">
            <div className={cn(
              "flex items-center justify-center w-[2rem] h-[2rem] rounded-[0.5rem] transition-colors",
              hasPromotion ? "bg-orange-500/20" : "bg-orange-500/10",
            )}>
              <Flame className={cn("h-[1rem] w-[1rem]", hasPromotion ? "text-orange-500" : "text-orange-400")} />
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-tight">On Sale Only</p>
              <p className="text-[11px] text-muted-foreground">Promotional items</p>
            </div>
          </div>
          <Switch
            checked={hasPromotion}
            onCheckedChange={(checked) => updateFilter("hasPromotion", checked ? "true" : "")}
            onClick={(e) => e.stopPropagation()}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      )}

      {/* Category */}
      <div className="space-y-[0.4rem]">
        <label className="text-[12px] font-semibold text-foreground/80 uppercase tracking-wide">Category</label>
        <ComboboxSelectCategoriesPublic
          selectedCategory={selectedCategory}
          onChangeSelected={(categoryId) => updateFilter("categoryId", categoryId)}
          label=""
          size="md"
          placeholder="All Categories"
        />
      </div>

      {/* Product Size */}
      <div className="space-y-[0.5rem]">
        <div className="flex items-center gap-[0.4rem]">
          <ListChecks className="h-[0.875rem] w-[0.875rem] text-blue-500" />
          <label className="text-[12px] font-semibold text-foreground/80 uppercase tracking-wide">Size Type</label>
        </div>
        <div className="grid grid-cols-2 gap-[0.4rem]">
          <button
            onClick={() => updateFilter("hasSizes", hasSizes === true ? "" : "true")}
            className={cn(
              "flex items-center justify-center rounded-[0.5rem] border-2 px-[0.5rem] h-[1.875rem] text-[12px] font-medium transition-all active:opacity-75",
              hasSizes === true
                ? "border-blue-500 text-blue-600"
                : "border-border/60 text-muted-foreground hover:border-blue-300",
            )}
          >
            Has Sizes
          </button>
          <button
            onClick={() => updateFilter("hasSizes", hasSizes === false ? "" : "false")}
            className={cn(
              "flex items-center justify-center rounded-[0.5rem] border-2 px-[0.5rem] h-[1.875rem] text-[12px] font-medium transition-all active:opacity-75",
              hasSizes === false
                ? "border-blue-500 text-blue-600"
                : "border-border/60 text-muted-foreground hover:border-blue-300",
            )}
          >
            No Sizes
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-[0.5rem]">
        <div className="flex items-center gap-[0.4rem]">
          <DollarSign className="h-[0.875rem] w-[0.875rem] text-yellow-600" />
          <label className="text-[12px] font-semibold text-foreground/80 uppercase tracking-wide">Price Range</label>
        </div>
        <div className="flex items-center gap-[0.4rem]">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(sanitizePrice(e.target.value))}
            className="h-[2.5rem] sm:h-[1.625rem] text-[13px] sm:text-[11px] rounded-[0.5rem]"
          />
          <span className="text-muted-foreground text-[13px] flex-shrink-0 font-medium">–</span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(sanitizePrice(e.target.value))}
            className="h-[2.5rem] sm:h-[1.625rem] text-[13px] sm:text-[11px] rounded-[0.5rem]"
          />
        </div>
        <div className="flex gap-[0.4rem]">
          <Button
            size="sm"
            className="flex-1 h-[2.5rem] sm:h-[1.625rem] rounded-[0.5rem] text-[13px] sm:text-[11px]"
            onClick={applyPrice}
            disabled={!minPrice && !maxPrice}
          >
            Apply Price
          </Button>
          {hasPriceFilter && (
            <Button
              size="sm"
              variant="outline"
              className="h-[2.5rem] sm:h-[1.625rem] px-[0.65rem] rounded-[0.5rem]"
              onClick={clearPrice}
            >
              <X className="h-[0.75rem] w-[0.75rem]" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex w-[12.5rem] flex-shrink-0">
        <div className="sticky top-[3.9rem] h-[calc(100vh-4.55rem)] w-full">
          <div className="bg-card border rounded-[0.65rem] shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-[0.9rem] py-[0.75rem] border-b border-border/60 flex-shrink-0 bg-muted/20">
              <div className="flex items-center gap-[0.4rem]">
                <SlidersHorizontal className="h-[0.875rem] w-[0.875rem] text-primary" />
                <h3 className="font-bold text-[13px]">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-[0.4rem] py-[0.05rem] text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[1.5rem] px-[0.4rem] text-destructive hover:bg-destructive/10 gap-[0.2rem] text-[11px]"
                  onClick={clearAllFilters}
                >
                  <FilterX className="h-[0.6rem] w-[0.6rem]" />
                  Reset
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="px-[0.9rem] py-[0.5rem] border-b border-border/40 flex-shrink-0">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span>
                {" "}result{totalResults !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="p-[0.9rem]">{filterContent}</div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* ── Mobile Filters ── */}
      <div className="lg:hidden w-full space-y-[0.4875rem]">
        {/* Top bar: results count + Filter button */}
        <div className="flex items-center gap-[0.4875rem]">
          {/* Results */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              {totalResults.toLocaleString()}
              <span className="text-muted-foreground font-normal">
                {" "}result{totalResults !== 1 ? "s" : ""}
              </span>
            </p>
          </div>

          {/* Filters button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                size="sm"
                className="h-[2.625rem] px-[0.975rem] gap-[0.4rem] text-[13px] font-semibold rounded-full"
              >
                <SlidersHorizontal className="h-[0.875rem] w-[0.875rem]" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-[0.1rem] bg-white/25 text-inherit rounded-full px-[0.4rem] py-[0.05rem] text-[11px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            {/* Bottom sheet on mobile */}
            <SheetContent
              side="bottom"
              className="p-0 flex flex-col max-h-[82dvh] rounded-t-[0.975rem]"
            >
              {/* Drag handle */}
              <div className="mx-auto mt-[0.5rem] mb-[0.25rem] h-[0.25rem] w-[2rem] rounded-full bg-muted-foreground/20 flex-shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-border/60 flex-shrink-0">
                <div className="flex items-center gap-[0.5rem]">
                  <SlidersHorizontal className="h-[1rem] w-[1rem] text-primary" />
                  <SheetTitle className="text-[15px] font-bold">Filters</SheetTitle>
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary text-primary-foreground rounded-full px-[0.4rem] py-[0.05rem] text-[11px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-[2rem] px-[0.65rem] text-destructive hover:bg-destructive/10 gap-[0.325rem] text-[12px]"
                    onClick={clearAllFilters}
                  >
                    <FilterX className="h-[0.75rem] w-[0.75rem]" />
                    Reset all
                  </Button>
                )}
              </div>

              {/* Scrollable filter content */}
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="px-[1rem] py-[0.75rem] space-y-[1rem]">
                  {filterContent}
                </div>
              </ScrollArea>

              {/* Sticky footer */}
              <div className="flex-shrink-0 border-t border-border/60 px-[1rem] py-[0.75rem] bg-background pb-[max(0.75rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))]">
                <SheetClose asChild>
                  <Button className="w-full h-[3rem] text-[14px] font-semibold rounded-full gap-[0.4rem]">
                    Show {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filter chips — horizontally scrollable */}
        {activeFiltersCount > 0 && (
          <div className="flex gap-[0.4rem] overflow-x-auto pb-[0.1rem] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
            {!lockedPromotion && hasPromotion && (
              <button
                onClick={() => updateFilter("hasPromotion", "")}
                className="flex-shrink-0 flex items-center gap-[0.3rem] bg-orange-500/10 text-orange-600 border border-orange-400/40 rounded-full px-[0.65rem] h-[1.875rem] text-[12px] font-medium active:opacity-70"
              >
                <Flame className="h-[0.75rem] w-[0.75rem]" />
                On Sale
                <X className="h-[0.6rem] w-[0.6rem] opacity-60" />
              </button>
            )}
            {selectedCategory && (
              <button
                onClick={() => updateFilter("categoryId", "")}
                className="flex-shrink-0 flex items-center gap-[0.3rem] bg-primary/10 text-primary border border-primary/30 rounded-full px-[0.65rem] h-[1.875rem] text-[12px] font-medium active:opacity-70"
              >
                Category
                <X className="h-[0.6rem] w-[0.6rem] opacity-60" />
              </button>
            )}
            {hasSizes !== null && (
              <button
                onClick={() => updateFilter("hasSizes", "")}
                className="flex-shrink-0 flex items-center gap-[0.3rem] bg-blue-500/10 text-blue-600 border border-blue-400/40 rounded-full px-[0.65rem] h-[1.875rem] text-[12px] font-medium active:opacity-70"
              >
                {hasSizes ? "Has Sizes" : "No Sizes"}
                <X className="h-[0.6rem] w-[0.6rem] opacity-60" />
              </button>
            )}
            {hasPriceFilter && (
              <button
                onClick={clearPrice}
                className="flex-shrink-0 flex items-center gap-[0.3rem] bg-yellow-500/10 text-yellow-700 border border-yellow-400/40 rounded-full px-[0.65rem] h-[1.875rem] text-[12px] font-medium active:opacity-70"
              >
                {urlMinPrice && urlMaxPrice ? `$${urlMinPrice}–$${urlMaxPrice}` : urlMinPrice ? `≥$${urlMinPrice}` : `≤$${urlMaxPrice}`}
                <X className="h-[0.6rem] w-[0.6rem] opacity-60" />
              </button>
            )}
          </div>
        )}
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
