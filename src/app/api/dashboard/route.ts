import { connection } from "next/server";
import { ok } from "@/lib/api/envelope";
import { getDashboardStats } from "@/lib/db/repositories/articles";

export async function GET() {
  await connection();
  const data = await getDashboardStats();
  return ok(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}
