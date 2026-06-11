"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

interface LocationEmptyStateProps {
  onAddNew: () => void;
}

export function LocationEmptyState({ onAddNew }: LocationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[3.25rem]">
      <div className="relative mb-[0.975rem]">
        <div className="w-[3.9rem] h-[3.9rem] rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="h-[1.95rem] w-[1.95rem] text-primary/60" />
        </div>
        <div className="absolute -bottom-[0.1625rem] -right-[0.1625rem] w-[1.3rem] h-[1.3rem] rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
          <Plus className="h-[0.65rem] w-[0.65rem] text-primary" />
        </div>
      </div>
      <h3 className="text-[0.8125rem] font-semibold text-foreground mb-[0.325rem]">
        No saved locations
      </h3>
      <p className="text-[0.56875rem] text-muted-foreground text-center max-w-sm mb-[1.3rem] leading-relaxed">
        Save your favourite delivery spots — use the interactive map or select
        from our location hierarchy.
      </p>
      <Button onClick={onAddNew} size="lg" className="shadow-md">
        <Plus className="h-[0.65rem] w-[0.65rem] mr-[0.325rem]" />
        Add Your First Location
      </Button>
    </div>
  );
}
