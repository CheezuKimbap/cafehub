"use client";

import Image from "next/image";
import { Sora, Playfair_Display } from "next/font/google";
import { useSession } from "next-auth/react";
import logo from "@/public/logo.png";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { ProductCard } from "@/components/menu/ProductCard";
import organic from "@/public/home/organic.svg";
import love from "@/public/home/love.svg";
import { HomeReviews } from "@/components/reviews/HomeReviews";

const sora = Sora({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "500", "400", "700"] });


export default function HomePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const dispatch = useAppDispatch();

    const { items: products, loading } = useAppSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const infoData = {
        services: [
            "Takeout",
            "Dine-In",
            "In-store pickup",
        ],
        contact: [
            "0976 012 4330",
            "coffeesentials@gmail.com",
        ],
        socials: [
            { text: "• facebook.com/coffeesentials/", href: "https://facebook.com/coffeesentials/" },
            // Added an Instagram link for completeness
            { text: "• instagram.com/coffeesentials", href: "https://instagram.com/coffeesentials" }
        ],
    };
    return (
        <div className="relative h-screen w-full ">
            {/* Background image with gradient overlay */}
            <div
                className="absolute inset-0 bg-[url('/home/hero-bg.png')] bg-cover bg-center"
                style={{ backgroundPosition: "center 70%" }}
            ></div>

            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to bottom, rgba(26,19,16,0.8) 0%, rgba(47,33,26,0.4) 100%)",
                }}
            ></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Navbar */}
                <div className="flex justify-between items-center py-4 px-6">
                    <Image src={logo} alt="Logo" className="w-28 h-auto" />

                    <div className="flex items-center space-x-6 text-white font-medium">
                        <a href="/home" className="underline">Home</a>
                        <a href="/menu" className="hover:underline">Menu</a>
                        <a href="/about" className="hover:underline">About</a>

                        {!session ? (
                            <Button onClick={() => router.push("/login")} className=" hover:cursor-pointer">Sign In</Button>
                        ) : (
                            <span>Welcome, {session.user?.name}!</span>
                        )}
                    </div>
                </div>

                {/* Hero Text */}
                <div className="mt-[120px] mx-12 max-w-3xl      space-y-4">
                    <h1 className={`${playfair.className} text-6xl text-white`}>
                        Start Your Day with Perfect Coffee
                    </h1>

                    <p className={`${poppins.className} w-8/12 font-light text-md text-[#F0E6D6]`}>Handcrafted beverages made with premium beans and passion. Experience the art of coffee in every cup.</p>

                    <div className="space-x-4">
                        <Button
                            onClick={() => router.push("/menu")}
                            className="bg-[#6F4E37]  hover:cursor-pointer text-white rounded-full px-6 py-5 mt-4 hover:bg-gray-800 transition"
                        >
                            Explore Our Menu
                        </Button>
                        <Button className="text-white rounded-full px-6 py-5 mt-4 bg-white/20 border border-white hover:bg-white/30 transition  hover:cursor-pointer">
                            See More
                        </Button>
                    </div>
                </div>

                <div className="translate-y-[10%]  flex justify-start md:justify-end">
                    <div
                        className={`
                            max-w-xl w-full p-8 rounded-2xl shadow-2xl transition-all duration-300
                            bg-[#3D2B1C] text-white
                            sm:p-10 md:p-12
                        `}
                    >

                        {/* Featured Promo Badge */}
                        <div
                            className={`
                                inline-flex items-center space-x-2 px-5 py-2
                                bg-[#FACC15] text-[#3D2B1C]
                                rounded-full text-sm font-semibold tracking-wider uppercase mb-6
                            `}
                        >
                            <Star size={18} fill="#4d3326" stroke="none" />
                            <span>FEATURED PROMO</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif leading-tight tracking-tight mb-3">
                            Loyalty Rewards Program
                        </h1>

                        {/* Description */}
                        <p className="text-base sm:text-lg text-gray-200 mb-8 leading-relaxed">
                            Earn points with every purchase and get free drinks
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push("/register")}
                            className={`
                                w-full sm:w-auto
                                px-10 py-4
                                bg-[#f8c148] text-[#4d3326]
                                text-lg sm:text-xl font-bold
                                rounded-full shadow-xl
                                transition duration-300 ease-in-out
                                transform hover:brightness-95 hover:shadow-2xl active:scale-[0.98]
                                hover:cursor-pointer
                            `}
                        >
                            Sign up Now - It's Free!
                        </button>

                    </div>
                </div>

            </div>
            <div className="bg-[#F9F5F0]">
                <div className="pt-20" >
                    <div className="mx-auto text-center space-y-2 mb-10">
                        <p className={`${poppins.className} text-[#6F4E37] text-sm `}>Our Menu</p>
                        <h2 className={`${playfair.className} text-5xl text-[#2F211A] font-bold  `}>Signature Beverages</h2>
                        <p className={`${poppins.className} text-[#6F4E37]  `}>Crafted with love, served with passion</p>
                    </div>
                </div>


                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse h-80 bg-gray-200 rounded-2xl"
                            />
                        ))
                        : products
                            .filter((product) => product.status === "AVAILABLE")
                            .slice(0, 4).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    description={product.description}
                                    imageUrl={product.image ?? undefined} // fallback if needed
                                    variants={product.variants || []}
                                    rating={product.avgRating}
                                    hasRating={false}
                                    hasPrice={false}
                                    hasCompactPrice={true}
                                    hasDescription={true}
                                />
                            ))}
                </div>



                <div className="my-10 text-center mx-auto">
                    <Button className="bg-[#5A3E2C] text-white rounded-full px-8 py-7 mt-4 hover:bg-gray-800  hover:cursor-pointer transition" onClick={() => { router.push("/menu") }}>View Full Menu</Button>
                </div>


                <div className="my-40 flex justify-between max-w-4xl mx-auto space-x-2">
                    <div className="w-full mx-auto text-center space-y-4">
                        <Image src={organic} alt="organic" width={80} height={80} className="mx-auto text-center" />
                        <div className="space-y-4 text-center">
                            <h2 className={`${playfair.className} text-4xl text-[#2F211A]  `}>100% Ingredients</h2>
                            <p className={`${poppins.className} text-[#6F4E37]  `}>Premium organic beans sourced from sustainable farms.</p>
                        </div>
                    </div>
                    <div className="w-full mx-auto text-center space-y-4">
                        <Image src={love} alt="love" width={80} height={80} className="mx-auto text-center" />
                        <div className="space-y-4 text-center">
                            <h2 className={`${playfair.className} text-4xl text-[#2F211A]  `}>Made with Love</h2>
                            <p className={`${poppins.className} text-[#6F4E37]  `}>Every cup crafted with care and attention to detail.</p>
                        </div>
                    </div>
                </div>


                <div className="mt-40 " >
                    <div className="mx-auto text-center space-y-2 mb-10">
                        <p className={`${poppins.className} text-[#6F4E37] text-sm `}>Testimonials</p>
                        <h2 className={`${playfair.className} text-5xl text-[#2F211A] font-bold  `}>What Our Customers Say</h2>

                    </div>
                </div>
                <HomeReviews />
                <div className="relative bg-[#5E4430] text-gray-200 p-8 md:p-12 lg:p-16 shadow-2xl mx-auto">

  {/* Header/Title */}
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-12 text-center text-white relative z-10">
    About Us
  </h1>

  {/* Main Content Layout: Logo (Left) + Info (Right) */}
  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 relative z-10">

    {/* Left Side: Logo */}
    <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
      <Image src={logo} alt="Coffee Essentials Logo" className="w-64 h-64 mx-auto mb-4" />
    </div>

    {/* Right Side: Information Columns */}
    <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-sm sm:text-base">

      {/* Services Column */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-lg font-bold tracking-wider uppercase border-b border-gray-400 pb-1 mb-1">
          Services:
        </h3>
        <ul className="text-sm font-light space-y-1">
          {infoData.services.map((item, index) => (
            <li key={index} className="opacity-80">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Column */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-lg font-bold tracking-wider uppercase border-b border-gray-400 pb-1 mb-1">
          Contact:
        </h3>
        <ul className="text-sm font-light space-y-1">
          {infoData.contact.map((item, index) => (
            <li key={index} className="opacity-80">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Socials Column */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-lg font-bold tracking-wider uppercase border-b border-gray-400 pb-1 mb-1">
          Socials:
        </h3>
        <ul className="text-sm font-light space-y-1">
          {infoData.socials.map((item, index) => (
            <li key={index} className="opacity-80">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EAE7E1] transition duration-200"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>

  </div>

</div>

            </div>
        </div>






    );
}
