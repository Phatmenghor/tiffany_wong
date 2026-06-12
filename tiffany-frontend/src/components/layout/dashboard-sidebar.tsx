"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES, SIDEBAR_MENU } from "@/constants/app-routes/routes";
import Image from "next/image";
import { UserAvatarCard } from "../shared/avator/user-avatar-card";
import { useIsMobile } from "@/redux/store/use-mobile";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { profile } = useAuthState();

  const businessName = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Master Data": true,
    HR: true,
    Business: true,
    Users: true,
    Settings: true,
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
    onToggle();
    if (!collapsed) {
      setOpenSections({});
    }
  };

  const renderNavItems = (isCollapsed = false) => (
    <nav className="flex flex-col gap-[0.1625rem]">
      {SIDEBAR_MENU.map((route) => {
        const hasSubItems = route.items && route.items.length > 0;
        const isActive = route.href ? pathname === route.href : false;

        if (hasSubItems) {
          const isOpen = route.title ? openSections[route.title] : false;

          return (
            <div key={route.title} className="w-full">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary rounded-[0.1625rem] relative transition-all duration-200 text-[11px] overflow-hidden"
                onClick={() =>
                  route.title && !isCollapsed && toggleSection(route.title)
                }
                aria-expanded={isOpen}
                title={isCollapsed ? route.title : undefined}
              >
                <div className="flex w-full items-center min-w-0">
                  {route.icon && (
                    <route.icon className="w-[0.8125rem] h-[0.8125rem] flex-shrink-0 transition-colors duration-200" />
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-[0.4875rem] truncate transition-colors duration-200 min-w-0">
                        {route.title}
                      </span>
                      <div className="ml-auto">
                        {isOpen ? (
                          <ChevronDown className="h-[0.65rem] w-[0.65rem] transition-colors duration-200" />
                        ) : (
                          <ChevronRight className="h-[0.65rem] w-[0.65rem] transition-colors duration-200" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Button>

              {!isCollapsed && isOpen && (
                <div className="relative ml-[0.975rem] mt-[0.1625rem] space-y-[0.1625rem]">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 z-0"></div>

                  {route.items!.map((subItem) => {
                    const isSubItemActive = pathname === subItem.href;

                    return (
                      <div key={subItem.title} className="relative">
                        <div
                          className={cn(
                            "absolute left-0 top-1/2 w-[0.65rem] h-px z-0 transition-colors duration-200",
                            isSubItemActive ? "bg-primary/40" : "bg-gray-300",
                          )}
                        ></div>

                        <div
                          className={cn(
                            "absolute left-0 top-1/2 w-[0.24375rem] h-[0.24375rem] rounded-full transform -translate-x-[0.08125rem] -translate-y-[0.08125rem] z-10 transition-colors duration-200",
                            isSubItemActive ? "bg-primary" : "bg-gray-400",
                          )}
                        ></div>

                        <div className="absolute left-[0.65rem] top-1/2 w-[0.325rem] h-px z-0 transition-colors duration-200 bg-gray-200"></div>

                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "relative w-full justify-start hover:bg-primary/10 hover:text-primary pl-[0.975rem] rounded-[0.1625rem] z-20 border-l border-transparent hover:border-l-primary/30 transition-all duration-200 text-[11px] overflow-hidden",
                            isSubItemActive &&
                              "bg-primary/20 text-primary font-medium border-l-2 border-primary shadow-sm",
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className="flex items-center gap-[0.325rem] min-w-0 overflow-hidden"
                          >
                            <span className="truncate min-w-0">{subItem.title}</span>
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Button
            key={route.title}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start hover:bg-primary/10 hover:text-primary rounded-[0.1625rem] transition-all duration-200 text-[11px] overflow-hidden",
              isActive &&
                "bg-primary/20 text-primary font-medium border-l-2 border-primary",
            )}
          >
            <Link
              href={route.href || "#"}
              className="flex items-center gap-[0.4875rem] px-[0.4875rem] py-[0.325rem] min-w-0 overflow-hidden"
              title={collapsed ? route.title : undefined}
            >
              {route.icon && <route.icon className="w-[0.8125rem] h-[0.8125rem] flex-shrink-0" />}
              {!collapsed && <span className="truncate min-w-0">{route.title}</span>}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out shadow-xl",
          collapsed ? "w-[2.6rem]" : "w-[9.75rem]",
          isMobile && !isOpen && "hidden",
        )}
      >
        <div className="relative flex h-[3.25rem] items-center justify-between border-b border-border/50 px-[0.65rem] bg-gradient-to-br from-primary/5 via-background/50 to-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 opacity-50 blur-3xl"></div>

          {!collapsed && (
            <Link
              href="/"
              className="relative flex items-center gap-[0.4875rem] group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative">
                <div className="w-[1.625rem] h-[1.625rem] overflow-hidden">
                  <Image
                    src="/assets/image/logo.png"
                    alt={businessName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-[11px] leading-tight tracking-tight truncate">
                  {businessName}
                </span>
                <span className="text-muted-foreground text-[10px] font-medium tracking-wide truncate">
                  Dashboard
                </span>
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn(
              "relative h-[1.4625rem] w-[1.4625rem] rounded-[0.4875rem] transition-all duration-300 hover:bg-primary/10 hover:scale-110 group",
              collapsed && "ml-auto",
            )}
          >
            <div className="absolute inset-0 rounded-[0.4875rem] bg-gradient-to-r from-primary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronLeft
              className={cn(
                "h-[0.65rem] w-[0.65rem] relative z-10 transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-[0.975rem]">
          <div className="px-[0.65rem] space-y-[0.325rem]">{renderNavItems(collapsed)}</div>
        </ScrollArea>

        {profile && (
          <UserAvatarCard
            user={profile}
            collapsed={collapsed}
            isOnline={true}
            isLoading={isProfileLoading}
            profileLink={ROUTES.ADMIN.PROFILE}
            showEmail={true}
            showOnlineIndicator={true}
            enableImagePreview={true}
            avatarSize="md"
          />
        )}
      </div>
    </>
  );
}
