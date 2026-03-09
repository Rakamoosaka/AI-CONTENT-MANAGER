type ArticleWithSeoKeywords = {
  seoKeywords: string | null;
};

export function deserializeSeoKeywords(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function serializeSeoKeywords(value?: string[] | null): string {
  return JSON.stringify(value ?? []);
}

export function withSeoKeywords<T extends ArticleWithSeoKeywords>(
  row: T,
): Omit<T, "seoKeywords"> & { seoKeywords: string[] } {
  return {
    ...row,
    seoKeywords: deserializeSeoKeywords(row.seoKeywords),
  };
}
