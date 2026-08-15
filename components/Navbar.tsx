'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/retro/button";
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { ModeToggle } from './ModeToggle';

const links = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Products', href: '/#products' },
  { label: 'Blog', href: '/#blog' },
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

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  const showSolidBg = isScrolled || isOpen || !isLanding;

  return (
    <>
      <div className="fixed w-full top-0 z-40">
        <nav
          className={`h-20 px-6 md:px-14 flex items-center justify-between transition-all duration-200 ${showSolidBg
            ? 'bg-background border-b-2'
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
            <span className="font-head text-xl text-brand">URange Solutions</span>
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
              <Link href="/#contact">
                <Button className='dark:text-white'>Contact Us</Button>
              </Link>
            </li>
            <li>
              <ModeToggle />
            </li>
          </ul>
          <div className="md:hidden flex flex-row items-center gap-4">
            <ModeToggle />
            <Button
              className="px-1.5 py-1.5 "
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </nav>

      </div>


      <div className={`fixed inset-0 z-30 bg-background md:hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
        <div className='relative h-full w-full justify-center pt-20'>
          <ul className="grid grid-cols-1 gap-2 flex-col mt-10 mx-6">
            {links.map((l) => (
              <li key={l.label} className="w-full text-center">
                <li>
                  <Link href={l.href}
                    onClick={() => setIsOpen(false)} className="bg-card/10 d font-head hover:text-brand p-3.5 hover:bg-card/20 focus:bg-card/20 flex flex-row justify-between items-center transition-all duration-300">
                    <span>{l.label}</span>
                    <ArrowRight className='h-5 w-5' />
                  </Link>
                </li>
              </li>
            ))}
          </ul>
          <div className='absolute bottom-8 w-full flex flex-col gap-4 justify-center px-6'>
            <Link href={"/#contact"} className='w-full'>
              <Button size='lg' className='w-full py-3'>{"Contact Us"}</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}