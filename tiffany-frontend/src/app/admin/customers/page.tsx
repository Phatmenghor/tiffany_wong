"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { userBusinessTableColumns } from "@/redux/features/auth/table/users-business-table";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useCustomersState } from "@/redux/features/auth/store/state/customers-state";
import { usePagination } from "@/redux/store/use-pagination";
import {
  fetchAllCustomersService,
  deleteCustomerService,
  toggleCustomerStatusService,
} from "@/redux/features/auth/store/thunks/customers-thunks";
import {
  setCustomerAccountStatusFilter,
  setCustomerPageNo,
  setCustomerSearchFilter,
  resetCustomerState,
  toggleCustomerStatusOptimistic,
  revertCustomerStatusOptimistic,
} from "@/redux/features/auth/store/slice/customers-slice";
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";
import { ACCOUNT_STATUS_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AccountStatus } from "@/constants/status/status";
import CustomerModal from "@/redux/features/auth/components/customer-modal";
import { UserBusinessDetailModal } from "@/redux/features/auth/components/user-business-detail-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store/hooks";

export default function CustomerUsersPage() {
  useAdminCleanup(resetCustomerState);

  const { filters, pagination, customersData, customersContent, customerState, isLoading, operations, dispatch } = useCustomersState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.CUSTOMERS || "/admin/customers",
    syncPageToRedux: (page) => dispatch(setCustomerPageNo(page)),
  });

  useEffect(() => {
    const filterPayload = {
      search: debouncedSearch.trim() || undefined,
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      userRoles: [],
      userTypes: ["CUSTOMER"],
      accountStatuses: filters.accountStatus === AccountStatus.ALL ? [] : [filters.accountStatus],
    };
    dispatch(fetchAllCustomersService(filterPayload));
  }, [dispatch, debouncedSearch, filters.accountStatus, filters.pageNo, globalPageSize]);

  const [modalState, setModalState] = useState({ isOpen: false, userId: "" });
  const [detailModalState, setDetailModalState] = useState({ isOpen: false, userBusinessId: "" });
  const [resetPasswordState, setResetPasswordState] = useState({
    isOpen: false,
    userBusinessId: "",
    userName: "",
    userRole: [] as string[],
    profileImageUrl: "",
  });
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    user: null as UserResponseModel | null,
  });

  const handleEditUser = (user: UserResponseModel) => setModalState({ isOpen: true, userId: user?.id || "" });
  const handleViewDetail = (user: UserResponseModel) => setDetailModalState({ isOpen: true, userBusinessId: user.id || "" });
  const handleResetPassword = (user: UserResponseModel) =>
    setResetPasswordState({ isOpen: true, userBusinessId: user.id || "", userName: user.userIdentifier || "", userRole: user.userRole ? [user.userRole] : [], profileImageUrl: user.profileImageUrl || "" });
  const handleDeleteUser = (user: UserResponseModel) => setDeleteState({ isOpen: true, user });

  const handleToggleStatus = (user: UserResponseModel) => {
    if (!user?.id) return;
    const newStatus = user.accountStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const oldStatus = user.accountStatus;

    dispatch(toggleCustomerStatusOptimistic({ userId: user.id, newStatus }));

    dispatch(toggleCustomerStatusService(user))
      .unwrap()
      .then(() => { showToast.success("Customer status updated"); })
      .catch((error: any) => {
        dispatch(revertCustomerStatusOptimistic({ userId: user.id, oldStatus }));
        showToast.error(error || "Failed to update customer status");
      });
  };

  const tableHandlers = useMemo(
    () => ({ handleEditUser, handleViewUserDetail: handleViewDetail, handleResetPassword, handleDeleteUser, handleToggleStatus }),
    [],
  );

  const columns = useMemo(
    () => userBusinessTableColumns({ data: customersData, handlers: tableHandlers }),
    [customerState, tableHandlers],
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setCustomerPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setCustomerPageNo(1));
  };

  const handleDelete = async () => {
    if (!deleteState.user?.id) return;
    try {
      await dispatch(deleteCustomerService(deleteState.user.id)).unwrap();
      showToast.success(`Customer "${deleteState.user.fullName ?? ""}" deleted successfully`);
      closeDeleteModal();
      if (customersContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setCustomerPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete customer");
    }
  };

  const closeModal = () => setModalState({ isOpen: false, userId: "" });
  const closeDetailModal = () => setDetailModalState({ isOpen: false, userBusinessId: "" });
  const closeResetPasswordModal = () => setResetPasswordState({ isOpen: false, userBusinessId: "", userName: "", userRole: [], profileImageUrl: "" });
  const closeDeleteModal = () => setDeleteState({ isOpen: false, user: null });

  return (
    <div className="flex flex-1 flex-col gap-[0.65rem] px-[0.325rem]">
      <div className="space-y-[0.65rem]">
        <CardHeaderSection
          title="Customers"
          searchValue={filters.search}
          searchPlaceholder="Search by phone number..."
          onSearchChange={(e) => dispatch(setCustomerSearchFilter(e.target.value))}
        >
          <div className="flex flex-wrap items-center gap-[0.325rem]">
            <CustomSelect
              options={ACCOUNT_STATUS_FILTER}
              value={filters.accountStatus}
              placeholder="All Status"
              onValueChange={(value) => dispatch(setCustomerAccountStatusFilter(value as AccountStatus))}
              label="Account Status"
            />
          </div>
        </CardHeaderSection>

        <DataTableWithPagination
          data={customersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No customers found"
          getRowKey={(user) => user.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <CustomerModal isOpen={modalState.isOpen} onClose={closeModal} userId={modalState.userId} />
      <UserBusinessDetailModal userId={detailModalState.userBusinessId} isOpen={detailModalState.isOpen} onClose={closeDetailModal} />
      <ResetPasswordModal isOpen={resetPasswordState.isOpen} userName={resetPasswordState.userName} userRole={resetPasswordState.userRole} profileImageUrl={resetPasswordState.profileImageUrl} onClose={closeResetPasswordModal} userId={resetPasswordState.userBusinessId} />
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete this customer ${deleteState.user?.userIdentifier || deleteState.user?.email}?`}
        itemName={deleteState.user?.fullName || deleteState.user?.email}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
