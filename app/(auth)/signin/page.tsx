"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    await signIn("credentials", {
      redirect: true,
      email: data.email,
      password: data.password,
      callbackUrl: "/",
    });
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

      <div className="min-h-screen flex justify-center items-center bg-[#f5e6cc] ">
        <div className="grid grid-cols-1 md:grid-cols-2 w-[90%] max-w-5xl bg-[#f5e6cc] rounded-2xl shadow-xl overflow-hidden border-1 border-[#d8ccb7]">
          {/* Left Side - Form */}
          <div className="flex flex-col justify-center items-center p-10 bg-[#f3e6c9]">
            <Card className="w-full max-w-sm bg-transparent border-0 shadow-none ">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold text-[#3E2C1C] text-center">
                  Hi welcome!
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
                <div className="flex items-center gap-2 w-full my-3">
                  <span className="flex-1 h-px bg-gray-400"></span>
                  <span className="text-gray-500 text-sm">Or sign in with</span>
                  <span className="flex-1 h-px bg-gray-400"></span>
                </div>
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
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Full Image */}
          <div className="relative w-full h-full bg-[#f5e6cc]">
            <Image
              src="/home/hero-img.png"
              alt="Coffee"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
