"use client";
import { Sora } from "next/font/google";
import { signIn, useSession } from "next-auth/react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { SignInForm } from "@/components/forms/signinForm";

export default function Singup() {
  const session = useSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full bg-[#F3E6C9] border-black rounded-2xl shadow-lg p-6 flex flex-col items-center relative">
        <CardHeader className="text-3xl font-extrabold mb-1 my-4 text-[#3E2C1C] text-center w-full">
          Create an Account
        </CardHeader>
        <CardDescription className="text-sm text-[#5C4B3C] mb-4 text-center">
          Already have an account?{" "}
          <a href="/signin" className="underline">
            Sign in
          </a>
        </CardDescription>
        <SignInForm />
        {/* Divider */}
        <div className="flex items-center gap-2 w-full my-3">
          <span className="flex-1 h-px bg-gray-400"></span>
          <span className="text-gray-500 text-sm">Or sign in with</span>
          <span className="flex-1 h-px bg-gray-400"></span>
        </div>

        {/* Google Sign-In */}
        <button
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <Image
            src="/google.png"
            alt="Google logo"
            width={20}
            height={20}
            quality={100}
          />
          <span>Google</span>
        </button>
      </Card>
    </div>
  );
}
