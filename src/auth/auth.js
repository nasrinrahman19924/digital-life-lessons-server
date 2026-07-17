import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db, client } from "../config/db.js";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: ["https://digital-life-lessons-client-b987.vercel.app"],

  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    crossSubdomainCookie: {
      enabled: true,
    },
  },

  advanced: {
    cookie: {
      secure: true,
      sameSite: "none",
    },
  },

  user: {
    additionalFields: {
      role: {
        defaultValue: "user",
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
