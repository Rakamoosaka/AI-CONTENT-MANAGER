import Database from "better-sqlite3";

function resolveDbPath() {
  const raw = process.env.DATABASE_URL ?? "file:./sqlite.db";
  return raw.replace(/^file:/, "") || "sqlite.db";
}

const dbPath = resolveDbPath();
const db = new Database(dbPath);

const now = Date.now();

const categorySeeds = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Tech Ops",
    slug: "tech-ops",
    description: "Infrastructure, reliability, and developer workflows.",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Product Marketing",
    slug: "product-marketing",
    description: "Positioning, campaigns, and launch messaging.",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "AI Strategy",
    slug: "ai-strategy",
    description: "Applied AI playbooks for content and growth teams.",
  },
];

const articleSeeds = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Building a Reliable Content Pipeline",
    body: "A practical guide to planning, generating, and reviewing content with clear ownership and quality checkpoints.",
    status: "published",
    locale: "en",
    seoTitle: "Reliable content pipeline for modern teams",
    seoDescription:
      "Learn how to run a repeatable content pipeline with editorial standards, QA loops, and performance tracking.",
    seoKeywords: JSON.stringify(["content pipeline", "editorial ops", "quality control"]),
    categorySlug: "tech-ops",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    title: "Launch Messaging That Converts",
    body: "How to align product value propositions with campaign messaging across channels during a feature launch.",
    status: "draft",
    locale: "en",
    seoTitle: "Launch messaging playbook",
    seoDescription:
      "A concise framework for translating product capabilities into customer-facing launch stories.",
    seoKeywords: JSON.stringify(["launch messaging", "product marketing", "positioning"]),
    categorySlug: "product-marketing",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    title: "AI Editorial Workflows in Practice",
    body: "A field guide to using AI for first drafts, categorization, translation, and SEO suggestion loops in one workflow.",
    status: "published",
    locale: "en",
    seoTitle: "AI editorial workflows",
    seoDescription:
      "Operational patterns for integrating AI actions into your CMS while keeping editorial control.",
    seoKeywords: JSON.stringify(["ai workflow", "cms", "seo suggestions"]),
    categorySlug: "ai-strategy",
  },
];

const generatedArticleSeeds = Array.from({ length: 36 }, (_, index) => {
  const articleNumber = index + 1;
  const status = articleNumber % 4 === 0 ? "published" : "draft";
  const locale = ["en", "ru", "kk", "zh"][index % 4];
  const categorySlug = categorySeeds[index % categorySeeds.length].slug;

  return {
    id: `dddddddd-dddd-4ddd-8ddd-${String(articleNumber).padStart(12, "0")}`,
    title: `Mock Article ${articleNumber}: Editorial Workflow Benchmark`,
    body: `This is seeded mock article ${articleNumber} used to verify list pagination, filtering, and search behavior in the content manager. It includes enough text for validation and can be safely edited or deleted during local testing.`,
    status,
    locale,
    seoTitle: `Mock Article ${articleNumber} SEO Title`,
    seoDescription: `Seeded description for mock article ${articleNumber} to validate pagination and metadata rendering.`,
    seoKeywords: JSON.stringify([
      "mock data",
      "pagination test",
      `article ${articleNumber}`,
    ]),
    categorySlug,
  };
});

const allArticleSeeds = [...articleSeeds, ...generatedArticleSeeds];

try {
  db.exec("BEGIN");

  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, slug, description)
    VALUES (@id, @name, @slug, @description)
  `);

  for (const category of categorySeeds) {
    insertCategory.run(category);
  }

  const categoryBySlug = db.prepare("SELECT id FROM categories WHERE slug = ?");
  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO articles (
      id,
      title,
      body,
      excerpt,
      status,
      locale,
      seo_title,
      seo_description,
      seo_keywords,
      category_id,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @title,
      @body,
      @excerpt,
      @status,
      @locale,
      @seoTitle,
      @seoDescription,
      @seoKeywords,
      @categoryId,
      @createdAt,
      @updatedAt
    )
  `);

  for (const article of allArticleSeeds) {
    const category = categoryBySlug.get(article.categorySlug);
    insertArticle.run({
      id: article.id,
      title: article.title,
      body: article.body,
      excerpt: article.body.slice(0, 180),
      status: article.status,
      locale: article.locale,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      seoKeywords: article.seoKeywords,
      categoryId: category?.id ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  db.exec("COMMIT");
  console.log(`Seed complete for ${dbPath}`);
  console.log(`Categories: ${categorySeeds.length}, Articles: ${allArticleSeeds.length}`);
} catch (error) {
  db.exec("ROLLBACK");
  console.error("Seed failed", error);
  process.exitCode = 1;
} finally {
  db.close();
}
