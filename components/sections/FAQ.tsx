"use client";

import { useState } from "react";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { Plus, Minus } from "lucide-react";
import Image from "next/image";
import faq from '@/assets/Questions-pana.svg'

interface FaqEntry {
    id: string;
    q: string;
    a: string;
}

const faqs: FaqEntry[] = [
    {
        id: "faq-1",
        q: "What kind of organizations do you build for?",
        a: "Mostly schools, LGUs, foundations, and small businesses tired of manual, paper-based, or spreadsheet-driven processes. If you're losing time to slow requests, lost forms, or systems that don't talk to each other, that's the kind of problem we look for.",
    },
    {
        id: "faq-2",
        q: "How long does a typical project take?",
        a: "Our average delivery time is around 4 weeks for a first working version. Larger or more complex systems take longer, but we scope things to get you something usable fast, then iterate from there.",
    },
    {
        id: "faq-3",
        q: "How much does a project cost?",
        a: "It depends on the scope, but we always start with a free assessment of your process before quoting anything. Tell us the problem and we'll tell you honestly whether it's a good fit and roughly what it takes.",
    },
    {
        id: "faq-4",
        q: "How do you handle data privacy and security?",
        a: "We follow Data Privacy Act (RA 10173) principles for any personal data we handle, including data collected through the systems we build, such as EZVote. Each product has its own Privacy Policy covering what's collected and how it's protected.",
    },
    {
        id: "faq-5",
        q: "Do you offer support after launch?",
        a: "Yes. We don't disappear after handoff. We patch, monitor, and extend what we build as part of our Maintenance & Support service, so your system keeps working as your needs change.",
    },
    {
        id: "faq-6",
        q: "Can you issue formal contracts, quotations, or receipts?",
        a: "Yes, we can provide formal proposals, quotations, and contracts for institutions and organizations that require them as part of their procurement process.",
    },
    {
        id: "faq-7",
        q: "What if I'm not sure what kind of system I need?",
        a: "That's fine, most people aren't. Tell us about the problem, not the solution. We'll figure out whether it needs a web app, mobile app, hardware integration, or something simpler, and say so honestly if it's not a good fit.",
    },
];

interface FaqItemProps {
    item: FaqEntry;
    isOpen: boolean;
    onToggle: () => void;
}

function FaqItem({ item, isOpen, onToggle }: FaqItemProps) {
    return (
        <div className="border-b border-neutral-300 dark:border-neutral-800">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-6 py-6 text-left group"
            >
                <span className="font-head text-lg md:text-xl text-black dark:text-white group-hover:text-brand transition-colors">
                    {item.q}
                </span>
                <span className="shrink-0 text-brand">
                    {isOpen ? (
                        <Minus className="h-5 w-5" />
                    ) : (
                        <Plus className="h-5 w-5" />
                    )}
                </span>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <p className="text-neutral-700 dark:text-neutral-400 text-sm leading-relaxed pb-6 max-w-2xl">
                        {item.a}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function FAQ() {
    const [openId, setOpenId] = useState<string | null>(faqs[0].id);

    const toggle = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <section id="faq" className="py-24 bg-background">
            <Reveal className="mx-6 md:mx-24">
                <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
                    FAQ
                </span>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <Text className="font-head text-4xl md:text-5xl text-black dark:text-white max-w-xl leading-tight">
                        QUESTIONS,{" "}
                        <span className="bg-brand text-white px-2">ANSWERED.</span>
                    </Text>
                    <Text className="text-neutral-600 dark:text-neutral-400 max-w-sm text-sm">
                        Didn't find what you're looking for? Reach out and we'll get back
                        to you directly.
                    </Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                    <div className="hidden md:block">
                        <Image src={faq} alt={"Question FAQs"} />
                    </div>
                    <div className="max-w-3xl">
                        {faqs.map((item) => (
                            <FaqItem
                                key={item.id}
                                item={item}
                                isOpen={openId === item.id}
                                onToggle={() => toggle(item.id)}
                            />
                        ))}
                    </div>
                </div>

            </Reveal>
        </section>
    );
}