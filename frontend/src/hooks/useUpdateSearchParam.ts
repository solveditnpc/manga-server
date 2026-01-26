import { useRouter, useSearchParams } from "next/navigation";

type UpdateOptions = {
  scroll?: boolean;
};

type Params = {
  [key: string]: string | null | undefined;
};

export function useUpdateSearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (updates: Params, options?: UpdateOptions) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      const isEmpty = value === null || value === undefined || value === "";

      if (isEmpty) params.delete(key);
      else params.set(key, String(value));
    }

    router.replace(`?${params.toString()}`, {
      scroll: options?.scroll ?? false,
    });
  };
}
