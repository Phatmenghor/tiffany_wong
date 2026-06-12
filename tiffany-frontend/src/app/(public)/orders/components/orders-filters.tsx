import { Search, X } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { Input } from "@/components/ui/input";
import { ORDER_STATUS_ADMIN_FILTER, PAYMENT_STATUS_ADMIN_FILTER } from "@/constants/status/filter-status";

interface FilterState {
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  search: string;
}

interface OrdersFiltersProps {
  filters: FilterState;
  onStatusChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function OrdersFilters({
  filters,
  onStatusChange,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: OrdersFiltersProps) {
  return (
    <div className="mt-[1.3rem] mb-[0.975rem] space-y-[0.65rem]">
      {/* Search and Filters Row - Search left, Filters right */}
      <div className="flex flex-col sm:flex-row gap-[0.4875rem] items-start sm:items-end w-full">
        {/* Search Bar - Left side, takes available space */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <label className="text-[11px] font-semibold text-foreground mb-[0.325rem] block">
            Search Orders
          </label>
          <div className="relative">
            <Search className="absolute left-[0.4875rem] top-1/2 -translate-y-1/2 h-[0.65rem] w-[0.65rem] text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order number..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-[1.625rem] h-[1.7875rem] rounded-[0.325rem] border-border/70 bg-background text-[12px]"
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
        </div>

        {/* Filters and Clear Button Container - Right side */}
        <div className="flex flex-shrink-0 gap-[0.4875rem] items-end w-full sm:w-auto">
          {/* Order Status Filter */}
          <div className="w-auto flex-shrink-0
            [&>.space-y-2]:!w-auto [&>.space-y-2]:!flex [&>.space-y-2]:!flex-col [&>.space-y-2]:!gap-[0.1625rem]
            [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
            [&_.w-full]:!w-auto">
            <CustomSelect
              options={[
                { value: "", label: "All Order Status" },
                ...ORDER_STATUS_ADMIN_FILTER.filter(opt => opt.value !== "ALL"),
              ]}
              value={filters.status || ""}
              placeholder="Filter by order status"
              onValueChange={onStatusChange}
              label="Order Status"
              size="xl"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="w-auto flex-shrink-0
            [&>.space-y-2]:!w-auto [&>.space-y-2]:!flex [&>.space-y-2]:!flex-col [&>.space-y-2]:!gap-[0.1625rem]
            [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
            [&_.w-full]:!w-auto">
            <CustomSelect
              options={PAYMENT_STATUS_ADMIN_FILTER}
              value={filters.paymentStatus || "ALL"}
              placeholder="Filter by payment status"
              onValueChange={onPaymentStatusChange}
              label="Payment Status"
              size="xl"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="w-auto flex-shrink-0
            [&>.space-y-2]:!w-auto [&>.space-y-2]:!flex [&>.space-y-2]:!flex-col [&>.space-y-2]:!gap-[0.1625rem]
            [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
            [&_.w-full]:!w-auto">
            <CustomSelect
              options={[
                { value: "", label: "All Methods" },
                { value: "CASH", label: "Cash" },
                { value: "BANK", label: "Bank" },
              ]}
              value={filters.paymentMethod || ""}
              placeholder="Filter by payment method"
              onValueChange={onPaymentMethodChange}
              label="Payment Method"
              size="xl"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <CustomButton
              onClick={onClearFilters}
              variant="ghost"
              className="h-[1.7875rem] px-[0.65rem] flex items-center gap-[0.325rem] border border-border/50 flex-shrink-0"
            >
              <X className="h-[0.65rem] w-[0.65rem]" />
              Clear
            </CustomButton>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-[0.325rem] pt-[0.325rem]">
          {filters.status && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Order: {filters.status}</span>
              <button
                onClick={() => onStatusChange("")}
                className="hover:opacity-70"
              >
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
          {filters.paymentStatus && filters.paymentStatus !== "ALL" && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Payment: {filters.paymentStatus}</span>
              <button
                onClick={() => onPaymentStatusChange("ALL")}
                className="hover:opacity-70"
              >
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
          {filters.paymentMethod && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Method: {filters.paymentMethod}</span>
              <button
                onClick={() => onPaymentMethodChange("")}
                className="hover:opacity-70"
              >
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
          {filters.search && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Search: {filters.search}</span>
              <button
                onClick={() => onSearchChange("")}
                className="hover:opacity-70"
              >
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
