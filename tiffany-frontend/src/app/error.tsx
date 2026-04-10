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
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-muted-foreground">
            We encountered an unexpected error while processing your request. Don't worry, our team has been notified and is investigating.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="space-y-4 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Technical Details</h3>
              <button
                onClick={handleCopyError}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Copy error message"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
            <div className="bg-muted rounded p-4 overflow-auto max-h-48">
              <pre className="text-xs sm:text-sm text-muted-foreground font-mono whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </div>
            {error.digest && (
              <div className="bg-muted rounded p-4">
                <p className="text-xs text-muted-foreground mb-2">Error ID:</p>
                <p className="text-sm font-mono text-foreground">{error.digest}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={reset}
            className="flex-1 gap-2 h-11 rounded-lg font-semibold"
            size="lg"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="flex-1 gap-2 h-11 rounded-lg font-semibold"
            size="lg"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Button>
          <Button
            onClick={() => window.location.href = "mailto:support@tiffanyfurnitureskh.com?subject=Application Error"}
            variant="outline"
            className="flex-1 gap-2 h-11 rounded-lg font-semibold"
            size="lg"
          >
            <Mail className="h-5 w-5" />
            Contact Support
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          <p>Tiffany Furniture Cambodia</p>
        </div>
      </div>
    </div>
  );
}
