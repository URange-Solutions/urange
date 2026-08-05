import { Button } from "../retro/button";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";

export function Contact() {
    return (
        <section id="contact" className="py-24 bg-background border-t-4 border-black">
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
                                { label: "EMAIL", value: "urangesystems@proton.me" },
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

                    <form className="flex flex-col gap-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                                    NAME
                                </label>
                                <input
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
                            <select className="border-2 border-input px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-background text-black dark:text-white appearance-none">
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
                                rows={5}
                                placeholder="Describe the process idea or the problem you want us to solve, who it affects, and how often..."
                                className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                            />
                        </div>

                        <Button type="submit" className="py-3 font-head tracking-widest">
                            SEND MESSAGE
                        </Button>
                    </form>
                </div>
            </Reveal>
        </section>
    )
}