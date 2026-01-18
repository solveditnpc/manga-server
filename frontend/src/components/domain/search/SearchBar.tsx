"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import UrlSearch from "@/components/query/UrlSearch";
import { Dropdown } from "@/components/ui";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const handleOpenChange = (e: boolean) => {
    if (e) setOpen(e);
    else if (!isDirty) setOpen(e);
  };
  return (
    <>
      {/* ===== Desktop (md+) ===== */}
      <div className="hidden sm:flex w-full max-w-md items-center gap-2">
        <UrlSearch onInputDirty={setIsDirty} targetRoute="/search" />
      </div>

      {/* ===== Mobile ===== */}
      <div className="relative sm:hidden">
        <Dropdown
          open={open}
          onOpenChange={handleOpenChange}
          trigger={
            <div className="flex gap-2 p-1.5 border-default border rounded-md bg-card hover-card">
              <Search className="h-4 w-4" />
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          }
        >
          <div className="w-72">
            <UrlSearch onInputDirty={setIsDirty} targetRoute="/search" />
          </div>
        </Dropdown>
      </div>
    </>
  );
}

export default SearchBar;
