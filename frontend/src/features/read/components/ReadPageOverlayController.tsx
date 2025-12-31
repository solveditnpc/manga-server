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

export default function ReadPageOverlayController({
  readerContainer,
  children,
}: {
  readerContainer: React.RefObject<HTMLDivElement | null>;
  children: React.ReactElement<{ visible: boolean }>[];
}) {
  const [showUI, setShowUI] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  const showUIWithTimeout = useCallback(() => {
    setShowUI(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = window.setTimeout(() => {
      setShowUI(false);
      hideTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReaderKey(e)) showUIWithTimeout();
    };

    const container = readerContainer.current;

    window.addEventListener("mousemove", showUIWithTimeout);
    window.addEventListener("touchstart", showUIWithTimeout);
    window.addEventListener("touchmove", showUIWithTimeout);
    window.addEventListener("keydown", handleKeyDown);
    container?.addEventListener("scroll", showUIWithTimeout, { passive: true });

    return () => {
      window.removeEventListener("mousemove", showUIWithTimeout);
      window.removeEventListener("touchstart", showUIWithTimeout);
      window.removeEventListener("touchmove", showUIWithTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      container?.removeEventListener("scroll", showUIWithTimeout);

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [readerContainer, showUIWithTimeout]);

  return React.Children.map(children, (child, i) => {
    if (!React.isValidElement(child)) return null;

    return React.cloneElement(child, {
      visible: showUI,
    });
    
  });
}
