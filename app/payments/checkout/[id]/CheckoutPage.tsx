'use client'

import { useRef, useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent } from "react";
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
    Loader2,
    Store,
} from "lucide-react";
import Image from "next/image";
import logo from '@/assets/logo-dark.png';
import { submitPaymentProof } from "@/actions/payment-actions";

type PaymentStatus = "unpaid" | "pending" | "approved" | "declined";

interface OrderData {
    merchant: string;
    description: string;
    amount: number;
    currency: string;
    refNo: string;
    status: PaymentStatus;
}

interface PaymentChannelData {
    id: string;
    channel_name: string;
    label: string;
    subtitle: string | null;
    account_name: string;
    account_number: string;
}

interface URangePayCheckoutProps {
    order: OrderData;
    channels: PaymentChannelData[];
    defaultChannelId: string | null;
}

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

export default function URangePayCheckout({ order, channels, defaultChannelId }: URangePayCheckoutProps) {
    const [submitted, setSubmitted] = useState(order.status !== "unpaid");
    const [channelId, setChannelId] = useState<string | null>(defaultChannelId ?? channels[0]?.id ?? null);
    const [file, setFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    const busy = isUploading || isPending;

    const selectedChannel = channels.find((c) => c.id === channelId) ?? channels[0];

    const uploadFile = async (f: File) => {
        setIsUploading(true);
        setUploadedUrl(null);

        try {
            const formData = new FormData();
            formData.append("file", f);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                setError(uploadData.message ?? "Upload failed. Please try again.");
                setFile(null);
                return;
            }

            setUploadedUrl(uploadData.url);
        } catch {
            setError("Upload failed. Please try again.");
            setFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFile = (f: File | null | undefined) => {
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            setError("Please upload an image file (JPG, PNG, etc).");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError("File is too large. Max 5MB.");
            return;
        }
        setError("");
        setFile(f);
        uploadFile(f);
    };

    const removeFile = () => {
        setFile(null);
        setUploadedUrl(null);
        setError("");
    };

    const onDrop = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !uploadedUrl) {
            setError("Please attach and wait for your proof of payment to finish uploading.");
            return;
        }
        if (!selectedChannel) {
            setError("Please select a payment channel.");
            return;
        }
        setError("");

        startTransition(async () => {
            const result = await submitPaymentProof({
                refNo: order.refNo,
                paymentChannelId: selectedChannel.id,
                proofFileUrl: uploadedUrl,
                proofFileType: file.type,
            });

            if (!result.success) {
                setError(result.error ?? "Something went wrong. Please try again.");
                return;
            }

            setSubmitted(true);
        });
    };

    const previewUrl = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

    if (submitted) {
        const isApproved = order.status === "approved";
        const isDeclined = order.status === "declined";

        return (
            <div className="min-h-screen w-full bg-background sm:bg-muted/40 flex items-center justify-center py-4 px-4 sm:py-6">
                <div className="w-full max-w-xl sm:border sm:bg-background sm:rounded-xl sm:shadow-lg text-center p-4 md:p-10 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <CheckCircle2 size={24} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight mb-2">
                        {isApproved ? "Payment Approved" : isDeclined ? "Payment Declined" : "Payment Submitted"}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {isApproved
                            ? `Your payment to ${order.merchant} has been confirmed.`
                            : isDeclined
                                ? `Your payment to ${order.merchant} could not be verified. Please contact support.`
                                : `${order.merchant} will verify your ${selectedChannel?.label ?? "payment"} and confirm your order shortly.`}
                    </p>

                    <div className="w-full max-w-xs bg-muted/50 rounded-lg p-4 text-left border mb-4">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                            Amount {isApproved ? "paid" : "due"}
                        </p>
                        <p className="font-bold text-xl text-foreground">
                            {order.currency}
                            {formatAmount(order.amount)}
                        </p>
                    </div>

                    {order.status === "pending" && (
                        <p className="text-xs text-muted-foreground max-w-xs mb-6">
                            Payment processing takes 1–3 business days because it is manually reviewed. We'll send an email regarding your purchase status.
                        </p>
                    )}

                    <Button type="button" size="lg" variant="outline" className="w-fit font-medium">
                        Go back to {order.merchant}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background sm:bg-muted/40 flex md:items-center justify-center py-0 sm:py-6 sm:px-4">
            <div className="w-full max-w-xl sm:border sm:bg-background sm:rounded-xl sm:shadow-lg overflow-hidden">
                <header className="bg-primary text-primary-foreground space-y-3 p-5 md:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 opacity-90">
                            <Image src={logo} alt="Logo dark" className="h-8 w-8" />
                            <span className="text-md font-head tracking-wide">URange Pay</span>
                        </div>
                        <span className="text-[10px] bg-primary-foreground/10 px-2 py-0.5 rounded text-primary-foreground/90 font-mono">
                            {order.refNo}
                        </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold text-sm md:text-base mb-0.5">
                                <Store size={14} className="shrink-0 opacity-80" />
                                <span className="truncate">{order.merchant}</span>
                            </div>
                            <p className="text-xs text-primary-foreground/70 truncate max-w-[200px] sm:max-w-md">
                                {order.description}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider font-medium">Amount</p>
                            <p className="font-bold text-md md:text-2xl leading-tight">
                                {order.currency}{formatAmount(order.amount)}
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
                                {channels.map((c) => {
                                    const isSelected = channelId === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setChannelId(c.id);
                                                setError("");
                                            }}
                                            disabled={busy}
                                            className={`flex items-center justify-center p-3 rounded-xl border text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isSelected
                                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium text-primary"
                                                    : "bg-background hover:bg-muted/50 border-input"
                                                }`}
                                        >
                                            <p className="text-sm font-semibold leading-tight">{c.label}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedChannel && (
                            <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                                <p className="text-xs text-muted-foreground font-medium mb-1">
                                    Transfer exactly <span className="font-semibold text-foreground">{order.currency}{formatAmount(order.amount)}</span> to:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <CopyField label="Account name" value={selectedChannel.account_name} />
                                    <CopyField label="Account number" value={selectedChannel.account_number} />
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                                <Upload size={12} />
                                Upload Proof of Payment
                            </label>

                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
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
                                    disabled={busy}
                                    className={`w-full rounded-xl px-4 py-6 md:py-8 flex flex-col items-center gap-2 text-center transition-colors border border-dashed disabled:opacity-50 disabled:cursor-not-allowed ${dragOver ? "bg-primary/5 border-primary" : "bg-muted/40 hover:bg-muted/70 border-input"
                                        }`}
                                >
                                    <Upload size={18} className="text-muted-foreground" />
                                    <div>
                                        <span className="text-sm font-medium block text-foreground">Click or drag image here</span>
                                        <span className="text-xs text-muted-foreground block mt-0.5">
                                            JPG, PNG, etc · up to 5MB
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
                                        onClick={removeFile}
                                        disabled={isUploading}
                                        aria-label="Remove file"
                                    >
                                        <X size={14} />
                                    </Button>

                                    <div className="relative w-24 h-24 shrink-0">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Receipt preview"
                                                className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg bg-background border flex items-center justify-center">
                                                <FileText size={24} className="text-primary" />
                                            </div>
                                        )}

                                        {isUploading && (
                                            <div className="absolute inset-0 rounded-lg bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1">
                                                <Loader2 size={18} className="text-primary animate-spin" />
                                                <span className="text-[9px] font-medium text-muted-foreground">Uploading…</span>
                                            </div>
                                        )}

                                        {!isUploading && uploadedUrl && (
                                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                                                <Check size={10} className="text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 max-w-xs">
                                        <p className="text-sm font-semibold truncate px-2">{file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isUploading
                                                ? "Uploading…"
                                                : uploadedUrl
                                                    ? "Uploaded"
                                                    : `${(file.size / 1024).toFixed(0)} KB`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

                        <div className="space-y-3 pt-1">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full font-medium"
                                disabled={busy || !uploadedUrl}
                            >
                                {isUploading ? "Uploading..." : isPending ? "Submitting..." : "Confirm Payment"}
                            </Button>

                            <p className="text-[11px] text-muted-foreground/90 text-center leading-normal px-2">
                                Payment processing takes 1–3 business days because it is manually reviewed. We'll send an email regarding your purchase status.
                            </p>
                        </div>

                        <Separator className="my-2" />

                        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                            <ShieldCheck size={12} />
                            Payments are verified manually by URange Team
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}