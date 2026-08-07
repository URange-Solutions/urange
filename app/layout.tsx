import type { Metadata } from "next";
import { Archivo_Black, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";

const geistMonoHeading = Geist_Mono({ subsets: ['latin'], variable: '--font-heading' });

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL("https://urange.tech"),

  title: {
    default: "URange Solutions — Turning Visible Problems Into Systems",
    template: "%s | URange Solutions",
  },

  description:
    "URange Solutions builds practical web, mobile, and custom software that transforms visible business problems into efficient digital systems.",

  applicationName: "URange Solutions",

  keywords: [
    "software development",
    "web development",
    "custom software",
    "digital transformation",
    "school systems",
    "enrollment system",
    "election management",
    "Philippines",
    "URange Solutions",
  ],

  authors: [
    {
      name: "URange Solutions",
    },
  ],

  creator: "URange Solutions",
  publisher: "URange Solutions",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  openGraph: {
    title: "URange Solutions — Turning Visible Problems Into Systems",
    description:
      "We create practical digital solutions that simplify real-world processes through modern software development.",
    url: "https://urange.tech",
    siteName: "URange Solutions",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "URange Solutions",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "URange Solutions",
    description:
      "Turning Visible Problems Into Systems.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full scroll-smooth", "antialiased", archivoBlack.variable, "font-sans", geist.variable, geistMonoHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="#ff2600"
          height={3}
          showSpinner={false}
          easing="ease"
          crawl={true}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
