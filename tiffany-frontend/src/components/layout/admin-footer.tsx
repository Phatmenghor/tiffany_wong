/**
 * Admin Dashboard Footer Component
 * Simple footer with version information for admin pages
 */

"use client";

export function AdminFooter() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>Dashboard v1.0.0</span>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </footer>
  );
}
