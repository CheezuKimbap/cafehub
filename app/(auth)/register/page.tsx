import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    const referer = (await headers()).get("referer") || "/=";
    redirect(referer);
  }

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
        <div className="relative z-10 flex justify-center w-full">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
