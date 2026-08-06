import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Reveal } from "../Reveal";

interface BlogContentProps {
  markdown: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-head text-black dark:text-white text-3xl md:text-4xl leading-tight mt-12 mb-5 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-head text-black dark:text-white text-2xl md:text-3xl leading-tight mt-12 mb-4 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-head text-black dark:text-white text-xl md:text-2xl leading-tight mt-10 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-head text-black dark:text-white text-lg leading-tight mt-8 mb-3">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-neutral-700 dark:text-neutral-300 text-base leading-relaxed mb-5">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="text-black dark:text-white font-semibold">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand pl-6 my-6 text-neutral-600 dark:text-neutral-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-neutral-300 dark:border-neutral-700 my-10" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-brand border-b border-brand hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => {
    if (!src || typeof src !== "string") return null;
    return (
      <span className="block relative my-8 aspect-video border-4 border-black dark:border-white">
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </span>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-4 text-sm leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ children }) => {

    const isBlock = String(children).includes("\n");
    if (isBlock) {
      return (
        <code className="font-mono text-sm text-neutral-800 dark:text-neutral-200">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-sm text-brand bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 px-1.5 py-0.5">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-neutral-300 dark:border-neutral-700">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="text-left font-head text-black dark:text-white text-xs tracking-widest uppercase px-3 py-2">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-neutral-700 dark:text-neutral-300 px-3 py-2 border-t border-neutral-200 dark:border-neutral-800">
      {children}
    </td>
  ),
};

export function BlogContent({ markdown }: BlogContentProps) {
  return (
    <section className="bg-background pb-16 md:pb-24">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="font-body max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </Reveal>
    </section>
  );
}