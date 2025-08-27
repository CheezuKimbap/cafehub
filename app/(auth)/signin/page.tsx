"use client";
import { Sora } from "next/font/google";
import { signIn } from "next-auth/react";
import { Poppins } from "next/font/google";
import { TextInput } from "@/app/components/input/TextInput";
import Image from "next/image";

const sora = Sora({ subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export default function SignIn() {
  return (
    <div
      className={`${sora.className} bg-[#F3E6C9] min-h-screen flex items-center justify-center px-4 py-12`}
    >
      <Image
        className="absolute bottom-0 left-0 z-[1] rotate-[-20deg] "
        src="/food2.png"
        alt="Google logo"
        width={800}
        height={800}
        quality={100}
      />

      <Image
        className="absolute top-0 right-0 rotate-[20deg]"
        src="/food1.png"
        alt="Google logo"
        width={1000}
        height={1000}
        quality={100}
      />
      <div className="w-full sm:w-6/12 max-h-[70vh] h-[70%] rounded-2xl z-10 bg-[#ddc3a54d] flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-4xl font-extrabold  text-[#5E4430]">
          Create an Account
        </h1>
        <p className="text-[#5E4430] font-medium">
          Already have an account?{" "}
          <span className="underline cursor-pointer">Sign in</span>
        </p>

        <div className={`${poppins.className} w-5/12 mt-20`}>
          <div className="grid grid-cols-2 gap-4 ">
            <TextInput type="text" placeholder="First Name" className="" />
            <TextInput type="text" placeholder="Last Name" className="" />
          </div>

          <div className="">
            <TextInput type="email" placeholder="Email" className="" />

            <TextInput type="password" placeholder="Password" className="" />

            <TextInput
              type="password"
              placeholder="Confirm Password"
              className=""
            />
          </div>
          <button className="btn bg-[#1C1306] px-4 py-2 mx-auto mt-4 rounded-xl  flex justify-center">
            Create Account
          </button>
        </div>

        <div className="flex items-center w-full my-6">
          <div className="flex-grow h-px bg-[#5E4430]"></div>
          <span className="px-4 text-[#5E4430] text-sm font-medium">
            Or Sign in with
          </span>
          <div className="flex-grow h-px bg-[#5E4430]"></div>
        </div>

        <button
          className="btn bg-[#1C1306] px-4 py-2 mx-auto mt-4 rounded-xl  flex justify-center"
          onClick={() => signIn("google")}
        >
          <Image
            src="/google.png"
            alt="Google logo"
            width={20}
            height={20}
            quality={100}
          />
          <span className="px-2">Google</span>
        </button>
      </div>
    </div>
  );
}
