import { Search, X } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { Input } from "@/components/ui/input";
import { ORDER_STATUS_ADMIN_FILTER } from "@/constants/status/filter-status";

interface FilterState {
  status: string;
  search: string;
}

interface OrdersFiltersProps {
  filters: FilterState;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function OrdersFilters({
  filters,
  onStatusChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: OrdersFiltersProps) {
  return (
    <div className="mt-[1.3rem] mb-[0.975rem] space-y-[0.65rem]">
      {/* Search + Order Status on same row */}
      <div className="flex items-center gap-[0.4875rem]">
        <div className="relative flex-1">
          <Search className="absolute left-[0.4875rem] top-1/2 -translate-y-1/2 h-[0.65rem] w-[0.65rem] text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by order number or phone..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-[1.625rem] pr-[1.625rem]"
          />
          {filters.search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-[0.4875rem] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-[0.65rem] w-[0.65rem]" />
            </button>
          )}
        </div>

        <div className="w-[9rem] shrink-0">
          <CustomSelect
            options={[
              { value: "", label: "All Status" },
              ...ORDER_STATUS_ADMIN_FILTER.filter(opt => opt.value !== "ALL"),
            ]}
            value={filters.status || ""}
            placeholder="Order Status"
            onValueChange={onStatusChange}
            size="xl"
          />
        </div>

        {hasActiveFilters && (
          <CustomButton
            onClick={onClearFilters}
            variant="ghost"
            className="shrink-0 h-[2.375rem] lg:h-[1.625rem] px-[0.65rem] flex items-center gap-[0.325rem] border border-border/50"
          >
            <X className="h-[0.65rem] w-[0.65rem]" />
            Clear
          </CustomButton>
        )}
      </div>
    </div>
  );
}
