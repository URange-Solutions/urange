import { db } from "@/database";
import { inboxMessages } from "../schema";

(async function seed() {
  console.log("Creating inbox messages...");

  await db.insert(inboxMessages).values([
    {
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      subject: "School Management System Inquiry",
      message:
        "Hello, I would like to know if your school management system supports online enrollment and student portals.",
    },
    {
      name: "Maria Santos",
      email: "maria.santos@example.com",
      subject: "Request for Demo",
      message:
        "Good day! We're interested in seeing a demo of your software for our organization. Please let us know your availability.",
    },
    {
      name: "John Reyes",
      email: "john.reyes@example.com",
      subject: "Pricing Information",
      message:
        "Can you send us your pricing plans for small schools with around 500 students?",
    },
    {
      name: "Angela Cruz",
      email: "angela.cruz@example.com",
      subject: "Technical Support",
      message:
        "We're experiencing an issue accessing the admin dashboard after updating our browser.",
      is_read: true,
    },
    {
      name: "Michael Garcia",
      email: "michael.garcia@example.com",
      subject: "Feature Suggestion",
      message:
        "It would be great if the system could support SMS notifications for parents.",
      is_read: true,
      is_replied: true,
      replied_at: new Date().toISOString(),
      reply_message:
        "Thank you for your suggestion! We'll include it in our product roadmap for review.",
    },
  ]);

  console.log("Inbox messages seeded successfully!");
  process.exit(0);
})().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});