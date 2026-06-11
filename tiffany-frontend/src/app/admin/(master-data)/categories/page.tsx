"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { useCategoriesState } from "@/redux/features/master-data/store/state/categories-state";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  setSearchFilter,
  setStatusFilter,
  resetState,
  updateCategoryStatusOptimistic,
} from "@/redux/features/master-data/store/slice/categories-slice";
import {
  deleteCategoriesService,
  toggleCategoriesStatusService,
  fetchAllCategoriesWithProductCountService,
} from "@/redux/features/master-data/store/thunks/categories-thunks";
import {
  selectCategoriesWithProductCountContent,
} from "@/redux/features/master-data/store/selectors/categories-selector";
import { categoriesTableColumns } from "@/redux/features/master-data/table/categories-table";
import CategoriesModal from "@/redux/features/master-data/components/categories-modal";
import { CategoriesDetailModal } from "@/redux/features/master-data/components/categories-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useAppSelector } from '@/redux/store/hooks';

export default function CategoriesPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);

  // Redux state
  const {
    categoriesState,
    isLoading,
    filters,
    operations,
    dispatch,
  } = useCategoriesState();

  // Use categories with product count for admin page display
  const categoriesWithProductCount = useAppSelector(selectCategoriesWithProductCountContent);

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    categories: null as CategoriesResponseModel | null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    categories: null as CategoriesResponseModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    categories: null as CategoriesResponseModel | null,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    dispatch(
      fetchAllCategoriesWithProductCountService({
        search: debouncedSearch,
        status: filters.status == Status.ALL ? undefined : filters.status,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
  ]);

  // Event handlers
  const handleCreateCategories = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      categories: null,
    });
  };

  const handleEditCategories = (categories: CategoriesResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      categories: categories,
    });
  };

  const handleCategoriesViewDetail = (categories: CategoriesResponseModel) => {
    setDetailModalState({
      isOpen: true,
      categories: categories,
    });
  };

  const handleDeleteCategories = (categories: CategoriesResponseModel) => {
    setDeleteState({
      isOpen: true,
      categories: categories,
    });
  };

  const handleToggleCategoryStatus = (category: CategoriesResponseModel) => {
    if (!category?.id) return;

    // Calculate new status optimistically
    const newStatus = category.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

    // Update local state immediately (optimistic)
    dispatch(updateCategoryStatusOptimistic({ id: category.id, status: newStatus }));
    showToast.success("Category status updated successfully");

    // Call API in background
    dispatch(toggleCategoriesStatusService(category)).catch((error: any) => {
      // If API fails, revert the optimistic update
      dispatch(updateCategoryStatusOptimistic({ id: category.id, status: category.status }));
      showToast.error(error || "Failed to update category status");
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditCategories,
      handleCategoriesViewDetail,
      handleDeleteCategories,
      handleToggleCategoryStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      categoriesTableColumns({
        data: categoriesState?.dataWithProductCount,
        handlers: tableHandlers,
      }),
    [categoriesState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: Status) => {
    dispatch(setStatusFilter(status));
  };

  const handleDelete = async () => {
    if (!deleteState.categories?.id) return;

    try {
      await dispatch(
        deleteCategoriesService(deleteState.categories.id),
      ).unwrap();

      showToast.success(
        `Categories "${deleteState.categories.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();
    } catch (error: any) {
      showToast.error(error || "Failed to delete categories");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      categories: null,
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      categories: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      categories: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Categories Information"
          searchValue={filters.search}
          searchPlaceholder="Search categories..."
          buttonTooltip="Create a new banner"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateCategories}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Categories Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table without Pagination */}
        <DataTableWithPagination
          data={categoriesWithProductCount}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Categories found"
          getRowKey={(categories) => categories.id}
          currentPage={1}
          totalElements={categoriesWithProductCount.length}
          totalPages={1}
          pageSize={categoriesWithProductCount.length || 10}
          onPageChange={() => {}}
          showPagination={false}
        />
      </div>

      {/* Modals Add/Edit */}
      <CategoriesModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        categories={modalState.categories}
        mode={modalState.mode}
      />

      {/* Modals categories Detail */}
      <CategoriesDetailModal
        categories={detailModalState.categories}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Categories"
        description={`Are you sure you want to delete this categories ${
          deleteState.categories?.name || ""
        }?`}
        itemName={deleteState.categories?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
