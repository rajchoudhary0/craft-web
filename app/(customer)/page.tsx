import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import LatestHandcrafts from "@/components/sections/LatestHandcrafts";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProducts />
      <LatestHandcrafts />
      <Testimonials />
    </>
  );
}
