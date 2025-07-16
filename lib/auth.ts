import { betterAuth } from "better-auth";
import { db } from "../db/drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.REDIRECT_URI!,
    },
  },
});
