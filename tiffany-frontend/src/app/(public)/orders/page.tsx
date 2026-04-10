"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useMyOrdersState } from "@/redux/features/main/store/state/my-orders-state";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import {
  setLoadedFilters,
  clearOrders,
} from "@/redux/features/main/store/slice/my-orders-slice";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { CustomerOrderDetailModal } from "@/components/shared/modal/customer-order-detail-modal";
import { CancelOrderModal } from "@/components/shared/modal/cancel-order-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch } from "@/redux/store/hooks";
import { cancelOrderService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { OrdersPageSkeleton } from "./components/orders-page-skeleton";
import { OrdersFilters } from "./components/orders-filters";
import { OrdersEmptyState } from "./components/orders-empty-state";
import { OrdersErrorState } from "./components/orders-error-state";
import { createOrderTableColumns } from "./utils/create-order-table-columns";
import { CustomButton } from "@/components/shared/button/custom-button";

type Order = OrderResponse;

interface StatusTab {
  value: string;
  label: string;
}

interface FilterState {
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  search: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const reduxDispatch = useAppDispatch();
  const { isAuthenticated, profile, authReady } = useAuthState();
  const {
    dispatch,
    orders,
    pagination,
    loading,
    error,
    statusTabs,
    loadedFilters,
  } = useMyOrdersState();

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    search: "",
  });

  const [mounted, setMounted] = useState(false);
  const [displayTabs, setDisplayTabs] = useState<StatusTab[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    orderId: "",
  });
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    orderId: "",
    orderNumber: "",
  });
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart scroll restoration: Keep position on navigation, reset on browser refresh
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "orders",
  });

  // Build current filters string for comparison
  const currentFilters = JSON.stringify({
    orderStatus: filters.status,
    paymentStatus: filters.paymentStatus,
    paymentMethod: filters.paymentMethod,
    search: filters.search,
  });

  // Build display tabs from Redux status tabs
  useEffect(() => {
    const tabs: StatusTab[] = [
      { value: "", label: "All Orders" },
      ...(statusTabs || []).map((status: any) => ({
        value: status.name,
        label: status.name,
      })),
    ];
    setDisplayTabs(tabs);
  }, [statusTabs]);

  // Load orders function
  const loadOrders = async (pageNo: number) => {
    await dispatch(
      fetchMyOrdersService({
        pageNo,
        pageSize: 15,
        orderStatus: filters.status || undefined,
        paymentStatus:
          filters.paymentStatus && filters.paymentStatus !== "ALL"
            ? filters.paymentStatus
            : undefined,
        paymentMethod: filters.paymentMethod || undefined,
        search: filters.search || undefined,
      }),
    );
  };

  // Main fetch effect
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;

    const hasOrdersInStore = orders.length > 0;
    const filtersMatch = loadedFilters === currentFilters;

    // If data exists and filters match, don't fetch
    if (hasOrdersInStore && filtersMatch) {
      return;
    }

    // Need to fetch if filters changed or no data
    if (!filtersMatch || !hasOrdersInStore) {
      // Clear old data if filters changed
      if (!filtersMatch && hasOrdersInStore) {
        dispatch(clearOrders());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      setCurrentPage(1);
      dispatch(setLoadedFilters(currentFilters));
      loadOrders(1);
    }
  }, [
    currentFilters,
    loadedFilters,
    orders.length,
    dispatch,
    authReady,
    isAuthenticated,
    mounted,
  ]);

  const handleViewOrder = (order: Order) => {
    setDetailModalState({ isOpen: true, orderId: order.id });
  };

  const handleCancelOrder = (order: Order) => {
    // Only allow canceling PENDING orders
    if (order.orderStatus !== "PENDING") {
      showToast.error("Only pending orders can be cancelled");
      return;
    }

    // Open cancel modal instead of calling API directly
    setCancelModalState({
      isOpen: true,
      orderId: order.id,
      orderNumber: order.orderNumber || "",
    });
  };

  const handleConfirmCancel = async (data: {
    status: "CANCELLED";
    customerNote: string;
  }) => {
    const orderId = cancelModalState.orderId;
    if (!orderId) return;

    try {
      setCancelingOrderId(orderId);

      // Call the cancel order service from Redux
      await reduxDispatch(cancelOrderService(orderId)).unwrap();

      showToast.success("Order cancelled successfully");

      // Close the modal
      setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" });

      // Reload orders to reflect the cancellation
      loadOrders(currentPage);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to cancel order. Please try again.";
      showToast.error(errorMessage);
      throw error; // Re-throw to let the modal handle it
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setCurrentPage(1);
  };

  const handlePaymentStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus: value }));
    setCurrentPage(1);
  };

  const handlePaymentMethodChange = (value: string) => {
    setFilters((prev) => ({ ...prev, paymentMethod: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      paymentMethod: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(filters.status || filters.paymentStatus || filters.paymentMethod || filters.search);

  // Create table columns
  const tableColumns = useMemo(
    () =>
      createOrderTableColumns(
        handleViewOrder,
        handleCancelOrder,
        cancelingOrderId,
        pagination,
      ),
    [cancelingOrderId, pagination],
  );

  const totalOrders = pagination.totalElements;

  // Prevent hydration mismatch
  if (!mounted || !authReady) {
    return <OrdersPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageContainer className="py-12">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your orders.
          </p>
          <CustomButton
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-xl"
          >
            Sign In
          </CustomButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6 sm:py-8">
      {/* Header */}
      <PageHeader
        title="My Orders"
        subtitle={`You have ${totalOrders} order${totalOrders !== 1 ? "s" : ""}`}
        icon={ShoppingBag}
      />

      {/* Filters Section */}
      <OrdersFilters
        filters={filters}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onPaymentMethodChange={handlePaymentMethodChange}
        onSearchChange={(value) => {
          setFilters((prev) => ({ ...prev, search: value }));
          setCurrentPage(1);
        }}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Data Table */}
      {!isAuthenticated ? (
        <OrdersErrorState isUnauthenticated />
      ) : error.list ? (
        <OrdersErrorState errorMessage={error.list} />
      ) : orders.length === 0 && !loading.list ? (
        <OrdersEmptyState hasFilters={!!filters.status} />
      ) : (
        <DataTableWithPagination
          data={orders}
          columns={tableColumns}
          loading={loading.list}
          emptyMessage="No orders found"
          getRowKey={(order) => order.id}
          currentPage={currentPage}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          pageSize={15}
          pageSizeOptions={[15]}
          showPageSizeSelector={false}
          hideEllipsis={true}
        />
      )}

      {/* Detail Modal */}
      <CustomerOrderDetailModal
        orderId={detailModalState.orderId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, orderId: "" })}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModalState.isOpen}
        onClose={() =>
          setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" })
        }
        orderId={cancelModalState.orderId}
        orderNumber={cancelModalState.orderNumber}
        onConfirm={handleConfirmCancel}
      />
    </PageContainer>
  );
}
