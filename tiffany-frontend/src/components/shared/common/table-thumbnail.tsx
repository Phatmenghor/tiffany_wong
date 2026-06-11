"use client";

import { useState } from "react";

interface TableThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
}

function NoImageSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="currentColor" opacity="0.04" />
      <rect
        x="22"
        y="20"
        width="56"
        height="44"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.2"
      />
      <circle cx="37" cy="34" r="6.5" fill="currentColor" opacity="0.2" />
      <path
        d="M26 60 L41 40 L52 52 L63 37 L74 60 Z"
        fill="currentColor"
        opacity="0.2"
      />
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontSize="9"
        fill="currentColor"
        opacity="0.35"
        fontFamily="system-ui, sans-serif"
      >
        No Image
      </text>
    </svg>
  );
}

export function TableThumbnail({ src, alt, className = "" }: TableThumbnailProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={`overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground ${className}`}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <NoImageSvg />
      )}
    </div>
  );
}
