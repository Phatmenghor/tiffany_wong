"use client";

import { ReactNode } from "react";

interface DisplayFieldProps {
  label: string;
  value: string | ReactNode | undefined;
}

export function DisplayField({ label, value }: DisplayFieldProps) {
  return (
    <div className="space-y-[0.1625rem]">
      <div className="text-[12px] font-medium text-foreground">{label}</div>
      <div className="text-[12px] text-foreground">
        {typeof value === "string" ? value || "-" : value || "-"}
      </div>
    </div>
  );
}
