import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useRef } from "react";
import Link from "next/link";
import { getImageWithFallback } from "@/constants/image-defaults";

interface UserAvatarCardProps {
  user: {
    profileImageUrl?: string | null;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    email?: string | null;
  };
  collapsed?: boolean;
  isOnline?: boolean;
  isLoading?: boolean;
  profileLink?: string;
  showEmail?: boolean;
  showOnlineIndicator?: boolean;
  enableImagePreview?: boolean;
  className?: string;
  avatarSize?: "sm" | "md" | "lg" | "xl";
}

export const UserAvatarCard: React.FC<UserAvatarCardProps> = ({
  user,
  collapsed = false,
  isOnline = true,
  isLoading = false,
  profileLink,
  showEmail = true,
  showOnlineIndicator = true,
  enableImagePreview = true,
  className = "",
  avatarSize = "md",
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const justOpenedRef = useRef(false);

    const sizeClasses = {
      sm: { avatar: "h-[1.3rem] w-[1.3rem]", indicator: "w-[0.325rem] h-[0.325rem]" },
      md: { avatar: "h-[1.625rem] w-[1.625rem]", indicator: "w-[0.4875rem] h-[0.4875rem]" },
      lg: { avatar: "h-[1.95rem] w-[1.95rem]", indicator: "w-[0.56875rem] h-[0.56875rem]" },
      xl: { avatar: "h-[2.6rem] w-[2.6rem]", indicator: "w-[0.65rem] h-[0.65rem]" },
    };

  const size = collapsed ? "sm" : avatarSize;
  const sizes = sizeClasses[size];

  // Get user display name
  const displayName =
    user.displayName ||
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "GUEST USER";

  // Get fallback letter
  const fallbackLetter =
    user.fullName?.charAt(0) || user.firstName?.charAt(0) || "U";

  // Image preview handlers - smooth like CustomAvatar
  const handleMouseEnter = () => {
    if (!enableImagePreview || !user.profileImageUrl) return;

    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // Set 600ms delay before opening
    openTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      setImageLoading(true); // Reset loading state when opening
      justOpenedRef.current = true;

      // Reset the justOpened flag after 500ms to allow closing
      setTimeout(() => {
        justOpenedRef.current = false;
      }, 500);
    }, 600);
  };

  const handleMouseLeave = () => {
    // Don't close if modal just opened
    if (justOpenedRef.current) return;

    // Clear the open timeout if user leaves before 600ms
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    // Delay before closing to allow moving mouse to preview
    closeTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 4000);
  };

  const handlePreviewMouseEnter = () => {
    // Clear close timeout when hovering preview
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  // Avatar component with Dialog trigger
  const AvatarComponent = (
    <div className="relative">
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Avatar
              className={`${sizes.avatar} ${
                enableImagePreview && user.profileImageUrl
                  ? "cursor-pointer hover:scale-110 transition-transform"
                  : ""
              }`}
            >
              <AvatarImage src={getImageWithFallback(user.profileImageUrl, "profile")} alt={displayName} />
              <AvatarFallback
                className={`${sizes.avatar} rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-[0.56875rem] font-bold shadow-sm`}
              >
                {fallbackLetter}
              </AvatarFallback>
            </Avatar>
          </div>
        </DialogTrigger>

        {enableImagePreview && user.profileImageUrl && (
          <DialogContent
            className="max-w-fit border-none bg-transparent shadow-none p-0"
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <DialogTitle className="sr-only">{displayName || "Image Preview"}</DialogTitle>
            <div className="relative bg-white p-[0.975rem] rounded-[0.65rem] shadow-2xl border border-border">
              <div className="flex flex-col items-center gap-[0.65rem]">
                {/* Loading spinner */}
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[0.65rem] z-10">
                    <div className="flex flex-col items-center gap-[0.4875rem]">
                      <div className="w-[1.95rem] h-[1.95rem] border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-[0.56875rem] text-muted-foreground">
                        Loading image...
                      </p>
                    </div>
                  </div>
                )}

                <img
                  src={getImageWithFallback(user.profileImageUrl, "profile")}
                  alt={displayName}
                  className="max-w-[70vw] max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  style={{
                    opacity: imageLoading ? 0 : 1,
                    transition: "opacity 0.3s",
                  }}
                />
                <p className="text-[0.73125rem] font-semibold text-center text-gray-900">
                  {displayName}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Online/Offline indicator */}
      {showOnlineIndicator && (
        <div
          className={`absolute -bottom-[0.08125rem] -right-[0.08125rem] ${
            sizes.indicator
          } rounded-full ${
            isOnline ? "bg-green-500 shadow-green-500/50" : "bg-gray-400"
          } shadow-sm ${collapsed ? "border" : "border-2"} border-background`}
        ></div>
      )}
    </div>
  );

  // Collapsed view
  if (collapsed) {
    return (
      <div className={`border-t border-border/50 p-[0.325rem] ${className}`}>
        <div className="flex justify-center">{AvatarComponent}</div>
      </div>
    );
  }

  // Expanded view
  const CardContent = (
    <div
      className={`flex items-center gap-[0.4875rem] p-[0.4875rem] rounded-[0.4875rem] bg-primary/10 hover:bg-primary/20 transition-colors duration-300 ${
        profileLink ? "cursor-pointer" : ""
      } group ${className}`}
    >
      {AvatarComponent}

      <div className="flex-1 min-w-0">
        <p className="text-[0.56875rem] font-semibold text-foreground truncate">
          {displayName}
        </p>
        {showEmail && (
          <p className="text-[0.4875rem] text-muted-foreground truncate">
            {user.email || "user@example.com"}
          </p>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-[0.325rem] h-[0.325rem] rounded-full bg-yellow-500 animate-pulse shadow-sm shadow-yellow-500/50"></div>
      )}
    </div>
  );

  return (
    <div className={`border-t border-border/50 p-[0.65rem] ${className}`}>
      {profileLink ? (
        <Link href={profileLink}>{CardContent}</Link>
      ) : (
        CardContent
      )}
    </div>
  );
};
