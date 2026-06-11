"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSizeSelectField } from "@/components/shared/form-field/page-size-select-field";
import { cn } from "@/lib/utils";

// Constants
const PAGINATION_ITEMS_THRESHOLD = 7;
const PAGINATION_START_OFFSET = 2;
const PAGINATION_WINDOW_SIZE = 4;
const PAGINATION_SIDE_ITEMS = 3;

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  paginationSize?: "sm" | "md" | "lg";
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  hideEllipsis?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 20, 50, 100],
  paginationSize = "md",
  showPagination = true,
  showPageSizeSelector = true,
  hideEllipsis = false,
}: TablePaginationProps) {
  const sizeClasses = {
    sm: {
      button: "h-8 px-3 text-xs",
      icon: "h-3 w-3",
      pageButton: "h-8 min-w-8 text-xs",
    },
    md: {
      button: "h-9 px-4 text-sm",
      icon: "h-4 w-4",
      pageButton: "h-9 min-w-9 text-sm",
    },
    lg: {
      button: "h-10 px-5 text-base",
      icon: "h-5 w-5",
      pageButton: "h-10 min-w-10 text-base",
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

  if (!showPagination) return null;

  const items = getPaginationItems();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalElements)} of{" "}
        {totalElements} results
      </div>

      <div className="flex items-center gap-2">
        {showPageSizeSelector && (
          <PageSizeSelectField
            value={pageSize}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
            size={paginationSize}
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={classes.button}
        >
          <ChevronLeft className={classes.icon} />
        </Button>

        {items.map((item, index) => (
          <div key={index}>
            {item === "ellipsis" ? (
              <div className="px-2 py-1 text-muted-foreground">...</div>
            ) : (
              <Button
                variant={item === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(item as number)}
                className={cn(classes.pageButton, "font-medium")}
              >
                {item}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={classes.button}
        >
          <ChevronRight className={classes.icon} />
        </Button>
      </div>
    </div>
  );
}
