/**
 * Admin Dashboard Loading State
 * Shows while admin pages are loading
 */

import { TableSkeleton, TextLineSkeleton } from "@/components/shared/loading";

export default function AdminLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      {/* Header Loading */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Table/Content Loading */}
      <div className="bg-card rounded-lg border border-border p-6">
        <TableSkeleton rows={10} cols={5} />
      </div>
    </div>
  );
}
