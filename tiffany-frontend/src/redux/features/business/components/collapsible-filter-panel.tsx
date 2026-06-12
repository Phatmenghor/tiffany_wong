"use client";

import React, { useState } from "react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronDown, Search } from "lucide-react";
import { FilterConfig, FilterPanelConfig } from "./filter-types";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { Badge } from "@/components/ui/badge";

interface CollapsibleFilterPanelProps {
  config: FilterPanelConfig;
  essentialFilterIds?: string[]; // Filters to show by default
}

/**
 * CollapsibleFilterPanel - Better UI for many filters
 * Shows essential filters by default, collapses optional filters
 *
 * Features:
 * - Cleaner UI with less clutter
 * - Toggle to show/hide advanced filters
 * - Shows count of active filters
 * - Mobile-friendly
 *
 * Usage:
 * ```tsx
 * <CollapsibleFilterPanel
 *   config={filterConfig}
 *   essentialFilterIds={['sortBy', 'sortDirection', 'search']}
 * />
 * ```
 */
export const CollapsibleFilterPanel: React.FC<CollapsibleFilterPanelProps> = ({
  config,
  essentialFilterIds = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const essentialFilters = config.filters.filter((f) =>
    essentialFilterIds.includes(f.id),
  );

  const advancedFilters = config.filters.filter(
    (f) => !essentialFilterIds.includes(f.id),
  );

  const activeFiltersCount = config.filters.filter((f) => {
    if (f.value === undefined || f.value === null) return false;
    if (typeof f.value === "string" && f.value === "ALL") return false;
    if (typeof f.value === "string" && f.value === "") return false;
    return true;
  }).length;

  const renderFilter = (filter: FilterConfig): React.ReactNode => {
    switch (filter.type) {
      case "select":
        return (
          <CustomSelect
            key={filter.id}
            options={filter.options || []}
            value={filter.value}
            placeholder={filter.placeholder || "Select..."}
            onValueChange={filter.onChange}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "combobox-categories":
        return (
          <ComboboxSelectCategories
            key={filter.id}
            dataSelect={filter.value as CategoriesResponseModel | null}
            onChangeSelected={filter.onChange}
            placeholder={filter.placeholder || "All Categories"}
            showAllOption={(filter as any).showAllOption !== false}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "input-number":
        return (
          <div key={filter.id} className="flex flex-col gap-[0.1625rem]">
            <label className="text-[12px] font-medium whitespace-nowrap">
              {filter.label}
            </label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={filter.placeholder || "0"}
              value={filter.value?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  filter.onChange(value ? parseInt(value) : undefined);
                }
              }}
              min={(filter as any).min || "0"}
              max={(filter as any).max}
              className="h-[1.625rem] text-[12px] w-full"
              disabled={filter.disabled}
            />
          </div>
        );

      case "input-text":
        return (
          <div key={filter.id} className="flex flex-col gap-[0.1625rem]">
            <label className="text-[12px] font-medium whitespace-nowrap">
              {filter.label}
            </label>
            <Input
              type="text"
              placeholder={filter.placeholder || "Enter text..."}
              value={filter.value?.toString() || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-[1.625rem] text-[12px] w-full"
              disabled={filter.disabled}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-[0.4875rem]">
      <Card>
        <CardContent className="py-[0.4875rem] sm:py-[0.8125rem] space-y-[0.4875rem]">
          {/* Title Section */}
          <div className="flex items-center gap-[0.325rem] mb-0">
            <h1 className="text-[13px] font-bold">{config.title}</h1>
          </div>

          {/* Row 1: Search (left) + Filters & Add Button (right, grouped) */}
          <div className="flex flex-wrap items-end gap-[0.4875rem]">
            {/* Search - Left side, h-[1.625rem] same as filters */}
            <div className="w-[300px] h-[1.625rem]">
              <div className="relative w-full h-full group">
                <Search className="absolute left-[0.4875rem] top-1/2 -translate-y-1/2 h-[0.65rem] w-[0.65rem] text-gray-400 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={config.searchPlaceholder}
                  className="pl-[1.625rem] w-full h-full placeholder:text-gray-500 focus:border-primary focus:ring-primary/30 hover:border-primary transition-all duration-200"
                  value={config.searchValue}
                  onChange={config.onSearchChange}
                />
              </div>
            </div>

            {/* Right side: Filters + Add Button (grouped together, pushed right, scrollable) */}
            <div className="flex flex-wrap items-end gap-[0.4875rem] ml-auto overflow-x-auto max-w-[calc(100vw-330px)] pb-[0.325rem]">
              {/* Essential Filters - Right side */}
              {essentialFilters.length > 0 && (
                <div className="grid gap-[0.4875rem] flex-shrink-0"
                  style={{
                    gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
                    maxWidth: '300px',
                  }}>
                  {essentialFilters.map((filter) => renderFilter(filter))}
                </div>
              )}

              {/* Add Button - Far right, h-[1.625rem] same as filters */}
              {config.buttonText && (
                <Button
                  disabled={config.buttonDisabled}
                  variant="default"
                  onClick={config.onButtonClick}
                  className="gap-[0.325rem] flex-shrink-0 h-[1.625rem] px-[0.65rem]"
                >
                  <Plus className="w-[0.65rem] h-[0.65rem]" />
                  {config.buttonText}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Section */}
      {advancedFilters.length > 0 && (
        <div className="bg-primary/5 rounded-[0.325rem] border border-primary/20 p-[0.4875rem]">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full hover:text-primary hover:bg-primary/10 px-[0.325rem] py-[0.1625rem] rounded-[0.1625rem] transition-all duration-200"
          >
            <div className="flex items-center gap-[0.325rem]">
              <span className="text-[12px] font-bold text-primary">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary border border-primary">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <ChevronDown
              className={`w-[0.65rem] h-[0.65rem] transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Advanced Filters Content - Responsive grid layout */}
          {showAdvanced && (
            <div className="mt-[0.4875rem] pt-[0.4875rem] border-t border-primary/20">
              <div
                className="grid gap-[0.4875rem] w-full"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                }}>
                {advancedFilters.map((filter) => renderFilter(filter))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
