export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount?: number;
};

export type Article = {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  status: "draft" | "published";
  locale: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  categoryId: string | null;
  categoryName?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type ArticleListMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export type DashboardStats = {
  totalArticles: number;
  published: number;
  drafts: number;
  latest: Array<{
    id: string;
    title: string;
    status: "draft" | "published";
    locale: string;
    createdAt: number;
  }>;
  categoriesDistribution: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
  }>;
};
