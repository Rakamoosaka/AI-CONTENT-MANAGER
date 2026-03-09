"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiGetWithMeta, apiMutation } from "@/lib/api/client";
import type {
  Article,
  ArticleListMeta,
  Category,
  DashboardStats,
} from "./types";
import { contentKeys, type ArticleFilters } from "./query-keys";

function invalidateContentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: contentKeys.articles() });
  queryClient.invalidateQueries({ queryKey: contentKeys.categories() });
  queryClient.invalidateQueries({ queryKey: contentKeys.dashboard() });
}

export function useCategories() {
  return useQuery({
    queryKey: contentKeys.categories(),
    queryFn: () => apiGet<Category[]>("/api/categories"),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: contentKeys.dashboard(),
    queryFn: () => apiGet<DashboardStats>("/api/dashboard", { cache: "no-store" }),
  });
}

export function useArticles(filters: ArticleFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));

  return useQuery({
    queryKey: contentKeys.articleList(filters),
    queryFn: () =>
      apiGetWithMeta<Article[], ArticleListMeta>(
        `/api/articles?${params.toString()}`,
      ),
  });
}

export function useArticle(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: contentKeys.article(id),
    queryFn: () => apiGet<Article>(`/api/articles/${id}`),
  });
}

export function useUpsertArticle(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Article>) =>
      id
        ? apiMutation<Article>(`/api/articles/${id}`, "PATCH", payload)
        : apiMutation<Article>("/api/articles", "POST", payload),
    onSuccess: () => {
      invalidateContentQueries(queryClient);
      if (id) {
        queryClient.invalidateQueries({ queryKey: contentKeys.article(id) });
      }
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiMutation<{ deleted: true }>(`/api/articles/${id}`, "DELETE"),
    onSuccess: () => {
      invalidateContentQueries(queryClient);
    },
  });
}

export function useBulkCategorize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      assignments: Array<{ articleId: string; categoryId: string | null }>,
    ) =>
      apiMutation<{ updated: number }>(
        "/api/articles/bulk-categorize",
        "POST",
        {
          assignments,
        },
      ),
    onSuccess: () => {
      invalidateContentQueries(queryClient);
    },
  });
}

export function useUpsertCategory(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Category>) =>
      id
        ? apiMutation<Category>(`/api/categories/${id}`, "PATCH", payload)
        : apiMutation<Category>("/api/categories", "POST", payload),
    onSuccess: () => {
      invalidateContentQueries(queryClient);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiMutation<{ deleted: true }>(`/api/categories/${id}`, "DELETE"),
    onSuccess: () => {
      invalidateContentQueries(queryClient);
    },
  });
}
