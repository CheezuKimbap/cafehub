"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false, // <- important, prevents auto redirect
      email: data.email,
      password: data.password,
      callbackUrl: "/", // still useful when success
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    if (result?.ok && result.url) {
      window.location.href = result.url; // manual redirect
    }
  };

  return (
    <Card className="w-full max-w-sm bg-transparent border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold text-[#3E2C1C] text-center">
          Hi, welcome!
        </CardTitle>
        <p className="text-center text-sm text-[#5C4B3C]">
          Please enter your details.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: true })}
            className="rounded-full border-[#ac9c81]"
          />
          <Input
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: true })}
            className="rounded-full border-[#ac9c81]"
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </p>
        </form>

        <div className="flex items-center gap-2 w-full my-3">
          <span className="flex-1 h-px bg-gray-400"></span>
          <span className="text-gray-500 text-sm">Or sign in with</span>
          <span className="flex-1 h-px bg-gray-400"></span>
        </div>

        <button
          type="button"
          disabled={loading}
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
      </CardContent>
    </Card>
  );
}
