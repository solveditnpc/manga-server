type UpdateOptions = {
  scroll?: boolean;
};

type Params = {
  [key: string]: number | string | null | undefined;
};

export const toSearchParamsString = (updates: Params) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(updates)) {
    if (value !== null && value !== undefined && value !== "")
      params.set(key, String(value));
  }

  return params.toString();
};
