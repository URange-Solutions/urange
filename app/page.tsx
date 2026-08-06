import { db } from "@/database";
import { blogs } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Products } from "@/components/sections/Products";
import { Blogs } from "@/components/sections/Blogs";
import { CTA } from "@/components/sections/CTA";
import { Contact } from "@/components/sections/Contact";

export default async function Landing() {
  const latestBlogs = await db.query.blogs.findMany({
    where: eq(blogs.is_draft, true),
    orderBy: [desc(blogs.created_at)],
    limit: 3,
  });

  return (
    <main>
      <Navbar isLanding />
      <Hero />
      <About />
      <Services />
      <Products />
      <Blogs blogs={latestBlogs} />
      <CTA />
      <Contact />
      <Footer />
    </main>
  );
}