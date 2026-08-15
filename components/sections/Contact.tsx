"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "../retro/button";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";

export function Contact() {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [dialog, setDialog] = useState({
        open: false,
        title: "",
        description: "",
    });
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.subject.trim() ||
            !form.message.trim()
        ) {
            setDialog({
                open: true,
                title: "Missing Information",
                description: "Please complete all fields.",
            });
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            setDialog({
                open: true,
                title: "Message Sent",
                description:
                    "Thank you for contacting us. We'll get back to you as soon as possible.",
            });

            setForm({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            setDialog({
                open: true,
                title: "Unable to Send",
                description:
                    err instanceof Error
                        ? err.message
                        : "Something went wrong. Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-background">
            <Reveal className="mx-6 md:mx-24">
                <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
                    CONTACT
                </span>

                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div>
                        <Text className="font-head text-4xl md:text-5xl leading-tight mb-6 text-black dark:text-white">
                            GOT A PROBLEM WORTH <span className="text-brand">SOLVING?</span>
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 mb-8">
                            Tell us about it. We'll look at it honestly—if it's a good fit
                            we'll propose a system. If it's not, we'll say so and point you
                            in the right direction.
                        </Text>

                        <div className="flex flex-col gap-4">
                            {[
                                { label: "EMAIL", value: "contact@urange.tech" },
                                { label: "PHONE", value: "+63 924 477 2453" },
                                { label: "LOCATION", value: "Bulacan, Philippines" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-4 border-l-4 border-brand pl-4"
                                >
                                    <p className="font-head text-xs tracking-widest text-neutral-400 dark:text-neutral-500 w-20 shrink-0">
                                        {item.label}
                                    </p>
                                    <p className="text-neutral-800 dark:text-neutral-400">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                                    NAME
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Juan dela Cruz"
                                    className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                                    EMAIL
                                </label>
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    type="email"
                                    placeholder="juan@company.com"
                                    className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                                WHAT DO YOU WANT?
                            </label>
                            <select
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                className="border-2 border-input px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-background text-black dark:text-white appearance-none"
                            >
                                <option value="">Select a category</option>
                                <option>Web Development</option>
                                <option>Mobile Development</option>
                                <option>IoT and Arduinos</option>
                                <option>Consultation</option>
                                <option>Something else</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                                DETAILS
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Describe the process idea or the problem you want us to solve, who it affects, and how often..."
                                className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="py-3 font-head tracking-widest">
                            {loading ? "SENDING..." : "SEND MESSAGE"}
                        </Button>
                    </form>
                </div>
            </Reveal>
            <Dialog
                open={dialog.open}
                onOpenChange={(open) =>
                    setDialog((prev) => ({
                        ...prev,
                        open,
                    }))
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialog.title}</DialogTitle>
                        <DialogDescription>
                            {dialog.description}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </section>
    )
}