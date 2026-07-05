'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from './retroui/Button';
import Image from 'next/image';
import logo from '@/assets/logo.png';

const links = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Products', href: '/#products' },
];

export function Navbar({ isLanding }: { isLanding?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const heroHeight = window.innerHeight * 0.8;
    const handleScroll = () => setIsScrolled(window.scrollY > heroHeight);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSolidBg = isScrolled || isOpen || !isLanding;

  return (
    <div className="fixed w-full top-0 z-40">
      <nav
        className={`h-16 md:h-18 px-6 md:px-14 flex items-center justify-between transition-all duration-200 ${
          showSolidBg
            ? 'bg-white border-b-2'
            : 'bg-transparent'
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="URange Systems"
            className="h-12 w-auto object-contain"
            priority
          />
          <span className="font-head text-xl text-brand">URange Systems</span>
        </Link>

        <ul className="hidden md:flex items-center gap-4">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="font-head text-sm transition-colors duration-200 hover:text-brand hover:underline px-2 py-1"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </li>
        </ul>

        <Button
          className="px-1.5 py-1.5 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </nav>

      <div
        className={`md:hidden w-full bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 py-6' : 'max-h-0 py-0'
        }`}
      >
        <ul className="flex flex-col items-center gap-4 px-8">
          {links.map((l) => (
            <li key={l.label} className="w-full text-center">
              <Link
                href={l.href}
                onClick={() => setIsOpen(false)}
                className="font-head transition-colors duration-200 hover:text-brand hover:underline px-2 py-1 inline-block"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="w-full pt-2 border-t border-neutral-200">
            <Link href="/signup" className="flex justify-center">
              <Button className="w-full">Get Started</Button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}