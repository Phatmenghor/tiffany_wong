"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useMyOrdersState } from "@/redux/features/main/store/state/my-orders-state";
import { fetchMyOrdersService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import {
  setLoadedFilters,
  clearOrders,
  updateOrderInList,
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
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";
import { OrdersPageSkeleton } from "./components/orders-page-skeleton";
import { OrdersFilters } from "./components/orders-filters";
import { OrdersEmptyState } from "./components/orders-empty-state";
import { OrdersErrorState } from "./components/orders-error-state";
import { createOrderTableColumns } from "./utils/create-order-table-columns";
import { OrderMobileCard } from "./components/order-mobile-card";
import { CustomButton } from "@/components/shared/button/custom-button";

type Order = OrderResponse;

interface FilterState {
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  search: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const reduxDispatch = useAppDispatch();
  const { isAuthenticated, authReady } = useAuthState();
  const { dispatch, orders, pagination, loading, error, loadedFilters } = useMyOrdersState();

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    search: "",
  });

  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [detailModalState, setDetailModalState] = useState<{ isOpen: boolean; order: OrderResponse | null }>({ isOpen: false, order: null });
  const [cancelModalState, setCancelModalState] = useState({ isOpen: false, orderId: "", orderNumber: "" });
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "orders" });

  const currentFilters = JSON.stringify({
    orderStatus: filters.status,
    paymentStatus: filters.paymentStatus,
    paymentMethod: filters.paymentMethod,
    search: filters.search,
  });

  const loadOrders = useCallback(async (pageNo: number) => {
    await dispatch(
      fetchMyOrdersService({
        pageNo,
        pageSize: 15,
        orderStatus: filters.status || undefined,
        paymentStatus: filters.paymentStatus && filters.paymentStatus !== "ALL" ? filters.paymentStatus : undefined,
        paymentMethod: filters.paymentMethod || undefined,
        search: filters.search || undefined,
      }),
    );
  }, [dispatch, filters]);

  // Filter change: clear + fetch page 1
  useEffect(() => {
    if (!authReady || !isAuthenticated || !mounted) return;
    if (loadedFilters === currentFilters) return;

    dispatch(clearOrders());
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(setLoadedFilters(currentFilters));
    loadOrders(1);
  }, [currentFilters, loadedFilters, authReady, isAuthenticated, mounted]);

  // Mobile infinite scroll load more
  const handleLoadMore = useCallback(() => {
    if (!pagination.hasMore || loading.list || orders.length === 0) return;
    loadOrders(pagination.currentPage + 1);
  }, [pagination.hasMore, pagination.currentPage, loading.list, orders.length, loadOrders]);

  const { handleLoadMore: debouncedLoadMore } = usePaginationLoadMore(
    handleLoadMore,
    pagination.hasMore && !loading.list,
    [pagination.hasMore, loading.list, handleLoadMore],
  );

  // Intersection observer
  useEffect(() => {
    if (!pagination.hasMore || !sentinelRef.current) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) debouncedLoadMore(); },
      { threshold: 0.1, rootMargin: "200px" },
    );
    observerRef.current = observer;
    observer.observe(sentinelRef.current);
    return () => { observer.disconnect(); observerRef.current = null; };
  }, [pagination.hasMore, debouncedLoadMore]);

  const handleViewOrder = (order: Order) => setDetailModalState({ isOpen: true, order });

  const handleCancelOrder = (order: Order) => {
    if (order.orderStatus !== "PENDING") { showToast.error("Only pending orders can be cancelled"); return; }
    setCancelModalState({ isOpen: true, orderId: order.id, orderNumber: order.orderNumber || "" });
  };

  const handleConfirmCancel = async (data: { status: "CANCELLED"; customerNote: string }) => {
    const orderId = cancelModalState.orderId;
    if (!orderId) return;
    try {
      setCancelingOrderId(orderId);
      const updatedOrder = await reduxDispatch(cancelOrderService({ orderId, customerNote: data.customerNote })).unwrap();
      dispatch(updateOrderInList(updatedOrder));
      showToast.success("Order cancelled successfully");
      setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" });
    } catch (error: any) {
      showToast.error(error?.message || "Failed to cancel order. Please try again.");
      throw error;
    } finally {
      setCancelingOrderId(null);
    }
  };

  // Desktop: clear first so append = replace for the clicked page
  const handlePageChange = (page: number) => {
    dispatch(clearOrders());
    setCurrentPage(page);
    loadOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = (value: string) => { setFilters((p) => ({ ...p, status: value })); setCurrentPage(1); };
  const handlePaymentStatusChange = (value: string) => { setFilters((p) => ({ ...p, paymentStatus: value })); setCurrentPage(1); };
  const handlePaymentMethodChange = (value: string) => { setFilters((p) => ({ ...p, paymentMethod: value })); setCurrentPage(1); };
  const handleClearFilters = () => { setFilters({ status: "", paymentStatus: "", paymentMethod: "", search: "" }); setCurrentPage(1); };

  const hasActiveFilters = !!(filters.status || filters.paymentStatus || filters.paymentMethod || filters.search);

  const tableColumns = useMemo(
    () => createOrderTableColumns(handleViewOrder, handleCancelOrder, cancelingOrderId, pagination),
    [cancelingOrderId, pagination],
  );

  const isInitialLoad = orders.length === 0 && loading.list;
  const isEmpty = orders.length === 0 && !loading.list;

  if (!mounted || !authReady) return <OrdersPageSkeleton />;

  if (!isAuthenticated) {
    return (
      <PageContainer className="py-[1.95rem]">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-[2.6rem] h-[2.6rem] rounded-[0.65rem] bg-primary/10 flex items-center justify-center mx-auto mb-[0.65rem]">
            <AlertCircle className="h-[1.3rem] w-[1.3rem] text-primary" />
          </div>
          <h1 className="text-[14px] font-bold mb-[0.325rem]">Sign In Required</h1>
          <p className="text-muted-foreground mb-[0.975rem]">Please sign in to view your orders.</p>
          <CustomButton onClick={() => router.push("/login")} className="w-full h-[1.7875rem] rounded-[0.4875rem]">
            Sign In
          </CustomButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-[0.975rem] sm:py-[1.3rem]">
      <PageHeader
        title="My Orders"
        subtitle={`You have ${pagination.totalElements} order${pagination.totalElements !== 1 ? "s" : ""}`}
      />

      <OrdersFilters
        filters={filters}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onPaymentMethodChange={handlePaymentMethodChange}
        onSearchChange={(value) => { setFilters((p) => ({ ...p, search: value })); setCurrentPage(1); }}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {error.list ? (
        <OrdersErrorState errorMessage={error.list} />
      ) : isEmpty ? (
        <OrdersEmptyState hasFilters={!!filters.status} />
      ) : (
        <>
          {/* Mobile + tablet (< lg): infinite scroll cards */}
          <div className="flex flex-col gap-[0.65rem] lg:hidden">
            {/* Initial load skeletons */}
            {isInitialLoad && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-[0.4875rem] border border-border bg-muted/30 h-[6rem] animate-pulse" />
            ))}

            {/* Order cards */}
            {orders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                onView={handleViewOrder}
                onCancel={handleCancelOrder}
                isCanceling={cancelingOrderId === order.id}
              />
            ))}

            {/* Load-more skeletons */}
            {loading.list && orders.length > 0 && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[0.4875rem] border border-border bg-muted/30 h-[6rem] animate-pulse" />
            ))}

            {/* Sentinel */}
            <div ref={sentinelRef} className="h-[1px]" />

            {!pagination.hasMore && orders.length > 0 && !loading.list && (
              <p className="text-center text-[11px] text-muted-foreground py-[0.65rem]">All orders loaded</p>
            )}
          </div>

          {/* Desktop (>= lg): paginated table */}
          <div className="hidden lg:block">
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
          </div>
        </>
      )}

      <CustomerOrderDetailModal
        order={detailModalState.order}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, order: null })}
      />

      <CancelOrderModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState({ isOpen: false, orderId: "", orderNumber: "" })}
        orderId={cancelModalState.orderId}
        orderNumber={cancelModalState.orderNumber}
        onConfirm={handleConfirmCancel}
      />
    </PageContainer>
  );
}
