"use client";

import Image from "next/image";
import { useEffect, useRef, useState, FormEvent, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import logo from "@/assets/logo-dark.png";
import { Button } from "./ui/button";

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

export function FloatingChat() {
  const name = "Orens AI";
  const greeting = "Hey! I'm Orens AI. Ask me anything about our systems.";

  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
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
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
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

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isResizing || !resizeStart.current) return;
      const dx = resizeStart.current.x - e.clientX;
      const dy = resizeStart.current.y - e.clientY;
      const maxWidth = window.innerWidth - 48;
      const maxHeight = window.innerHeight - 48;
      const nextWidth = Math.min(Math.max(resizeStart.current.width + dx, MIN_WIDTH), maxWidth);
      const nextHeight = Math.min(Math.max(resizeStart.current.height + dy, MIN_HEIGHT), maxHeight);
      setDimensions({ width: nextWidth, height: nextHeight });
    }

    function handleMouseUp() {
      setIsResizing(false);
      resizeStart.current = null;
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  function handleResizeStart(e: React.MouseEvent) {
    if (isFullscreen) return;
    e.preventDefault();
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };
    setIsResizing(true);
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

  const panelStyle = isFullscreen
    ? undefined
    : { width: dimensions.width, height: dimensions.height };

  const panelClassName = isFullscreen
    ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none bg-white dark:bg-background border-0 shadow-none flex flex-col overflow-hidden"
    : "relative max-w-[90vw] max-h-[85vh] bg-white dark:bg-background border-2 border-border shadow-xl flex flex-col overflow-hidden";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className={panelClassName} style={panelStyle}>
          {!isFullscreen && (
            <div
              onMouseDown={handleResizeStart}
              className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-10"
            >
              <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-brand/70" />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 bg-card text-white px-4 py-3 shrink-0">
            <div className={`flex items-center gap-2 w-full ${isFullscreen ? "max-w-3xl mx-auto" : ""}`}>
              <Image src={logo} alt={"Logo dark"} className="h-10 w-10" />
              <div>
                <p className="font-head text-sm leading-none">{name}</p>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {loading ? "Typing..." : "AI System Planner"}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
                  className="p-1 hover:bg-white/20 transition-colors rounded"
                >
                  {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="p-1 hover:bg-white/20 transition-colors rounded"
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
                    className={`max-w-[85%] px-3 py-2 text-sm leading-snug ${m.role === "user"
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
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap gap-2">
                    {activePopup.options.map((opt, i) => {
                      const val = opt.value?.trim() ? opt.value : opt.label;
                      const isChecked = selectedCheckboxes.includes(val);
                      return (
                        <label
                          key={i}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs cursor-pointer border rounded select-none transition-colors ${
                            isChecked
                              ? "bg-brand text-white border-brand"
                              : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(val)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    disabled={loading || selectedCheckboxes.length === 0}
                    onClick={() => submitMessage(selectedCheckboxes.join(", "))}
                    className="self-start text-xs py-1 h-auto"
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
                        <input
                          type={field === "email" ? "email" : "text"}
                          required
                          value={formValues[field] || ""}
                          onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))}
                          className="text-xs px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none text-neutral-800 dark:text-neutral-100 rounded"
                          placeholder={`Enter your ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full text-xs py-1 h-auto">
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
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Orens AI..."
                className="flex-1 text-sm px-3 py-2 bg-neutral-100 dark:bg-neutral-800 outline-none text-neutral-800 dark:text-neutral-100"
              />
              <button
                type="submit"
                disabled={(!input.trim() && selectedCheckboxes.length === 0) || loading}
                aria-label="Send message"
                className="bg-brand text-white p-2.5 hover:bg-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="w-14 h-14 rounded-full bg-brand hover:bg-brand flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <CloseIcon className="w-6 h-6 text-white" /> : <Image src={logo} alt={"Logo dark"} className="h-10 w-10" />}
      </button>
    </div>
  );
}

export default FloatingChat;