"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
export function UserButton() {
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    redirect("/");
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <p>User: {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
      <p>Image: {session?.user?.image}</p>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
