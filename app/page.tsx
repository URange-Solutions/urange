import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Products } from "@/components/sections/Products";
import { Blogs } from "@/components/sections/Blogs";
import { CTA } from "@/components/sections/CTA";
import { Contact } from "@/components/sections/Contact";

export default function Landing() {
  return (
    <main>
      <Navbar isLanding />
      <Hero />
      <About />
      <Services />
      <Products />
      <Blogs />
      <CTA />
      <Contact />
      <Footer />
    </main>
  );
}