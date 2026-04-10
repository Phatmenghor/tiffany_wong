"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Edit2,
  Trash2,
  Star,
  Crown,
} from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import {
  getLabelIcon,
  isLocationPrimary,
} from "../utils/location-helpers";

interface LocationCardProps {
  location: LocationResponseModel;
  settingPrimaryId: string | null;
  onEdit: (location: LocationResponseModel) => void;
  onDelete: (location: LocationResponseModel) => void;
  onSetPrimary: (location: LocationResponseModel) => void;
}

// Label → theme colours
const LABEL_THEME: Record<string, { bg: string; text: string; accent: string; iconBg: string }> = {
  home:      { bg: "bg-blue-50",      text: "text-blue-600",    accent: "bg-blue-500",    iconBg: "bg-blue-100"    },
  house:     { bg: "bg-blue-50",      text: "text-blue-600",    accent: "bg-blue-500",    iconBg: "bg-blue-100"    },
  office:    { bg: "bg-violet-50",  text: "text-violet-600",accent: "bg-violet-500",  iconBg: "bg-violet-100"},
  work:      { bg: "bg-violet-50",  text: "text-violet-600",accent: "bg-violet-500",  iconBg: "bg-violet-100"},
  shop:      { bg: "bg-orange-50",  text: "text-orange-600",accent: "bg-orange-500",  iconBg: "bg-orange-100"},
  store:     { bg: "bg-orange-50",  text: "text-orange-600",accent: "bg-orange-500",  iconBg: "bg-orange-100"},
  building:  { bg: "bg-slate-50",    text: "text-slate-600",  accent: "bg-slate-500",   iconBg: "bg-slate-100" },
  apartment: { bg: "bg-slate-50",    text: "text-slate-600",  accent: "bg-slate-500",   iconBg: "bg-slate-100" },
  family:    { bg: "bg-rose-50",      text: "text-rose-600",    accent: "bg-rose-500",    iconBg: "bg-rose-100"   },
  love:      { bg: "bg-rose-50",      text: "text-rose-600",    accent: "bg-rose-500",    iconBg: "bg-rose-100"   },
};

function getLabelTheme(label?: string | null) {
  if (!label) return null;
  const lower = label.toLowerCase();
  for (const [key, t] of Object.entries(LABEL_THEME)) {
    if (lower.includes(key)) return t;
  }
  return null;
}

export function LocationCard({
  location,
  settingPrimaryId,
  onEdit,
  onDelete,
  onSetPrimary,
}: LocationCardProps) {
  const LabelIcon = getLabelIcon(location.label);
  const isPrimary = isLocationPrimary(location);
  const isSettingPrimary = settingPrimaryId === location.id;
  const theme = getLabelTheme(location.label);
  const hasCoordinates = location.hasCoordinates && location.latitude && location.longitude;

  // Google Maps URL
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/${location.latitude},${location.longitude}`
    : null;

  const handleViewMap = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank");
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-background overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
        isPrimary
          ? "border-amber-300/70"
          : "border-border"
      )}
    >
      {/* Left accent strip */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
          isPrimary
            ? "bg-gradient-to-b from-amber-400 to-amber-500"
            : theme
            ? theme.accent
            : "bg-primary/40"
        )}
      />

      <div className="pl-4 pr-3 py-4">
        {/* Main row: icon + label + isDefault + actions */}
        <div className="flex items-start gap-3">
          {/* Icon bubble */}
          <div
            className={cn(
              "p-2 rounded-lg shrink-0 mt-0.5",
              isPrimary
                ? "bg-amber-100 text-amber-600"
                : theme
                ? `${theme.iconBg} ${theme.text}`
                : "bg-primary/10 text-primary"
            )}
          >
            <LabelIcon className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Label row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isPrimary
                    ? "text-amber-700"
                    : "text-foreground"
                )}
              >
                {location.label || "Location"}
              </span>
              {isPrimary && (
                <Badge className="h-5 px-2 text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border-amber-200 shrink-0 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Default
                </Badge>
              )}
            </div>

            {/* Full Address - Clickable if has coordinates */}
            <button
              onClick={handleViewMap}
              disabled={!hasCoordinates}
              className={cn(
                "text-left w-full transition-colors",
                hasCoordinates && "hover:text-primary cursor-pointer",
                !hasCoordinates && "cursor-default"
              )}
              title={hasCoordinates ? "Click to view on Google Maps" : ""}
            >
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {location.fullAddress || "No address provided"}
              </p>
            </button>


          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {!isPrimary && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetPrimary(location)}
                disabled={isSettingPrimary}
                className="h-8 text-xs gap-1.5 rounded-lg"
              >
                <Star className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Default</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(location)}
              className="h-8 w-8 p-0 rounded-lg"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(location)}
              className="h-8 w-8 p-0 rounded-lg"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
