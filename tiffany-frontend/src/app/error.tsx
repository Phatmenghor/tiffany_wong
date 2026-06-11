// src/app/error.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Mail, Copy, CheckCircle2 } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  const handleCopyError = () => {
    navigator.clipboard.writeText(error.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center px-[0.65rem] py-[2.6rem]">
      <div className="w-full max-w-2xl space-y-[1.3rem]">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-[0.975rem]">
            <AlertTriangle className="h-[2.6rem] w-[2.6rem] text-destructive" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-[0.975rem] text-center">
          <h1 className="text-[1.4625rem] sm:text-[1.95rem] font-bold text-foreground">
            Oops! Something Went Wrong
          </h1>
          <p className="text-[0.73125rem] text-muted-foreground">
            We encountered an unexpected error while processing your request. Don't worry, our team has been notified and is investigating.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="space-y-[0.65rem] bg-card border border-border rounded-lg p-[0.975rem]">
            <div className="flex items-center justify-between mb-[0.65rem]">
              <h3 className="text-[0.56875rem] font-semibold text-foreground">Technical Details</h3>
              <button
                onClick={handleCopyError}
                className="p-[0.325rem] rounded-md hover:bg-muted transition-colors"
                title="Copy error message"
              >
                {copied ? (
                  <CheckCircle2 className="w-[0.8125rem] h-[0.8125rem] text-green-600" />
                ) : (
                  <Copy className="w-[0.8125rem] h-[0.8125rem] text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
            <div className="bg-muted rounded-[0.1625rem] p-[0.65rem] overflow-auto max-h-[7.8rem]">
              <pre className="text-[0.4875rem] sm:text-[0.56875rem] text-muted-foreground font-mono whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </div>
            {error.digest && (
              <div className="bg-muted rounded-[0.1625rem] p-[0.65rem]">
                <p className="text-[0.4875rem] text-muted-foreground mb-[0.325rem]">Error ID:</p>
                <p className="text-[0.56875rem] font-mono text-foreground">{error.digest}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-[0.65rem]">
          <Button
            onClick={reset}
            className="flex-1 gap-[0.325rem] h-[1.7875rem] rounded-lg font-semibold"
            size="lg"
          >
            <RefreshCw className="h-[0.8125rem] w-[0.8125rem]" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="flex-1 gap-[0.325rem] h-[1.7875rem] rounded-lg font-semibold"
            size="lg"
          >
            <Home className="h-[0.8125rem] w-[0.8125rem]" />
            Go Home
          </Button>
          <Button
            onClick={() => window.location.href = "mailto:support@tiffanyfurnitureskh.com?subject=Application Error"}
            variant="outline"
            className="flex-1 gap-[0.325rem] h-[1.7875rem] rounded-lg font-semibold"
            size="lg"
          >
            <Mail className="h-[0.8125rem] w-[0.8125rem]" />
            Contact Support
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-[0.56875rem] text-muted-foreground pt-[0.65rem] border-t border-border">
          <p>Tiffany Furniture Cambodia</p>
        </div>
      </div>
    </div>
  );
}
