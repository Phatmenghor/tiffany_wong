/**
 * Admin Dashboard Footer Component
 * Simple footer with version information for admin pages
 */

"use client";

export function AdminFooter() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-[0.65rem] py-[0.65rem]">
        <div className="flex items-center justify-center gap-[0.65rem] text-[11px] text-muted-foreground">
          <span>Dashboard v1.0.0</span>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </footer>
  );
}
