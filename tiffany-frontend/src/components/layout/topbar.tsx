"use client";

import {
  LogOut,
  Menu,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useLogout } from "@/redux/store/use-logout";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { CustomDropdownMenu } from "@/components/shared/common/custom-dropdown-menu";

interface TopBarProps {
  onMenuClick?: () => void;
  onFullscreenClick?: () => void;
}

// Convert pathname to breadcrumb segments
function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const part of parts) {
    path += `/${part}`;
    const label = part
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: path });
  }
  return crumbs;
}

export function TopBar({ onMenuClick, onFullscreenClick }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const { profile, fullName, profileImage } = useAuthState();
  const { logout: handleLogout } = useLogout();

  const breadcrumbs = getBreadcrumbs(pathname);

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    await handleLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[2.6rem] items-center gap-[0.65rem] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-[0.8125rem] shadow-md">
        {/* Left: menu toggle + breadcrumbs */}
        <div className="flex items-center gap-[0.4875rem] min-w-0 flex-1">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-[1.4625rem] w-[1.4625rem] rounded-[0.325rem] hover:bg-primary/10 hover:text-primary transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-[0.8125rem] w-[0.8125rem]" />
          </Button>

          {/* Breadcrumb — hidden on small screens */}
          <nav className="hidden md:flex items-center gap-[0.325rem] text-[0.56875rem] min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-[0.1625rem] min-w-0">
                {i > 0 && (
                  <ChevronRight className="h-[0.4875rem] w-[0.4875rem] text-muted-foreground/50 shrink-0" />
                )}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "font-semibold text-foreground truncate"
                      : "text-muted-foreground truncate hover:text-foreground cursor-pointer transition-colors"
                  }
                  onClick={() =>
                    i < breadcrumbs.length - 1 && router.push(crumb.href)
                  }
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>

          {/* Page title mobile */}
          <span className="md:hidden font-semibold text-[0.56875rem] text-foreground truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard"}
          </span>
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-[0.325rem] shrink-0">
          {/* Profile Dropdown Menu */}
          {profile && (
            <CustomDropdownMenu
              trigger={
                <div className="h-[1.4625rem] w-[1.4625rem] flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                  <CustomAvatar
                    imageUrl={profileImage || profile?.profileImageUrl}
                    name={fullName || profile?.fullName || "Admin"}
                    size="sm"
                  />
                </div>
              }
              header={
                <div className="flex items-center gap-[0.4875rem]">
                  <CustomAvatar
                    imageUrl={profileImage || profile?.profileImageUrl}
                    name={fullName || profile?.fullName || "Admin"}
                    size="lg"
                  />
                  <div className="flex flex-col space-y-[0.08125rem] flex-1 min-w-0">
                    <p className="text-[0.56875rem] font-semibold line-clamp-1">
                      {fullName || profile?.fullName || "Admin"}
                    </p>
                    <p className="text-[0.4875rem] text-muted-foreground line-clamp-1">
                      {profile?.email || ""}
                    </p>
                  </div>
                </div>
              }
              sections={[
                {
                  items: [
                    {
                      label: "My Profile",
                      icon: <UserCircle className="h-[0.65rem] w-[0.65rem]" />,
                      onClick: () => router.push(ROUTES.ADMIN.PROFILE),
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: "Logout",
                      icon: <LogOut className="h-[0.65rem] w-[0.65rem]" />,
                      onClick: () => setShowLogoutAlert(true),
                      variant: "destructive" as const,
                    },
                  ],
                },
              ]}
              align="right"
              openOnHover={false}
              hoverDelay={200}
            />
          )}
        </div>
      </header>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="w-full sm:max-w-md rounded-[0.65rem]">
          <AlertDialogHeader>
            <div className="flex items-center gap-[0.4875rem]">
              <div className="flex h-[1.7875rem] w-[1.7875rem] items-center justify-center rounded-[0.65rem] bg-red-100">
                <LogOut className="h-[0.8125rem] w-[0.8125rem] text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-left text-[0.73125rem] font-bold">
                  Sign Out
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left text-[0.56875rem] text-muted-foreground mt-[0.325rem] leading-relaxed">
              Are you sure you want to sign out of your account? You'll need to
              sign in again to access your dashboard and saved data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-[0.325rem]">
            <AlertDialogCancel className="rounded-[0.4875rem] mt-0 w-full sm:w-auto">
              Stay Signed In
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-[0.4875rem] gap-[0.325rem]"
            >
              <LogOut className="h-[0.65rem] w-[0.65rem]" />
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
