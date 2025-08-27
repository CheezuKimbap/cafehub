"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div>
      <h1>Test</h1>
      <button className="btn btn-primary " onClick={() => signIn("google")}>
        BUtton Google
      </button>
    </div>
  );
}
