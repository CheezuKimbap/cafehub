"use client";

import { signOut, useSession } from "next-auth/react";

export default function LogoutPage() {
  const { data: session } = useSession();

  if (!session) return <p>You are not logged in.</p>;

  return (
    <div>
      <h1>Logout</h1>
      <button
        className="btn btn-primary"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Logout
      </button>
    </div>
  );
}
