import { loadChat } from "@/util/chat-store";
import { Chat } from "@/components/chat";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserButton } from "@/components/auth/user-button";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const { id } = await props.params; // get the chat ID from the URL
  const messages = await loadChat(id); // load the chat messages
  return (
    <div>
      <UserButton />
      <Chat id={id} initialMessages={messages} />; // display the chat
    </div>
  );
}
