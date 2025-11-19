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
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {toast} from 'sonner';
import {
  registerCustomer,
  selectCustomerStatus,
  selectCustomerError,
} from "@/redux/features/customer/customerSlice";
import { useRouter } from "next/navigation";

// ✅ Zod schema
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ✅ TS type from schema
type SignupFormData = z.infer<typeof signupSchema>;

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectCustomerStatus);
  const error = useAppSelector(selectCustomerError);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // ✅ Form submit
  const onSubmit = async (data: SignupFormData) => {
    try {
      await dispatch(registerCustomer(data)).unwrap();


        toast.success("Account created successfully! Please log in.", {
        duration: 1500,
        });

        // wait for the toast to finish
        await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push("/login");
    } catch (err) {
      toast.error("Please try again. Something went wrong.")
    }
  };

  return (
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
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}

          <Input
            type="text"
            placeholder="Last Name"
            {...register("lastName")}
            className="rounded-full border-[#ac9c81]"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
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
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-black text-white rounded-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing up..." : "Sign Up"}
          </Button>

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="underline">
              Sign In
            </Link>
          </p>
        </form>

        {/* Google Button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition mt-3"
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
