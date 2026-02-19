import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NotFound() {
  const headersList = await headers();
  const path = headersList.get("x-pathname") || "unknown";
  console.log(`[404] Page not found: ${path}`);
  redirect("/");
}
