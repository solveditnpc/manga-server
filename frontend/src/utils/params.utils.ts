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
  const isAbsolute = (v: string) => /^https?:\/\//i.test(v);

  if (isAbsolute(path)) return path;

  const encodePath = (v: string) =>
    v
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");

  const [rawPath, query = ""] = path.split("?");
  const encodedBase = encodePath(base);
  const encodedPath = encodePath(rawPath);

  const fullPath =
    encodedBase && encodedPath
      ? `/${encodedBase}/${encodedPath}`
      : encodedBase
        ? `/${encodedBase}`
        : encodedPath
          ? `/${encodedPath}`
          : "/";

  return query ? `${fullPath}?${query}` : fullPath;
}

export function stripUserServerPrefix(pathname: string) {
  // removes the `/user/[server]/` prefix
  return pathname.replace(/^\/user\/[^/]+/, "") || "/";
}
