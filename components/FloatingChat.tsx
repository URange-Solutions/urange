"use client";

import Image from "next/image";
import { useEffect, useRef, useState, FormEvent, useId, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import logo from "@/assets/logo-dark.png";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

interface ChoiceOption {
  label: string;
  value?: string;
}

interface PopupData {
  type: "choice" | "checkbox" | "form";
  options?: ChoiceOption[];
  fields?: string[];
  submitLabel?: string;
  isContactForm?: boolean;
}

function SendIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20l16-8L4 4l0 6 10 2-10 2z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollapseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DragHandleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="6" r="1.4" fill="currentColor" />
      <circle cx="15" cy="6" r="1.4" fill="currentColor" />
      <circle cx="9" cy="12" r="1.4" fill="currentColor" />
      <circle cx="15" cy="12" r="1.4" fill="currentColor" />
      <circle cx="9" cy="18" r="1.4" fill="currentColor" />
      <circle cx="15" cy="18" r="1.4" fill="currentColor" />
    </svg>
  );
}

let mermaidInitialized = false;
function ensureMermaidInitialized() {
  if (mermaidInitialized || typeof window === "undefined") return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "neutral",
    fontFamily: "inherit",
    flowchart: {
      htmlLabels: true,
      useMaxWidth: false,
      nodeSpacing: 40,
      rankSpacing: 50,
    },
    themeVariables: {
      fontSize: "14px",
    },
  });
  mermaidInitialized = true;
}

function MermaidDiagram({
  chart,
  onRendered,
}: {
  chart: string;
  onRendered?: () => void;
}) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureMermaidInitialized();

    const id = `mermaid-${reactId.replace(/[:]/g, "")}`;

    mermaid
      .parse(chart, { suppressErrors: true })
      .then((isValid) => {
        if (!isValid) {
          throw new Error("Invalid mermaid syntax");
        }
        return mermaid.render(id, chart);
      })
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
          onRendered?.();
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (error) {
    return (
      <div className="my-2 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-2 text-xs">
        <p className="text-red-500 mb-1">Couldn't render diagram: {error}</p>
        <pre className="whitespace-pre-wrap text-neutral-500 dark:text-neutral-400">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-2 flex justify-center overflow-x-auto bg-white dark:bg-neutral-900 border border-brand dark:border-brand/60 p-2 [&_svg]:max-w-none"
    />
  );
}

function MessageContent({
  content,
  onMermaidRendered,
}: {
  content: string;
  onMermaidRendered?: () => void;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        a: ({ children, href }) => (
         <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const isBlock = Boolean(match);
          const raw = String(children).replace(/\n$/, "");

          if (isBlock && match?.[1] === "mermaid") {
            return <MermaidDiagram chart={raw} onRendered={onMermaidRendered} />;
          }

          // Interactive blocks (buttons/choices/checkboxes/contact-form/json) are parsed
          // separately into the popup UI below the message — never rendered as raw code.
          if (
            isBlock &&
            (match?.[1] === "buttons" ||
              match?.[1] === "choices" ||
              match?.[1] === "checkboxes" ||
              match?.[1] === "contact-form" ||
              match?.[1] === "json")
          ) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.fields || Array.isArray(parsed)) {
                return null;
              }
            } catch {}
          }

          if (isBlock) {
            return (
              <pre className="my-2 overflow-x-auto bg-neutral-900 text-neutral-100 p-2 text-xs">
                <code className={className} {...props}>
                  {raw}
                </code>
              </pre>
            );
          }

          return (
            <code
              className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 text-[0.85em]"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/**
 * FIX: this used to check choiceRegex (buttons/choices) FIRST, unconditionally, before
 * checkboxRegex. If a reply ever contained both a checkboxes block AND a buttons block —
 * which could happen server-side if a repair step appended a second block — the buttons
 * block always won, even though it appeared later in the text and the checkboxes block was
 * the one the model actually meant as the live question (e.g. "which features do you want?").
 *
 * Now we find every recognized interactive block in the content in one pass, in the order
 * they actually appear, and use the LAST one. In the normal case there's only ever one block,
 * so behavior is unchanged. In the degenerate case where two exist, we now trust whichever
 * block comes last in the message (the most recently written / final prompt to the client)
 * instead of silently always preferring buttons.
 */
function parsePopupFromContent(content: string): PopupData | null {
  const blockRegex = /```(buttons|choices|checkboxes|contact-form|json)\n([\s\S]*?)\n```/g;

  let lastPopup: PopupData | null = null;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    const kind = match[1];
    const raw = match[2];

    try {
      const parsed = JSON.parse(raw);

      if (kind === "buttons" || kind === "choices") {
        if (Array.isArray(parsed)) {
          lastPopup = {
            type: "choice",
            options: parsed.filter(
              (b): b is ChoiceOption => b && typeof b.label === "string"
            ),
          };
        }
        continue;
      }

      if (kind === "checkboxes") {
        if (Array.isArray(parsed)) {
          lastPopup = {
            type: "checkbox",
            options: parsed.filter(
              (b): b is ChoiceOption => b && typeof b.label === "string"
            ),
          };
        }
        continue;
      }

      if (kind === "contact-form") {
        if (parsed && Array.isArray(parsed.fields)) {
          lastPopup = {
            type: "form",
            fields: parsed.fields,
            submitLabel: parsed.submitLabel || "Submit",
            isContactForm: true,
          };
        }
        continue;
      }

      if (kind === "json") {
        if (parsed && Array.isArray(parsed.fields)) {
          lastPopup = {
            type: "form",
            fields: parsed.fields,
            submitLabel: parsed.submitLabel || "Submit",
          };
        }
        continue;
      }
    } catch {
      // Malformed block — skip it, keep whatever we already found.
    }
  }

  return lastPopup;
}

