"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Button } from "@/components/ui";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    console.log(query);
  };

  // Close only if input is empty
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        query.trim() === ""
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  return (
    <>
      {/* ===== Desktop (md+) ===== */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex w-full max-w-md items-center gap-2"
      >
        <Input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manga…"
          className="bg-card"
        />
        <Button type="submit" aria-label="Search" className="h-full">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* ===== Mobile ===== */}
      <div className="relative md:hidden" ref={panelRef}>
        <Button
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle search"
          className="flex  h-full"
        >
          <Search className="h-4 w-4" />
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {open && (
          <div
            className="
              absolute -right-1/2
              mt-2 w-72
              bg-card
              border border-default
              rounded-md
              p-3
              z-50
            "
          >
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                autoFocus
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search manga…"
                className="bg-background"
              />
              <Button type="submit" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default SearchBar;
