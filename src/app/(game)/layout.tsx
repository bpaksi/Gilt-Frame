import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TabBar from "../../components/ui/TabBar";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const deviceToken = cookieStore.get("device_token");

  if (!deviceToken?.value) {
    redirect("/");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
      }}
    >
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <TabBar />
    </div>
  );
}
