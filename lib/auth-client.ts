"use client";

import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  // In production, use the environment variable or the current origin
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Default fallback
  return "https://eatutori.vercel.app";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;

