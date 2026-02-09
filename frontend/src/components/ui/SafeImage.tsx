"use client";
import { useState } from "react";
/*
 Next Image Variant :

import Image, { ImageProps } from "next/image";

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
*/

export interface SafeImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackMsg?: string;
  fallbackSrc?: string;
}

export default function SafeImg({
  fallbackMsg = "Image not available",
  fallbackSrc,
  onError,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...props
}: SafeImgProps) {
  const [failed, setFailed] = useState(false);

  if (failed && !fallbackSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-xs fg-muted text-center px-2">
        {fallbackMsg}
      </div>
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      loading={loading}
      decoding={decoding}
      src={failed && fallbackSrc ? fallbackSrc : props.src}
      onError={(e) => {
        if (!failed) setFailed(true);
        onError?.(e);
      }}
    />
  );
}
