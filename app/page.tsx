import { Playfair_Display } from "next/font/google";
import { MoveDown, Star, MoveLeft, MoveRight } from "lucide-react";
import Navigation from "@/components/layout/client/navigation";
import Link from "next/link";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export default async function Home() {
  return (
    <>
      <main className="w-full scroll-smooth">
        {/* Hero Section */}
        <section className=" w-full pt-16  flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-8 lg:mb-0 lg:w-1/2 ml-16 ">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              A cup of <br />
              <span className="text-black">Happiness</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-700">
              for coffee & conversation
            </p>
            <div className="mt-8 flex justify-center lg:justify-start space-x-4">
              <Link href="/menu">
                <button className="bg-[#F0A35B] text-white font-medium py-3 px-6 rounded-md hover:bg-[#754a21] transition-colors duration-300">
                  Order Now
                </button>
              </Link>
              <button className="bg-[#1C1306] text-white font-medium py-3 px-6 rounded-md hover:bg-[#030200] transition-colors duration-300">
                Explore
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <img
              src="/home/hero-img.png"
              alt="Various cups of coffee, including a latte with art, a macchiato, and a layered coffee drink."
              className="max-w-full h-auto"
            />
          </div>
        </section>

        <section className="bg-[#DDC3A5] w-full  relative overflow-hidden">
          {/* Content wrapper */}
          <div className="relative z-10  mx-auto">
            {/* Drinks Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-1/2 relative flex justify-center lg:justify-start mb-8 lg:mb-0">
                <img
                  src="/home/drinks.png"
                  alt="Assortment of coffee and drinks"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
              <div className="lg:w-1/2 text-center lg:text-left lg:pl-16 mr-12">
                <h2
                  className={`${playfair.className} text-5xl font-serif text-gray-800 mb-4`}
                >
                  Food & Snacks
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet. Et laboriosam voluptatem aut
                  numquam officia et dolor voluptate. Cum eveniet galisum vel
                  repellendus atque aut harum minus.
                </p>
                <button className="bg-stone-800 text-white font-medium py-3 px-6 rounded-md hover:bg-stone-900 transition-colors duration-300">
                  View more
                </button>
              </div>
            </div>

            {/* Food & Snacks Section */}
            <div className="flex flex-col lg:flex-row-reverse items-center justify-between">
              <div className="lg:w-1/2 relative flex justify-center lg:justify-end mb-8 lg:mb-0">
                <img
                  src="/home/snacks.png"
                  alt="Burger, fries, and fried chicken"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
              <div className="lg:w-1/2 text-center lg:text-left lg:pr-16  ml-12">
                <h2
                  className={`${playfair.className} text-5xl font-serif text-gray-800 mb-4`}
                >
                  Food & Snacks
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet. Et laboriosam voluptatem aut
                  numquam officia et dolor voluptate. Cum eveniet galisum vel
                  repellendus atque aut harum minus.
                </p>
                <button className="bg-stone-800 text-white font-medium py-3 px-6 rounded-md hover:bg-stone-900 transition-colors duration-300">
                  View more
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[#DDC3A5] w-full overflow-hidden">
          {/* Background beans top */}
          <img
            src="/home/beans-bg.png"
            alt="beans-vector"
            className="absolute top-0 left-0 transform -translate-y-1/4 -translate-x-1/4 z-0"
          />

          {/* Title */}
          <div
            className={`${playfair.className} text-center text-4xl mx-auto w-full pt-10 relative z-10`}
          >
            <h1>Best Selling Items</h1>
          </div>

          {/* Products */}
          <div className="w-full flex justify-evenly relative z-10">
            <div>
              <img src="/home/coffee-1.png" alt="Coffee 1" />
            </div>
            <div>
              <img src="/home/coffee-2.png" alt="Coffee 2" />
            </div>
            <div>
              <img src="/home/coffee-3.png" alt="Coffee 3" />
            </div>
          </div>

          {/* Background beans bottom */}
          <img
            src="/home/beans-bg.png"
            alt="beans-vector"
            className="absolute bottom-0 right-0 transform translate-y-2/4 rotate-180 z-0"
          />

          {/* Button */}
          <div className="w-full mx-auto text-center py-12 relative z-10">
            <a href="#reviews">
              <button className="bg-[#5E4430] rounded-full p-4 cursor-pointer">
                <MoveDown className="text-white" />
              </button>
            </a>
          </div>
        </section>

        <section
          id="reviews"
          className="relative w-full bg-[#5E4430] pb-24 overflow-hidden"
        >
          <img
            src="/home/beans-bg-1.png"
            alt="beans-vector"
            className="absolute top-0 left-0 transform -translate-y-1/4 -translate-x-1/4 z-0"
          />
          <div
            className={`${playfair.className}  mx-auto w-full pt-10 relative z-10 text-white`}
          >
            <h2 className="text-center text-4xl pt-8 font-bold">
              Our customers reviews
            </h2>
          </div>
          <div className="flex items-center justify-center">
            {/* Left button */}
            <button className="px-4 bg-[#A78868] rounded-lg cursor-pointer border-black border-3">
              <MoveLeft className="w-8 h-8 " />
            </button>

            {/* Card */}
            <div className="bg-[#A78868] w-8/12 relative text-center mx-6 my-12">
              <div className="w-[80px] h-[80px] p-6 rounded-full bg-white border-4 border-[#A78868] mx-auto text-center transform -translate-y-8"></div>
              <p>Chad Chungus</p>

              <div className="rating mt-2 mb-5 space-x-1">
                <Star className="inline fill-yellow-500 text-yellow-500" />
                <Star className="inline fill-yellow-500 text-yellow-500" />
                <Star className="inline fill-yellow-500 text-yellow-500" />
                <Star className="inline fill-yellow-500 text-yellow-500" />
                <Star className="inline fill-yellow-500 text-yellow-500" />
              </div>

              <p className="w-7/12 mx-auto text-white pt-4 pb-24">
                Creamy and well-balanced, with smooth espresso and velvety milk.
                Subtle notes of caramel and chocolate. Comfort in a cup.
              </p>
            </div>

            {/* Right button */}
            <button className="px-4 bg-[#A78868] rounded-lg cursor-pointer border-black border-3">
              <MoveRight className="w-8 h-8" />
            </button>
          </div>

          <img
            src="/home/beans-bg-1.png"
            alt="beans-vector"
            className="absolute bottom-0 right-0 transform translate-y-2/4 rotate-180 z-0"
          />
        </section>

        <section className="relative w-full bg-[#5E4430] pt-12  overflow-hidden">
          <img
            src="/home/beans-bg-1.png"
            alt="beans-vector"
            className="absolute top-0 left-0 transform -translate-y-1/4 -translate-x-1/4 z-0"
          />
          <div className="flex mx-8 justify-center space-x-8">
            <div className="">
              <img
                src="/home/logo.png"
                alt="Coffeesentials Logo"
                className="w-[320px] h-[320px]"
              />
            </div>
            <div className="py-8 w-7/12">
              <h3
                className={`${playfair.className} text-4xl font-bold text-white`}
              >
                About Us
              </h3>
              <div className="flex w-full mt-8 text-white space-x-2">
                <div className="w-6/12">
                  <p className="font-bold text-2xl">Services:</p>

                  <div>
                    <p>Takeout</p>
                    <p>Dine-in</p>
                    <p>In-store pickup</p>
                  </div>
                </div>
                <div className="w-6/12">
                  <p className="font-bold text-2xl">Contact:</p>

                  <div>
                    <p>0976 013 4330</p>
                    <p>coffeesentials@gmail.com</p>
                  </div>
                </div>
                <div className="w-6/12">
                  <p className="font-bold text-2xl">Socials:</p>
                  <div>facebook.com/coffeeentials</div>
                </div>
              </div>
            </div>
          </div>
          <img
            src="/home/beans-bg-1.png"
            alt="beans-vector"
            className="absolute bottom-0 right-0 transform translate-y-[200px] translate-x-[400px]  z-0"
          />
        </section>
      </main>
    </>
  );
}
