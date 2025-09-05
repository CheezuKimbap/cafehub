"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// 1️⃣ Define Zod schema
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// 2️⃣ Infer TypeScript type from Zod schema
type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    console.log("Signup form submitted:", data);
  };

  return (
    <div>
      <nav className="w-full flex py-4 bg-transparent absolute top-0 z-30">
        <Link href="/">
          <p className="font-bold uppercase text-xl px-8">
            <span className="text-3xl">C</span>offeesentials
          </p>
        </Link>
      </nav>

      <div className="min-h-screen flex items-center justify-center bg-[#f5e6cc] relative overflow-hidden">
        {/* Left Food Image */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-4/12 z-0 -rotate-12 hidden md:block">
          <Image
            src="/signup/signup-food-2.png"
            alt="Food Left"
            width={480}
            height={480}
            className="object-contain scale-125"
            priority
          />
        </div>

        {/* Right Food Image */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4/12 z-0 rotate-12 hidden md:block">
          <Image
            src="/signup/signup-food-1.png"
            alt="Food Right"
            width={520}
            height={520}
            className="object-contain scale-125"
            priority
          />
        </div>

        {/* Center Card */}
        <div className="relative z-10 flex justify-center w-full">
          <Card className="w-full max-w-md py-2 bg-[#f3e6c9] border border-[#d8ccb7] rounded-2xl shadow-lg p-6">
            <CardHeader>
              <CardTitle className="text-3xl font-extrabold text-[#3E2C1C] text-center">
                Create Account
              </CardTitle>
              <p className="text-center text-sm text-[#5C4B3C]">
                Please enter your details to sign up.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  {...register("firstName")}
                  className="rounded-full border-[#ac9c81]"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName.message}
                  </p>
                )}

                <Input
                  type="text"
                  placeholder="Last Name"
                  {...register("lastName")}
                  className="rounded-full border-[#ac9c81]"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName.message}
                  </p>
                )}

                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="rounded-full border-[#ac9c81]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}

                <Input
                  type="password"
                  placeholder="Password"
                  {...register("password")}
                  className="rounded-full border-[#ac9c81]"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-black text-white rounded-full"
                >
                  Sign Up
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/signin" className="underline">
                    Sign In
                  </Link>
                </p>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2 w-full my-3">
                <span className="flex-1 h-px bg-gray-400"></span>
                <span className="text-gray-500 text-sm">Or sign up with</span>
                <span className="flex-1 h-px bg-gray-400"></span>
              </div>

              {/* Google Button */}
              <button
                type="button"
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
        </div>
      </div>
    </div>
  );
}
