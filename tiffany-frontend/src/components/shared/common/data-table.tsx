"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSizeSelectField } from "@/components/shared/form-field/page-size-select-field";
import { cn } from "@/lib/utils";

// Constants
const PAGINATION_ITEMS_THRESHOLD = 7;
const PAGINATION_START_OFFSET = 2;
const PAGINATION_WINDOW_SIZE = 4;
const PAGINATION_SIDE_ITEMS = 3;

export interface TableColumn<T = any> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  truncate?: boolean;
  maxWidth?: string;
  minWidth?: string;
  width?: string;
}

interface DataTableWithPaginationProps<T = any> {
  data: T[] | null;
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  getRowKey?: (item: T, index: number) => string | number;

  // Pagination props
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  paginationSize?: "sm" | "md" | "lg";
  showPagination?: boolean;
  hideEllipsis?: boolean;

  // Page size selector props
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export function DataTableWithPagination<T = any>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  className = "",
  onRowClick,
  getRowKey = (_, index) => index,
  currentPage,
  totalPages,
  onPageChange,
  paginationSize = "md",
  showPagination = true,
  hideEllipsis = false,
  pageSize = 10,
  totalElements = 0,
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
}: DataTableWithPaginationProps<T>) {
  const tableData: T[] = Array.isArray(data) ? data : [];

  const sizeClasses = {
    sm: {
      button: "h-[1.3rem] px-[0.4875rem] text-[0.4875rem]",
      icon: "h-[0.4875rem] w-[0.4875rem]",
      pageButton: "h-[1.3rem] min-w-[1.3rem] text-[0.4875rem]",
    },
    md: {
      button: "h-[1.4625rem] px-[0.65rem] text-[0.56875rem]",
      icon: "h-[0.65rem] w-[0.65rem]",
      pageButton: "h-[1.4625rem] min-w-[1.4625rem] text-[0.56875rem]",
    },
    lg: {
      button: "h-[1.625rem] px-[0.8125rem] text-[0.65rem]",
      icon: "h-[0.8125rem] w-[0.8125rem]",
      pageButton: "h-[1.625rem] min-w-[1.625rem] text-[0.65rem]",
    },
  };

  const classes = sizeClasses[paginationSize];

  const getPaginationItems = (): (number | "ellipsis")[] => {
    const items: (number | "ellipsis")[] = [];

    if (totalPages <= PAGINATION_ITEMS_THRESHOLD) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      // Center current page with 2 pages on each side (5 total pages)
      let start = Math.max(PAGINATION_START_OFFSET, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= PAGINATION_SIDE_ITEMS) {
        start = PAGINATION_START_OFFSET;
        end = PAGINATION_WINDOW_SIZE + 1;
      }

      if (currentPage >= totalPages - 3) {
        start = totalPages - PAGINATION_SIDE_ITEMS - 1;
        end = totalPages - 1;
      }

      if (!hideEllipsis && start > PAGINATION_START_OFFSET) {
        items.push("ellipsis");
      }

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (!hideEllipsis && end < totalPages - 1) {
        items.push("ellipsis");
      }

      items.push(totalPages);
    }

    return items;
  };

  if (loading) {
    return (
      <div className="space-y-[0.65rem]">
        <div className={`rounded-[0.24375rem] border overflow-x-auto ${className}`}>
          <table
            className="data-table"
            style={{
              tableLayout: "fixed",
              minWidth: "100%",
              width: "auto",
            }}
          >
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-[0.65rem] py-[0.4875rem] text-left font-semibold text-[13px] text-muted-foreground border-b border-border ${
                      column.className || ""
                    }`}
                    style={{
                      ...(column.width && { width: column.width }),
                      ...(column.maxWidth && { maxWidth: column.maxWidth }),
                      ...(column.minWidth && { minWidth: column.minWidth }),
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-[0.65rem] py-[0.4875rem] border-b border-border/50 text-[8px]"
                      style={{
                        ...(column.width && { width: column.width }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        ...(column.minWidth && { minWidth: column.minWidth }),
                      }}
                    >
                      <div className="h-[0.65rem] bg-muted animate-pulse rounded-[0.1625rem]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[0.65rem]">
      {/* Data Table */}
      <div className={`rounded-[0.24375rem] border overflow-x-auto ${className}`}>
        <table
          className="data-table"
          style={{
            tableLayout: "fixed",
            minWidth: "100%",
            width: "auto",
          }}
        >
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-[0.65rem] py-[0.4875rem] text-left font-semibold text-[13px] text-muted-foreground border-b border-border ${
                    column.className || ""
                  }`}
                  style={{
                    ...(column.width && { width: column.width }),
                    ...(column.maxWidth && { maxWidth: column.maxWidth }),
                    ...(column.minWidth && { minWidth: column.minWidth }),
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-[0.65rem] py-[1.3rem] text-center text-muted-foreground border-b border-border/50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  className={`transition-all duration-200 hover:bg-primary/5 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => {
                    const cellContent = column.render
                      ? column.render(item, index)
                      : String(item[column.key as keyof T] || "---");

                    return (
                      <td
                        key={column.key}
                        className={`px-[0.65rem] py-[0.4875rem] border-b border-border/50 text-[8px] ${
                          column.className || ""
                        }`}
                        style={{
                          ...(column.width && { width: column.width }),
                          ...(column.maxWidth && { maxWidth: column.maxWidth }),
                          ...(column.minWidth && { minWidth: column.minWidth }),
                        }}
                      >
                        <div
                          className={`whitespace-nowrap ${
                            column.truncate
                              ? "overflow-hidden text-ellipsis"
                              : ""
                          }`}
                          title={
                            column.truncate && typeof cellContent === "string"
                              ? cellContent
                              : undefined
                          }
                        >
                          {cellContent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between gap-[0.65rem] p-[0.65rem] flex-wrap">
          {/* Page Size Selector */}
          {showPageSizeSelector && totalPages > 1 ? (
            <PageSizeSelectField
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={onPageSizeChange}
            />
          ) : (
            <div />
          )}

          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-[0.325rem]">
              {/* Previous Button */}
              <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                ${classes.button}
                flex items-center gap-[0.325rem] rounded-[0.325rem] border font-medium transition-all duration-200
                ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                    : "text-foreground border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                }
              `}
              >
                <ChevronLeft className={classes.icon} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-[0.1625rem]">
                {getPaginationItems().map((item, index) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-[0.325rem] text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      onClick={() => onPageChange(item)}
                      className={`
                      ${classes.pageButton}
                      rounded-[0.325rem] font-medium px-[0.325rem] transition-all duration-200
                      ${
                        currentPage === item
                          ? "bg-primary text-primary-foreground border-2 border-primary shadow-md font-bold"
                          : "text-foreground border border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                      }
                    `}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className={`
                ${classes.button}
                flex items-center gap-[0.325rem] rounded-[0.325rem] border font-medium transition-all duration-200
                ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed text-muted-foreground border-border"
                    : "text-foreground border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                }
              `}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className={classes.icon} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
