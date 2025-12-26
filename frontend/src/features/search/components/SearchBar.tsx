"use client";
import React from "react";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";

function SearchBar() {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e.currentTarget.q.value);
  };
  return (
    <form
      className="hidden sm:flex w-full max-w-md items-center gap-2"
      onSubmit={handleSearch}
    >
      <Input
        type="search"
        name="q"
        placeholder="Search manga…"
        className="bg-card"
      />
      <Button type="submit" className="h-full" aria-label="Search">
        <Search className="h-4" />
      </Button>
    </form>
  );
}

export default SearchBar;
