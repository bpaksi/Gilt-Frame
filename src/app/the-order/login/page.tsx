import { notFound } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;

  if (k !== process.env.ADMIN_KEY) {
    notFound();
  }

  return <LoginForm />;
}
