import { redirect } from "next/navigation";
import { createChat } from "@/util/chat-store";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Create a new chat and redirect to it
  const id = await createChat();
  redirect(`/chat/${id}`);
}
