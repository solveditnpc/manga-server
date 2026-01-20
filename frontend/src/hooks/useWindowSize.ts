"use client";
import { useEffect, useState } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      setWidth(window.innerWidth);
    }

    update(); // initial
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}
