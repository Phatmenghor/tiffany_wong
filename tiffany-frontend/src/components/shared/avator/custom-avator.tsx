"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageWithFallback } from "@/constants/image-defaults";

interface CustomerAvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  variant?: "avatar" | "banner";
  bannerHeight?: "sm" | "md" | "lg" | "xl";
}

export const CustomAvatar: React.FC<CustomerAvatarProps> = ({
  imageUrl,
  name,
  size = "md",
  className = "",
  variant = "avatar",
  bannerHeight = "md",
}) => {
  // Avatar sizes (square)
  const avatarSizes = {
    sm: { avatar: "h-[1.3rem] w-[1.3rem]", indicator: "w-[0.325rem] h-[0.325rem]" },
    md: { avatar: "h-[1.625rem] w-[1.625rem]", indicator: "w-[0.4875rem] h-[0.4875rem]" },
    lg: { avatar: "h-[1.95rem] w-[1.95rem]", indicator: "w-[0.56875rem] h-[0.56875rem]" },
    xl: { avatar: "h-[2.6rem] w-[2.6rem]", indicator: "w-[0.65rem] h-[0.65rem]" },
    xxl: { avatar: "h-[3.25rem] w-[3.25rem]", indicator: "w-[0.8125rem] h-[0.8125rem]" },
  };

  // Banner sizes (rectangular - good for table display)
  const bannerSizes = {
    sm: "h-[1.3rem]",
    md: "h-[1.95rem]",
    lg: "h-[2.6rem]",
    xl: "h-[3.25rem]",
  };

  const fallbackText = name?.charAt(0)?.toUpperCase() || "B";

  // Render banner variant
  if (variant === "banner") {
    const bannerImageUrl = getImageWithFallback(imageUrl, "banner");
    return (
      <div className="inline-block w-full">
        <div
          className={`${
            bannerSizes[bannerHeight]
          } w-full max-w-xs rounded-lg overflow-hidden border-2 border-border bg-muted transition-all ${className}`}
        >
          <img
            src={bannerImageUrl}
            alt={name || "Banner"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageWithFallback(undefined, "banner");
            }}
          />
        </div>
      </div>
    );
  }

  // Render avatar variant
  const avatarImageUrl = getImageWithFallback(imageUrl, "profile");
  return (
    <div className="inline-block">
      <Avatar
        className={`${
          avatarSizes[size].avatar
        } border-2 border-background shadow-sm transition-all ${className}`}
      >
        <AvatarImage src={avatarImageUrl} alt={name || "User"} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
