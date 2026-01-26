"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button, LinkButton } from "@/components/ui";

interface HorizontalScrollerProps {
  title: string;
  href?: string;
  children?: React.ReactNode;
}

export default function HorizontalScroller({
  title,
  href,
  children,
}: HorizontalScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [atStart, setAtStart] = useState<boolean>(true);
  const [atEnd, setAtEnd] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const updateState = () => {
    const section = containerRef.current;
    if (!section) return;

    const { scrollLeft, scrollWidth, clientWidth } = section;

    setAtStart(scrollLeft <= 0);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);

    const maxScroll = scrollWidth - clientWidth;
    setProgress(maxScroll > 0 ? Math.max(scrollLeft / maxScroll, 0.01) : 0); // min 1%
  };

  const scrollLeftFn = () =>
    containerRef.current?.scrollBy({ left: -300, behavior: "smooth" });

  const scrollRightFn = () =>
    containerRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  useEffect(() => {
    updateState();
  }, [children]);

  if (!children) return null;

  return (
    <section
      className="space-y-3"
      ref={sectionRef}
      onMouseEnter={() => sectionRef.current?.focus()}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && !atStart) {
          e.preventDefault();
          scrollLeftFn();
        } else if (e.key === "ArrowRight" && !atEnd) {
          e.preventDefault();
          scrollRightFn();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold fg-primary">{title}</h2>

        {href && (
          <LinkButton href={href} className="fg-muted" variant="ghost">
            Explore more <ArrowRight size={14} />
          </LinkButton>
        )}
      </div>

      {/* Scroller */}
      <div className="relative">
        {/* LEFT OVERLAY */}
        <div
          className="
            absolute left-0 top-0 h-full w-fit
            z-10
            flex items-center justify-center
            bg-linear-to-r from-background to-transparent
          "
          onClick={!atStart ? scrollLeftFn : undefined}
        >
          <Button
            variant="secondary"
            disabled={atStart}
            aria-label="Scroll left"
            className="h-15 opacity-80"
          >
            <ChevronLeft size={18} />
          </Button>
        </div>

        {/* RIGHT OVERLAY */}
        <div
          className="
            absolute right-0 top-0 h-full w-fit
            z-10
            flex items-center justify-center
            bg-linear-to-l from-background to-transparent
          "
          onClick={!atEnd ? scrollRightFn : undefined}
        >
          <Button
            variant="secondary"
            disabled={atEnd}
            aria-label="Scroll right"
            className="h-15 opacity-80"
          >
            <ChevronRight size={18} />
          </Button>
        </div>

        {/* LIST */}
        <div
          ref={containerRef}
          onScroll={updateState}
          tabIndex={-1}
          className="
            flex gap-4
            overflow-x-auto
            pb-2
            scroll-smooth
            no-scrollbar
            focus-ring
          "
        >
          {children}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="h-1 w-full bg-border rounded overflow-hidden">
        <div
          className="h-1 rounded-full bg-accent transition-all opacity-50"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </section>
  );
}
