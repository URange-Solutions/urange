import Image from "next/image";
import logo from '@/assets/logo-dark.png';
import { ArrowRight, ArrowUpRight } from "lucide-react";

const navLinks = [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Products", href: "/#products" },
    { label: "Blog", href: "/#blog" },
    { label: "Contact", href: "/#contact" },
];

const products = [
    { label: "EZVote", href: "https://ezvote.urange.tech" },
    { label: "InnrollPH", href: "#" },
    { label: "HIRAM", href: "#" },
    { label: "ResQLink", href: "#" },
    { label: "See More...", href: "/products" },
];

const socials = [
    { label: "GitHub", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "Twitter / X", href: "#" },
    { label: "Facebook", href: "https://www.facebook.com/urangesolutions" },
    { label: "Instagram", href: "#" },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-black">
            <div className="border-b border-neutral-800 py-12 mx-6 md:mx-24 flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="max-w-sm">
                    <div className="flex flex-row items-center -ml-3">
                        <Image
                            src={logo}
                            alt="URange Systems"
                            className="h-12 w-auto object-contain"
                            priority
                        />
                        <h1 className='font-head text-xl text-white'>URange Solutions</h1>
                    </div>
                    <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                        Turning visible problems into efficient, accessible, and reliable
                        digital systems.
                    </p>
                </div>

                <div className="w-full md:w-auto md:min-w-80">
                    <p className="font-head text-xs tracking-widest text-neutral-500 mb-3">
                        STAY IN THE LOOP
                    </p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 bg-neutral-900 border-2 border-neutral-700 border-r-0 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-brand transition-colors"
                        />
                        <button className="bg-brand text-white font-head text-xs tracking-widest px-5 py-3 border-2 border-brand hover:bg-white hover:text-brand transition-colors shrink-0">
                            SUBSCRIBE
                        </button>
                    </div>
                    <p className="text-neutral-600 text-xs mt-2">
                        No spam. Product updates and new system launches only.
                    </p>
                </div>
            </div>

            <div className="py-12 mx-6 md:mx-24 grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-neutral-800">

                <div>
                    <p className="font-head text-xs tracking-widest text-neutral-500 mb-4">
                        NAVIGATE
                    </p>
                    <ul className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className="text-neutral-400 text-sm hover:text-brand transition-colors"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="font-head text-xs tracking-widest text-neutral-500 mb-4">
                        PRODUCTS
                    </p>
                    <ul className="flex flex-col gap-3">
                        {products.map((p) => (
                            <li key={p.label}>
                                <a
                                    href={p.href}
                                    className="text-neutral-400 text-sm hover:text-brand transition-colors"
                                >
                                    {p.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="font-head text-xs tracking-widest text-neutral-500 mb-4">
                        FOLLOW
                    </p>
                    <ul className="flex flex-col gap-3">
                        {socials.map((s) => (
                            <li key={s.label}>
                                <a
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-400 text-sm hover:text-brand transition-colors inline-flex items-center gap-1.5"
                                >
                                    {s.label}
                                    <span><ArrowUpRight className="h-4 w-4" /></span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="font-head text-xs tracking-widest text-neutral-500 mb-4">
                        REACH US
                    </p>
                    <div className="flex flex-col gap-3">
                        <a
                            href="mailto:contact@urange.tech"
                            className="text-neutral-400 text-sm hover:text-brand transition-colors break-all"
                        >
                            contact@urange.tech
                        </a>
                        <p className="text-neutral-400 text-sm">+63 924 477 2453</p>
                        <p className="text-neutral-600 text-xs leading-relaxed">
                            Bulacan, Philippines
                        </p>
                        <a
                            href="#contact"
                            className="mt-1 self-start flex flex-row gap-1 font-head text-xs tracking-widest text-brand border-b border-brand pb-0.5 hover:text-white hover:border-white transition-colors"
                        >
                            SEND A MESSAGE <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="py-6 mx-6 md:mx-24 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-neutral-600 text-xs">
                    © {year} URange Solutions. All rights reserved.
                </p>
                <div className="flex gap-6">
                    <a
                        href="#
                        /privacy-policy"
                        className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors"
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="/terms-of-service"
                        className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors"
                    >
                        Terms of Service
                    </a>
                </div>
            </div>

        </footer>
    );
}
