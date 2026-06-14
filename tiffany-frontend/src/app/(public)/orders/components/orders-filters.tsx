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
      {/* Search bar — full width */}
      <div className="relative w-full">
        <Search className="absolute left-[0.4875rem] top-1/2 -translate-y-1/2 h-[0.65rem] w-[0.65rem] text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by order number..."
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

      {/* Filter dropdowns — 2-col on mobile, 4-col on sm */}
      <div className="grid grid-cols-2 lg:flex lg:flex-row gap-[0.4875rem] w-full">
        <div className="w-full">
          <CustomSelect
            options={[
              { value: "", label: "All Status" },
              ...ORDER_STATUS_ADMIN_FILTER.filter(opt => opt.value !== "ALL"),
            ]}
            value={filters.status || ""}
            placeholder="Order Status"
            onValueChange={onStatusChange}
            label="Order Status"
            size="xl"
          />
        </div>

        <div className="w-full">
          <CustomSelect
            options={PAYMENT_STATUS_ADMIN_FILTER}
            value={filters.paymentStatus || "ALL"}
            placeholder="Payment Status"
            onValueChange={onPaymentStatusChange}
            label="Payment Status"
            size="xl"
          />
        </div>

        <div className="w-full">
          <CustomSelect
            options={[
              { value: "", label: "All Methods" },
              { value: "CASH", label: "Cash" },
              { value: "BANK", label: "Bank" },
            ]}
            value={filters.paymentMethod || ""}
            placeholder="Payment Method"
            onValueChange={onPaymentMethodChange}
            label="Payment Method"
            size="xl"
          />
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <CustomButton
              onClick={onClearFilters}
              variant="ghost"
              className="w-full lg:w-auto h-[2.375rem] lg:h-[1.625rem] px-[0.65rem] flex items-center justify-center gap-[0.325rem] border border-border/50"
            >
              <X className="h-[0.65rem] w-[0.65rem]" />
              Clear
            </CustomButton>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-[0.325rem]">
          {filters.status && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Order: {filters.status}</span>
              <button onClick={() => onStatusChange("")} className="hover:opacity-70">
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
          {filters.paymentStatus && filters.paymentStatus !== "ALL" && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Payment: {filters.paymentStatus}</span>
              <button onClick={() => onPaymentStatusChange("ALL")} className="hover:opacity-70">
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
          {filters.paymentMethod && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Method: {filters.paymentMethod}</span>
              <button onClick={() => onPaymentMethodChange("")} className="hover:opacity-70">
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
          {filters.search && (
            <div className="inline-flex items-center gap-[0.1625rem] px-[0.4875rem] py-[0.1625rem] rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
              <span>Search: {filters.search}</span>
              <button onClick={() => onSearchChange("")} className="hover:opacity-70">
                <X className="h-[0.4875rem] w-[0.4875rem]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
