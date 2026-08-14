import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/database";
import { payments, paymentChannels } from "@/database/schema";
import URangePayCheckout from "./CheckoutPage";

export default async function CheckoutPageWrapper({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;

    console.log(id)

    const payment = await db.query.payments.findFirst({
        where: eq(payments.ref_no, id),
        columns: {
            ref_no: true,
            amount: true,
            currency: true,
            description: true,
            status: true,
            app_id: true,
            payment_channel_id: true,
        },
        with: {
            app: {
                columns: {
                    name: true,
                    payments_success_url: true,
                    payments_failure_url: true
                },
            },
            paymentChannel: {
                columns: {
                    id: true,
                    channel_name: true,
                    label: true,
                    subtitle: true,
                    account_name: true,
                    account_number: true,
                },
            },
        },
    });

    if (!payment || !payment.app_id) {
        notFound();
    }

    const channels = await db.query.paymentChannels.findMany({
        where: and(
            eq(paymentChannels.app_id, payment.app_id),
            eq(paymentChannels.is_active, true)
        ),
        columns: {
            id: true,
            channel_name: true,
            label: true,
            subtitle: true,
            account_name: true,
            account_number: true,
        },
    });

    return (
        <URangePayCheckout
            order={{
                merchant: payment.app?.name ?? "Merchant",
                description: payment.description,
                amount: Number(payment.amount),
                currency: payment.currency,
                refNo: payment.ref_no,
                status: payment.status,
                payments_success_url: payment.app?.payments_success_url ?? "/",
                payments_failure_url: payment.app?.payments_failure_url ?? "/"
            }}
            channels={channels}
            defaultChannelId={payment.paymentChannel?.id ?? channels[0]?.id ?? null}
        />
    );
}