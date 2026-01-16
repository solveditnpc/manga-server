"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface SafeImageProps extends ImageProps {
  fallbackMsg?: string;
}

export default function SafeImage({
  fallbackMsg = "Image not available",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-xs fg-muted text-center px-2">
        {fallbackMsg}
      </div>
    );
  }

  return <Image {...props} onError={() => setError(true)} />;
}
