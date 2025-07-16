"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
export function Home() {
  const { signIn } = authClient;

  const handleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/chat",
    });
  };

  return (
    <div>
      <Button onClick={handleSignIn}>Sign In</Button>
    </div>
  );
}
