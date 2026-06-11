import { Loader2 } from "lucide-react";

export const Loading = () => (
  <div className="flex items-center justify-center py-[1.95rem]">
    <Loader2 className="h-[1.3rem] w-[1.3rem] animate-spin text-primary" />
  </div>
);

export const LoadingPagination = () => (
  <div className="flex items-center justify-center py-[1.3rem]">
    <Loader2 className="h-[1.3rem] w-[1.3rem] animate-spin text-primary" />
  </div>
);
