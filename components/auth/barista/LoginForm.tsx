"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null); // reset previous error
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (!result?.error) {
      router.push("/barista/dashboard");
    } else {
      setLoginError(result.error || "Invalid credentials");
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
            {...register("email", { required: "Email is required" })}
            className="rounded-full border-[#ac9c81]"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}

          <Input
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
            className="rounded-full border-[#ac9c81]"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}

          {loginError && (
            <p className="text-red-500 text-center text-sm">{loginError}</p>
          )}

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
            className="w-full bg-black text-white rounded-full"
          >
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
