"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

function isReaderKey(e: KeyboardEvent): boolean {
  const key = e.key;
  return (
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "PageUp" ||
    key === "PageDown" ||
    key === "Home" ||
    key === "End" ||
    key === "Escape" ||
    key === "+" ||
    key === "-" ||
    key === "=" ||
    key.toLowerCase() === "m" ||
    key.toLowerCase() === "g"
  );
}

export default function OverlaysVisibilityControl({
  readerContainer,
  children,
}: {
  readerContainer: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<any>(null);

  const showOverlays = useCallback(() => {
    setVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReaderKey(e)) {
        e.preventDefault();
        showOverlays();
      }
    };

    const container = readerContainer.current;
    if (!container) return;
    window.addEventListener("keydown", handleKeyDown);
    container.addEventListener("touchstart", showOverlays);
    container.addEventListener("mousemove", showOverlays);
    container.addEventListener("touchmove", showOverlays);
    container.addEventListener("scroll", showOverlays, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("mousemove", showOverlays);
      container.removeEventListener("touchstart", showOverlays);
      container.removeEventListener("touchmove", showOverlays);
      container.removeEventListener("scroll", showOverlays);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [readerContainer, showOverlays]);

  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child as React.ReactElement<any>, {
      visible,
    });
  });
}
