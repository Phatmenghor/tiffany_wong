// src/app/not-found.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-[0.65rem]">
      <div className="text-center space-y-[0.975rem] max-w-md">
        {/* 404 Graphic */}
        <div className="space-y-[0.65rem]">
          <div className="text-[3.9rem] font-bold text-primary/20">404</div>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Error Message */}
        <div className="space-y-[0.4875rem]">
          <h1 className="text-[1.21875rem] font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-[0.4875rem] pt-[0.975rem]">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-[0.325rem]"
          >
            <ArrowLeft className="h-[0.65rem] w-[0.65rem]" />
            Go Back
          </Button>
          <Button asChild>
            <Link
              href="/dashboard/admin/platform-users"
              className="flex items-center gap-[0.325rem]"
            >
              <Home className="h-[0.65rem] w-[0.65rem]" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-[1.3rem] border-t border-border/50">
          <p className="text-[11px] text-muted-foreground">
            Need help?{" "}
            <a
              href="mailto:support@menuscanner.com"
              className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
