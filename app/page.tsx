import { Playfair_Display } from "next/font/google";
import { MoveDown, Star, MoveLeft, MoveRight } from "lucide-react";
import Navigation from "@/components/layout/client/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export default async function Home() {
  return (
    <main className="w-full scroll-smooth">
      {/* Hero Section */}
      <section className="w-full pt-16 pl-4 sm:pl-8 lg:pl-16 pr-4 sm:pr-8 lg:pr-0 flex flex-col lg:flex-row items-center justify-between">
        <div className="text-center lg:text-left mb-8 lg:mb-0 lg:w-1/2">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
            A cup of <br />
            <span className="text-black">Happiness</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-700">
            for coffee & conversation
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
            <Link href="/menu">
              <button className="bg-[#F0A35B] text-white font-medium py-3 px-6 rounded-md hover:bg-[#754a21] transition-colors duration-300 w-full sm:w-auto">
                Order Now
              </button>
            </Link>
            <button className="bg-[#1C1306] text-white font-medium py-3 px-6 rounded-md hover:bg-[#030200] transition-colors duration-300 w-full sm:w-auto">
              Explore
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center lg:justify-end w-full">
          <img
            src="/home/hero-img.png"
            alt="Various cups of coffee"
            className="max-w-full h-auto"
          />
        </div>
      </section>

      {/* Drinks & Food Sections */}
      <section className="bg-[#DDC3A5] w-full relative overflow-hidden px-4 sm:px-8 lg:px-16 py-12">
        <div className="space-y-12">
          {/* Drinks */}
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 flex justify-center lg:justify-start mb-6 lg:mb-0">
              <img
                src="/home/drinks.png"
                alt="Assortment of coffee and drinks"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2
                className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-800 mb-4`}
              >
                Food & Snacks
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Lorem ipsum dolor sit amet. Et laboriosam voluptatem aut numquam
                officia et dolor voluptate. Cum eveniet galisum vel repellendus
                atque aut harum minus.
              </p>
              <button className="bg-stone-800 text-white font-medium py-3 px-6 rounded-md hover:bg-stone-900 transition-colors duration-300 w-full sm:w-auto">
                View more
              </button>
            </div>
          </div>

          {/* Food & Snacks */}
          <div className="flex flex-col lg:flex-row-reverse items-center justify-between">
            <div className="lg:w-1/2 flex justify-center lg:justify-end mb-6 lg:mb-0">
              <img
                src="/home/snacks.png"
                alt="Burger, fries, and fried chicken"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2
                className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-800 mb-4`}
              >
                Food & Snacks
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Lorem ipsum dolor sit amet. Et laboriosam voluptatem aut numquam
                officia et dolor voluptate. Cum eveniet galisum vel repellendus
                atque aut harum minus.
              </p>
              <button className="bg-stone-800 text-white font-medium py-3 px-6 rounded-md hover:bg-stone-900 transition-colors duration-300 w-full sm:w-auto">
                View more
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Selling Items */}
      <section className="relative bg-[#DDC3A5] w-full overflow-hidden py-12 px-4 sm:px-8">
        <img
          src="/home/beans-bg.png"
          alt="beans"
          className="absolute top-0 left-0 transform -translate-y-1/4 -translate-x-1/4 z-0"
        />
        <div
          className={`${playfair.className} text-center text-3xl sm:text-4xl lg:text-4xl mb-8 relative z-10`}
        >
          Best Selling Items
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <img
            src="/home/coffee-1.png"
            alt="Coffee 1"
            className="max-w-full h-auto"
          />
          <img
            src="/home/coffee-2.png"
            alt="Coffee 2"
            className="max-w-full h-auto"
          />
          <img
            src="/home/coffee-3.png"
            alt="Coffee 3"
            className="max-w-full h-auto"
          />
        </div>
      </section>

      {/* Reviews */}
      <section
        id="reviews"
        className="relative w-full bg-[#5E4430] pb-24 overflow-hidden px-4 sm:px-8"
      >
        <div
          className={`${playfair.className} text-center text-white text-3xl sm:text-4xl py-8`}
        >
          Our customers reviews
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-4 bg-[#A78868] rounded-lg cursor-pointer border-black border-2">
            <MoveLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <div className="bg-[#A78868] w-full sm:w-8/12 text-center p-6 rounded-lg relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 p-6 rounded-full bg-white border-4 border-[#A78868] mx-auto -mt-12"></div>
            <p className="mt-4 font-bold">Chad Chungus</p>
            <div className="flex justify-center mt-2 mb-4 space-x-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className="inline fill-yellow-500 text-yellow-500 w-4 h-4 sm:w-5 sm:h-5"
                  />
                ))}
            </div>
            <p className="text-white text-sm sm:text-base px-4 sm:px-12">
              Creamy and well-balanced, with smooth espresso and velvety milk.
              Subtle notes of caramel and chocolate. Comfort in a cup.
            </p>
          </div>
          <button className="px-4 bg-[#A78868] rounded-lg cursor-pointer border-black border-2">
            <MoveRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </div>
      </section>
    </main>
  );
}
