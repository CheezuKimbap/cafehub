// src/lib/authActions.ts
import { signOut } from "next-auth/react";
import { resetStore } from "@/redux/store";

export async function handleLogout() {
  // 1. Reset Redux store
  resetStore();

  // 2. Clear session and redirect
  await signOut({ callbackUrl: "/" });
}
