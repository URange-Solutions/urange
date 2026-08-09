"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { ModeToggle } from "../ModeToggle";
import { ReadingProgress } from "./ReadingProgress";

export function BlogHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed w-full top-0 z-50">
      <ReadingProgress />

      <nav
        className={`h-20 px-6 md:px-14 flex items-center justify-between transition-all duration-300 ${scrolled
          ? "translate-y-0 opacity-100 bg-white dark:bg-black border-b-2"
          : "-translate-y-full opacity-0 bg-transparent"
          }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="URange Systems"
            className="h-12 w-auto object-contain"
            priority
          />
          <span className="font-head text-xl text-brand">URange / Blogs</span>
        </Link>

        <ModeToggle />
      </nav>
    </header>
  );
}