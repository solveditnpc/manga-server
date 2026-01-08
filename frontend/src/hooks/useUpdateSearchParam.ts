import { useRouter , useSearchParams } from "next/navigation";

export function useUpdateSearchParam() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (key: string, value: string, options?: { scroll?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    router.replace(`?${params.toString()}`, {
      scroll: options?.scroll || false,
    });
  };
}
