"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-[2.275rem] sm:bottom-[2.275rem] right-[0.975rem] z-50 h-[1.95rem] w-[1.95rem] rounded-full shadow-lg transition-all duration-300",
        // On mobile, float above the bottom nav (3.5rem) + safe area + 30px gap
        "[bottom:calc(3.5rem+env(safe-area-inset-bottom,0px)+1.875rem)] sm:[bottom:2.275rem]",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[2.6rem] opacity-0 pointer-events-none",
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-[0.8125rem] w-[0.8125rem]" />
    </Button>
  );
}
