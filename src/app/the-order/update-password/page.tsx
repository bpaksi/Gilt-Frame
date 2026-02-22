import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin/auth";
import UpdatePasswordForm from "./UpdatePasswordForm";

export default async function UpdatePasswordPage() {
  if (!(await verifyAdminSession())) {
    redirect("/the-order/login");
  }

  return (
    <div className="min-h-dvh bg-admin-bg flex items-center justify-center py-10 px-6">
      <div className="w-full max-w-[360px]">
        <h1 className="font-sans text-xl font-semibold tracking-[2px] uppercase text-admin-text mb-2 text-center">
          Set Password
        </h1>
        <p className="font-sans text-sm text-admin-text-faint text-center mb-10">
          Choose a password to complete your account setup.
        </p>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
