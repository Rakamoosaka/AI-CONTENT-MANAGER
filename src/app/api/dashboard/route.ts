import { ok } from "@/lib/api/envelope";
import { getDashboardStats } from "@/lib/db/repositories/articles";

export async function GET() {
  const data = await getDashboardStats();
  return ok(data);
}
