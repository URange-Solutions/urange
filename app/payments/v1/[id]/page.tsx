'use client'

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Wallet,
  Landmark,
  Store,
} from "lucide-react";
import Image from "next/image";
import logo from '@/assets/logo-dark.png';

type ChannelId = "gcash" | "maribank" | "gotyme";

interface PaymentChannel {
  id: ChannelId;
  label: string;
  subtitle: string;
  accountName: string;
  accountNumber: string;
  accentClass: string;
  icon: typeof Wallet;
}

interface OrderDetails {
  merchant: string;
  description: string;
  amount: number;
  currency: string;
  refNo: string;
}

const ORDER: OrderDetails = {
  merchant: "Grid & Co. Studio",
  description: "Website Development — Phase 2 Deposit",
  amount: 15000,
  currency: "₱",
  refNo: "URP-84213-PH",
};

const CHANNELS: PaymentChannel[] = [
  {
    id: "gcash",
    label: "GCash",
    subtitle: "Send via GCash app",
    accountName: "Grid & Co. Studio",
    accountNumber: "0917 123 4567",
    accentClass: "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600",
    icon: Wallet,
  },
  {
    id: "maribank",
    label: "Maribank",
    subtitle: "Bank transfer / deposit",
    accountName: "Grid & Co. Studio Inc.",
    accountNumber: "0123 4567 8901",
    accentClass: "border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600",
    icon: Landmark,
  },
  {
    id: "gotyme",
    label: "GoTyme",
    subtitle: "Bank transfer / QR",
    accountName: "Grid & Co. Studio",
    accountNumber: "021 234 5678 90",
    accentClass: "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600",
    icon: Landmark,
  },
];

function formatAmount(n: number): string {
  return n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onCopy}
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
      </Button>
    </div>
  );
}

export default function URangePayCheckout() {
  const [submitted, setSubmitted] = useState(false);
  const [channelId, setChannelId] = useState<ChannelId>("gcash");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedChannel = CHANNELS.find((c) => c.id === channelId) ?? CHANNELS[0];

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    const okType = f.type.startsWith("image/") || f.type === "application/pdf";
    if (!okType) {
      setError("Please upload an image or PDF file.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("File is too large. Max 8MB.");
      return;
    }
    setError("");
    setFile(f);
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please attach your proof of payment.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  const previewUrl = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  if (submitted) {
    return (
      <div className="min-h-screen w-full bg-background sm:bg-muted/40 flex items-center justify-center py-4 px-4 sm:py-6">
        <div className="w-full max-w-xl sm:border sm:bg-background sm:rounded-xl sm:shadow-lg text-center p-4 md:p-10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">Payment Submitted</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {ORDER.merchant} will verify your {selectedChannel.label} payment and confirm your order shortly.
          </p>
          
          <div className="w-full max-w-xs bg-muted/50 rounded-lg p-4 text-left border mb-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
              Amount paid
            </p>
            <p className="font-bold text-xl text-foreground">
              {ORDER.currency}
              {formatAmount(ORDER.amount)}
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground max-w-xs">
            Payment processing takes 1–3 business days because it is manually reviewed. We'll send an email regarding your purchase status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background sm:bg-muted/40 flex items-center justify-center py-0 sm:py-6 sm:px-4">
      <div className="w-full max-w-xl sm:border sm:bg-background sm:rounded-xl sm:shadow-lg overflow-hidden">
        <header className="bg-primary text-primary-foreground space-y-3 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 opacity-90">
              <Image src={logo} alt="Logo dark" className="h-8 w-8" />
              <span className="text-md font-head tracking-wide">URange Pay</span>
            </div>
            <span className="text-[10px] bg-primary-foreground/10 px-2 py-0.5 rounded text-primary-foreground/90 font-mono">
              {ORDER.refNo}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-semibold text-sm md:text-base mb-0.5">
                <Store size={14} className="shrink-0 opacity-80" />
                <span className="truncate">{ORDER.merchant}</span>
              </div>
              <p className="text-xs text-primary-foreground/70 truncate max-w-[180px] sm:max-w-md">
                {ORDER.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider font-medium">Amount</p>
              <p className="font-bold text-md md:text-2xl leading-tight">
                {ORDER.currency}{formatAmount(ORDER.amount)}
              </p>
            </div>
          </div>
        </header>

        <div className="p-5 md:p-6">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  const isSelected = channelId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setChannelId(c.id);
                        setError("");
                      }}
                      className={`flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-1.5 p-3 rounded-xl border text-left sm:text-center transition-all ${
                        isSelected
                          ? `${c.accentClass} ring-2 ring-primary/20 font-medium`
                          : "bg-background hover:bg-muted/50 border-input"
                      }`}
                    >
                      <Icon size={16} className={isSelected ? "text-current" : "text-muted-foreground"} />
                      <div className="sm:space-y-0.5">
                        <p className="text-sm font-semibold leading-tight">{c.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Transfer exactly <span className="font-semibold text-foreground">{ORDER.currency}{formatAmount(ORDER.amount)}</span> to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CopyField label="Account name" value={selectedChannel.accountName} />
                <CopyField label="Account number" value={selectedChannel.accountNumber} />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                <Upload size={12} />
                Upload Proof of Payment
              </label>

              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
              />

              {!file ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e: DragEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`w-full rounded-xl px-4 py-6 md:py-8 flex flex-col items-center gap-2 text-center transition-colors border border-dashed ${
                    dragOver ? "bg-primary/5 border-primary" : "bg-muted/40 hover:bg-muted/70 border-input"
                  }`}
                >
                  <Upload size={18} className="text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium block text-foreground">Click or drag file here</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      JPG, PNG, PDF · up to 8MB
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full rounded-xl border bg-muted/30 p-4 flex flex-col items-center justify-center gap-3 relative text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => setFile(null)}
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </Button>

                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      <FileText size={24} className="text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 max-w-xs">
                    <p className="text-sm font-semibold truncate px-2">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

            <div className="space-y-3 pt-1">
              <Button type="submit" size="lg" className="w-full font-medium">
                Confirm Payment
              </Button>

              {/* Seamless processing status update info string */}
              <p className="text-[11px] text-muted-foreground/90 text-center leading-normal px-2">
                Payment processing takes 1–3 business days because it is manually reviewed. We'll send an email regarding your purchase status.
              </p>
            </div>

            <Separator className="my-2" />

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck size={12} />
              Payments are verified manually by the merchant
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}