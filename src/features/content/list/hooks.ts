"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiGetWithMeta, apiMutation } from "@/lib/api/client";
import type { Article, ArticleListMeta, Category, DashboardStats } from "./types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/api/categories"),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<DashboardStats>("/api/dashboard"),
  });
}

export function useArticles(filters: {
  search?: string;
  status?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));

  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () =>
      apiGetWithMeta<Article[], ArticleListMeta>(`/api/articles?${params.toString()}`),
  });
}

export function useArticle(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ["article", id],
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
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["article", id] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutation<{ deleted: true }>(`/api/articles/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useBulkCategorize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignments: Array<{ articleId: string; categoryId: string | null }>) =>
      apiMutation<{ updated: number }>("/api/articles/bulk-categorize", "POST", {
        assignments,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiMutation<{ deleted: true }>(`/api/categories/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
