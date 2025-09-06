import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function LoginPage() {
  const session = await auth();

  if (session) redirect("/menu"); // redirect if already logged in

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5e6cc] relative">
      <nav className="w-full flex py-4 bg-transparent absolute top-0 z-30">
        <Link href="/">
          <p className="font-bold uppercase text-xl px-8">
            <span className="text-3xl">C</span>offeesentials
          </p>
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 w-[90%] max-w-5xl bg-[#f5e6cc] rounded-2xl shadow-xl overflow-hidden border-1 border-[#d8ccb7]">
        <div className="flex flex-col justify-center items-center p-10 bg-[#f3e6c9]">
          <LoginForm />
        </div>

        <div className="relative w-full h-full bg-[#f5e6cc]">
          <img
            src="/home/hero-img.png"
            alt="Coffee"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
