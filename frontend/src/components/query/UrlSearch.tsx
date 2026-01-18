"use client";
import { Input, Button } from "../ui";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParam";
import { Search } from "lucide-react";
import { toSearchParamsString } from "@/utils/params.utils";

interface UrlSearchProps {
  debounced?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onInputDirty?: (isDirty: boolean) => void;
  targetRoute?: string;
}

export default function UrlSearch({
  debounced,
  inputProps,
  onInputDirty,
  targetRoute,
}: UrlSearchProps) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateSearchParam = useUpdateSearchParams();
  const currentQuery: string = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);

  const commitSearch = (query: string) => {
    const updates = { q: query.trim(), page: "1" };

    if (targetRoute && pathName !== targetRoute) {
      router.push(`${targetRoute}?${toSearchParamsString(updates)}`);
      return;
    }
    if (currentQuery === query.trim()) return;

    updateSearchParam(updates);
  };

  // Sync query to url
  useEffect(() => setQuery(currentQuery), [currentQuery]);

  // Debounce search
  useEffect(() => {
    if (!debounced) return;
    if (query === currentQuery) return;

    const DEBOUNCE_MS = 500;

    const debounceTimeOut = setTimeout(() => commitSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceTimeOut);
  }, [query, debounced]);

  // Basic search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(query);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setQuery(value);

    value = value.trim();
    onInputDirty?.(value !== "" && value !== currentQuery);
  };
  return debounced ? (
    <Input
      placeholder="Search ..."
      {...inputProps}
      type="search"
      name="q"
      value={query}
      onChange={onInputChange}
    />
  ) : (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <Input
        placeholder="Search ..."
        {...inputProps}
        type="search"
        name="q"
        value={query}
        onChange={onInputChange}
      />
      <Button type="submit" aria-label="Search" className="p-2!">
        <Search size={18} />
      </Button>
    </form>
  );
}
