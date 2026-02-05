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

export function toValidUrl(path: string, base = "") {
  const encodeSegments = (value: string) =>
    value.split("/").filter(Boolean).map(encodeURIComponent).join("/");

  const encodedBase = encodeSegments(base);
  const encodedPath = encodeSegments(path);

  if (!encodedBase && !encodedPath) return "/";

  if (!encodedBase) return `/${encodedPath}`;
  if (!encodedPath) return `/${encodedBase}`;

  return `/${encodedBase}/${encodedPath}`;
}

export function stripUserServerPrefix(pathname: string) {
  // removes the `/user/[server]/` prefix
  return pathname.replace(/^\/user\/[^/]+/, "") || "/";
}
