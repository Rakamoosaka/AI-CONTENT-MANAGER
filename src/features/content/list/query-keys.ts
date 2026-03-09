export type ArticleFilters = {
  search?: string;
  status?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
};

export const contentKeys = {
  all: ["content"] as const,
  categories: () => [...contentKeys.all, "categories"] as const,
  dashboard: () => [...contentKeys.all, "dashboard"] as const,
  articles: () => [...contentKeys.all, "articles"] as const,
  articleList: (filters: ArticleFilters) =>
    [
      ...contentKeys.articles(),
      {
        search: filters.search ?? "",
        status: filters.status ?? "",
        categoryId: filters.categoryId ?? "",
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  article: (id?: string) =>
    [...contentKeys.articles(), "detail", id ?? ""] as const,
};