async function streamFromOrensAI(
  message: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void,
  extra: Record<string, unknown> = {}
): Promise<void> {
  const res = await fetch("/api/orens-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, ...extra }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }
}

const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 460;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 360;
const MOBILE_BREAKPOINT = 640;
const VIEWPORT_MARGIN = 16;

type Position = { left: number; top: number } | null;
type ResizeDir = { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(max, min));
}

export function FloatingChat() {
  const name = "Orens AI";
  const greeting = "Hey! I'm Orens AI. Ask me anything about our systems.";

  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [position, setPosition] = useState<Position>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeStart = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
    dir: ResizeDir;
  } | null>(null);
  const dragStart = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const userToggledFullscreen = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Clamp default panel size to the viewport, and auto-fullscreen on small
  // screens the first time the panel is opened so it doesn't overflow.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile && !userToggledFullscreen.current) {
      setIsFullscreen(true);
    }

    setDimensions((prev) => ({
      width: Math.min(prev.width, window.innerWidth - VIEWPORT_MARGIN * 2),
      height: Math.min(prev.height, window.innerHeight - VIEWPORT_MARGIN * 2),
    }));
  }, [open]);

  const clampPosition = useCallback((left: number, top: number, width: number, height: number) => {
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
    return {
      left: Math.min(Math.max(left, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN)),
      top: Math.min(Math.max(top, VIEWPORT_MARGIN), Math.max(maxTop, VIEWPORT_MARGIN)),
    };
  }, []);

  // Re-clamp the dragged/resized position on viewport resize so the panel
  // never gets stranded off-screen (e.g. rotating a phone).
  useEffect(() => {
    function handleWindowResize() {
      setPosition((prev) => {
        if (!prev) return prev;
        return clampPosition(prev.left, prev.top, dimensions.width, dimensions.height);
      });
      setDimensions((prev) => ({
        width: Math.min(prev.width, window.innerWidth - VIEWPORT_MARGIN * 2),
        height: Math.min(prev.height, window.innerHeight - VIEWPORT_MARGIN * 2),
      }));
    }
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [clampPosition, dimensions.width, dimensions.height]);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (isResizing && resizeStart.current) {
        const { x, y, width, height, left, top, dir } = resizeStart.current;
        const dx = e.clientX - x;
        const dy = e.clientY - y;
        const maxWidth = window.innerWidth - VIEWPORT_MARGIN * 2;
        const maxHeight = window.innerHeight - VIEWPORT_MARGIN * 2;

        let nextWidth = width;
        let nextHeight = height;
        let nextLeft = left;
        let nextTop = top;

        if (dir.right) {
          nextWidth = clamp(width + dx, MIN_WIDTH, maxWidth);
        } else if (dir.left) {
          nextWidth = clamp(width - dx, MIN_WIDTH, maxWidth);
          nextLeft = left + (width - nextWidth);
        }

        if (dir.bottom) {
          nextHeight = clamp(height + dy, MIN_HEIGHT, maxHeight);
        } else if (dir.top) {
          nextHeight = clamp(height - dy, MIN_HEIGHT, maxHeight);
          nextTop = top + (height - nextHeight);
        }

        setDimensions({ width: nextWidth, height: nextHeight });
        setPosition(clampPosition(nextLeft, nextTop, nextWidth, nextHeight));
        return;
      }

      if (isDragging && dragStart.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const nextLeft = dragStart.current.left + dx;
        const nextTop = dragStart.current.top + dy;
        setPosition(clampPosition(nextLeft, nextTop, dimensions.width, dimensions.height));
      }
    }

    function handlePointerUp() {
      setIsResizing(false);
      setIsDragging(false);
      resizeStart.current = null;
      dragStart.current = null;
    }

    if (isResizing || isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isResizing, isDragging, dimensions.width, dimensions.height, clampPosition]);

  function makeResizeHandler(dir: ResizeDir) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!panelRef.current) return;

      // Resizing (from any edge) while fullscreen drops out of fullscreen into
      // a normal, positioned window sized to match what's currently on screen,
      // so the drag continues from exactly where the user grabbed it.
      const rect = panelRef.current.getBoundingClientRect();
      if (isFullscreen) {
        userToggledFullscreen.current = true;
        setIsFullscreen(false);
      }
      setDimensions({ width: rect.width, height: rect.height });
      setPosition({ left: rect.left, top: rect.top });

      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        dir,
      };
      setIsResizing(true);
    };
  }

  function handleDragStart(e: React.PointerEvent) {
    if (isFullscreen) return;
    // Ignore drags started on interactive elements in the header.
    if ((e.target as HTMLElement).closest("button")) return;
    if (!panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    dragStart.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
    setPosition({ left: rect.left, top: rect.top });
    setIsDragging(true);
  }

  function toggleFullscreen() {
    userToggledFullscreen.current = true;
    setIsFullscreen((prev) => !prev);
  }

  function handleMermaidRendered() {
    if (!userToggledFullscreen.current) {
      setIsFullscreen(true);
    }
  }

  function appendToLastMessage(chunk: string) {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, content: last.content + chunk };
      return updated;
    });
  }

  async function submitMessage(text: string, extra: Record<string, unknown> = {}) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setSelectedCheckboxes([]);
    setFormValues({});
    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      await streamFromOrensAI(trimmed, nextHistory, appendToLastMessage, extra);
    } catch (err) {
      setError("Couldn't reach Orens AI. Try again.");
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (selectedCheckboxes.length > 0) {
      const combinedText = selectedCheckboxes.join(", ") + (input.trim() ? ` - ${input.trim()}` : "");
      submitMessage(combinedText);
    } else {
      submitMessage(input);
    }
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activePopup || !activePopup.fields) return;

    if (activePopup.isContactForm) {
      const contactName = (formValues["name"] || "").trim();
      const contactEmail = (formValues["email"] || "").trim();
      submitMessage(`${contactName} <${contactEmail}>`, {
        finalize: true,
        contactName,
        contactEmail,
      });
      return;
    }

    const outputParts = activePopup.fields.map((f) => `${f}: ${formValues[f] || ""}`);
    const combinedText = outputParts.join(", ");
    submitMessage(combinedText);
  }

  function handleCheckboxToggle(value: string) {
    setSelectedCheckboxes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  const lastMessage = messages[messages.length - 1];
  const isAwaitingFirstChunk = loading && lastMessage?.role === "assistant" && lastMessage.content === "";

  const activePopup =
    !loading && lastMessage?.role === "assistant"
      ? parsePopupFromContent(lastMessage.content)
      : null;

  // Responsive sizing: on small screens the panel fills the viewport (minus a
  // margin) instead of using the fixed desktop default so it never overflows.
  // `100dvh`/`100dvw` (with a `100vh`/`100vw` fallback via calc's min()) track the
  // real visible viewport on mobile browsers, so nothing gets clipped behind the
  // address/tab bar the way plain `100vh` does.
  const panelStyle: React.CSSProperties = isFullscreen
    ? {}
    : {
        width: `min(${dimensions.width}px, calc(100vw - ${VIEWPORT_MARGIN * 2}px))`,
        height: `min(${dimensions.height}px, calc(100dvh - ${VIEWPORT_MARGIN * 2}px))`,
        ...(position
          ? { left: position.left, top: position.top, right: "auto", bottom: "auto", transform: "none" }
          : {}),
      };

  // Default (undragged, non-fullscreen) position is centered horizontally with
  // a small bottom margin, like ChatGPT's floating panel, rather than pinned
  // to a corner. Once the user drags it, explicit left/top from `position` takes over.
  const panelClassName = isFullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-background border-0 shadow-none flex flex-col overflow-hidden"
    : `fixed z-50 flex flex-col overflow-hidden bg-white dark:bg-background border-2 border-border shadow-xl ${
        position ? "" : "bottom-6 left-1/2 -translate-x-1/2"
      }`;

  const resizeHandleClass = "absolute z-10 touch-none";

  return (
    <>
      {open && (
        <div ref={panelRef} className={panelClassName} style={panelStyle}>
          {/* Edge handles — grabbing any of these while fullscreen drops out of
              fullscreen into a normal window sized to fill in from that edge. */}
          <div
            onPointerDown={makeResizeHandler({ top: true })}
            className={`${resizeHandleClass} top-0 left-3 right-3 h-1.5 cursor-ns-resize`}
          />
          <div
            onPointerDown={makeResizeHandler({ bottom: true })}
            className={`${resizeHandleClass} bottom-0 left-3 right-3 h-1.5 cursor-ns-resize`}
          />
          <div
            onPointerDown={makeResizeHandler({ left: true })}
            className={`${resizeHandleClass} left-0 top-3 bottom-3 w-1.5 cursor-ew-resize`}
          />
          <div
            onPointerDown={makeResizeHandler({ right: true })}
            className={`${resizeHandleClass} right-0 top-3 bottom-3 w-1.5 cursor-ew-resize`}
          />
          {/* Corner handles */}
          <div
            onPointerDown={makeResizeHandler({ top: true, left: true })}
            className={`${resizeHandleClass} top-0 left-0 w-3.5 h-3.5 cursor-nwse-resize`}
          >
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-brand/70" />
          </div>
          <div
            onPointerDown={makeResizeHandler({ top: true, right: true })}
            className={`${resizeHandleClass} top-0 right-0 w-3.5 h-3.5 cursor-nesw-resize`}
          />
          <div
            onPointerDown={makeResizeHandler({ bottom: true, left: true })}
            className={`${resizeHandleClass} bottom-0 left-0 w-3.5 h-3.5 cursor-nesw-resize`}
          />
          <div
            onPointerDown={makeResizeHandler({ bottom: true, right: true })}
            className={`${resizeHandleClass} bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize`}
          />

          <div
            onPointerDown={handleDragStart}
            className={`flex items-center justify-between gap-2 bg-card text-white px-4 py-3 shrink-0 select-none ${
              isFullscreen ? "" : `touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`
            }`}
          >
            <div className={`flex items-center gap-2 w-full ${isFullscreen ? "max-w-3xl mx-auto" : ""}`}>
              {!isFullscreen && (
                <DragHandleIcon className="w-3.5 h-3.5 text-white/50 shrink-0 hidden sm:block" />
              )}
              <Image src={logo} alt={"Logo dark"} className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" />
              <div className="min-w-0">
                <p className="font-head text-sm leading-none truncate">{name}</p>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {loading ? "Typing..." : "AI System Planner"}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
                  className="p-1.5 hover:bg-white/20 transition-colors rounded"
                >
                  {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="p-1.5 hover:bg-white/20 transition-colors rounded"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 bg-neutral-50 dark:bg-neutral-950"
          >
            <div className={`flex flex-col gap-2 ${isFullscreen ? "max-w-3xl mx-auto" : ""}`}>
              {messages.map((m, idx) => {
                const isStreamingPlaceholder =
                  idx === messages.length - 1 &&
                  m.role === "assistant" &&
                  loading &&
                  m.content === "";

                if (isStreamingPlaceholder) return null;

                return (
                  <div
                    key={idx}
                    className={`max-w-[88%] sm:max-w-[85%] px-3 py-2 text-sm leading-snug ${m.role === "user"
                        ? "self-end bg-brand text-white whitespace-pre-wrap"
                        : "self-start bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
                      }`}
                  >
                    {m.role === "assistant" ? (
                      <MessageContent
                        content={m.content}
                        onMermaidRendered={handleMermaidRendered}
                      />
                    ) : (
                      m.content
                    )}
                  </div>
                );
              })}
              {isAwaitingFirstChunk && (
                <div className="self-start bg-white dark:bg-neutral-800 border border-brand dark:border-brand px-3 py-2 text-sm text-neutral-400 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" />
                </div>
              )}
              {error && (
                <p className="text-xs text-red-500 self-center">{error}</p>
              )}
            </div>
          </div>

          {activePopup && (
            <div className={`px-3 py-2 border-t border-border bg-neutral-100 dark:bg-neutral-900 shrink-0 ${isFullscreen ? "max-w-3xl w-full mx-auto" : ""}`}>
              {activePopup.type === "choice" && activePopup.options && (
                <div className="flex flex-wrap gap-1.5">
                  {activePopup.options.map((btn, i) => {
                    const val = btn.value?.trim() ? btn.value : btn.label;
                    return (
                      <Button
                        key={i}
                        type="button"
                        size="sm"
                        disabled={loading}
                        onClick={() => submitMessage(val)}
                      >
                        {btn.label}
                      </Button>
                    );
                  })}
                </div>
              )}

              {activePopup.type === "checkbox" && activePopup.options && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {activePopup.options.map((opt, i) => {
                      const val = opt.value?.trim() ? opt.value : opt.label;
                      const isChecked = selectedCheckboxes.includes(val);
                      return (
                        <label
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs cursor-pointer select-none text-neutral-800 dark:text-neutral-200"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleCheckboxToggle(val)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={loading || selectedCheckboxes.length === 0}
                    onClick={() => submitMessage(selectedCheckboxes.join(", "))}
                    className="self-start"
                  >
                    Confirm selection
                  </Button>
                </div>
              )}

              {activePopup.type === "form" && activePopup.fields && (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1.5">
                    {activePopup.fields.map((field, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <label className="text-xs font-semibold capitalize text-neutral-600 dark:text-neutral-400">
                          {field}
                        </label>
                        <Input
                          type={field === "email" ? "email" : "text"}
                          required
                          value={formValues[field] || ""}
                          onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))}
                          className="text-xs h-8"
                          placeholder={`Enter your ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                  <Button type="submit" size="sm" disabled={loading} className="w-full">
                    {activePopup.submitLabel}
                  </Button>
                </form>
              )}
            </div>
          )}

          {(!activePopup || activePopup.type !== "form") && (
            <form
              onSubmit={handleSend}
              className={`flex items-center gap-2 border-t-2 border-border p-2 bg-white dark:bg-card shrink-0 ${isFullscreen ? "max-w-3xl w-full mx-auto" : ""
                }`}
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Orens AI..."
                className="flex-1 text-sm bg-neutral-100 dark:bg-neutral-800 border-0"
              />
              <button
                type="submit"
                disabled={(!input.trim() && selectedCheckboxes.length === 0) || loading}
                aria-label="Send message"
                className="bg-brand text-white p-2.5 hover:bg-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <SendIcon />
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-brand hover:bg-brand flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <CloseIcon className="w-6 h-6 text-white" /> : <Image src={logo} alt={"Logo dark"} className="h-10 w-10" />}
      </button>
    </>
  );
}

export default FloatingChat;