import { db } from '@/database';
import { admins, apps, paymentChannels, payments } from '../schema';

(async function seed() {
    console.log("Seeding apps, payment channels, and payments...");

    const [admin] = await db.select().from(admins).limit(1);
    if (!admin) throw new Error("No admin found. Run the admin seeder first.");

    const appsData = [
        {
            name: "Storefront",
            slug: "storefront",
            description: "Online store checkout",
            color: "#6366F1",
            admin_id: admin.id,
            channel_name: "gcash" as const,
            label: "GCash",
            subtitle: "Send via GCash app",
            account_name: "Jan Liby Dela Costa",
            account_number: "0997 695 3621",
            amount: "1500.00",
            description_payment: "Order payment",
        },
        {
            name: "EZVote EMS",
            slug: "ezvote-ems",
            description: "Election management system",
            color: "#10B981",
            admin_id: admin.id,
            channel_name: "maribank" as const,
            label: "Maribank",
            subtitle: "Bank transfer / deposit",
            account_name: "JAN LIBY DELA COSTA",
            account_number: "0123 4567 8901",
            amount: "15000.00",
            description_payment: "Upgrade for Pro Plan subscription",
        },
        {
            name: "Ticket Hub",
            slug: "ticket-hub",
            description: "Event ticketing platform",
            color: "#F59E0B",
            admin_id: admin.id,
            channel_name: "gotyme" as const,
            label: "GoTyme",
            subtitle: "Bank transfer / QR",
            account_name: "Jan Liby Dela Costa",
            account_number: "021 234 5678 90",
            amount: "500.00",
            description_payment: "Event ticket purchase",
        },
    ];

    for (const appData of appsData) {
        const [app] = await db
            .insert(apps)
            .values({
                name: appData.name,
                slug: appData.slug,
                description: appData.description,
                color: appData.color,
                admin_id: appData.admin_id,
            })
            .returning({ id: apps.id });
        console.log("App created:", app);

        const [channel] = await db
            .insert(paymentChannels)
            .values({
                app_id: app.id,
                channel_name: appData.channel_name,
                label: appData.label,
                subtitle: appData.subtitle,
                account_name: appData.account_name,
                account_number: appData.account_number,
            })
            .returning({ id: paymentChannels.id });
        console.log("Payment channel created:", channel);

        const [payment] = await db
            .insert(payments)
            .values({
                app_id: app.id,
                payment_channel_id: channel.id,
                ref_no: `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                description: appData.description_payment,
                amount: appData.amount,
                currency: "PHP",
                proof_file_url: "https://example.com/proof.jpg",
                proof_file_type: "image",
                status: "pending",
            })
            .returning({ id: payments.id });
        console.log("Payment created:", payment);
    }
})();