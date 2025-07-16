import { Home } from "@/components/home";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is already authenticated, redirect to chat
  if (session) {
    redirect("/chat");
  }

  return <Home />;
}
