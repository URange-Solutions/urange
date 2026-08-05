import Link from "next/link";
import { Button } from "../retro/button";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="bg-brand py-20 border-t-4 border-black">
            <Reveal className="mx-6 md:mx-24 flex flex-col md:flex-row items-center justify-between gap-8">
                <Text className="font-head text-3xl md:text-5xl text-white leading-tight uppercase max-w-2xl text-center md:text-left">
                    Your Business Deserves Better Software.
                </Text>
                <Link href="#contact" className="shrink-0">
                    <Button className="px-8 py-3 bg-white text-brand font-head tracking-widest hover:bg-black hover:text-white transition-colors">
                        LET'S MAKE ONE <ArrowRight className="h-4 w-4 ml-2 inline" />
                    </Button>
                </Link>
            </Reveal>
        </section>
    )
}