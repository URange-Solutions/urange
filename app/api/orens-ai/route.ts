import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type Role = "user" | "assistant" | "system";

interface ChatMessage {
    role: Role;
    content: string;
}

interface RequestBody {
    message: string;
    history?: ChatMessage[];
    finalize?: boolean;
    contactName?: string;
    contactEmail?: string;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const MAX_HISTORY_MESSAGES = 30;

const CONFIRM_PHRASE = "Submit Plan to URange Team";

const SYSTEM_PROMPT = `You are Orens AI, a systems-planning assistant in a client chat widget.

## Scope
You ONLY plan systems in three categories: Web Development, Mobile App Development, and IoT
(Internet of Things). If a client asks for something outside those three (desktop software, general
business advice, unrelated topics), say plainly that's outside what you plan and ask if their idea
fits Web, Mobile, or IoT instead. Don't discuss anything else.

You also handle basic computer/device troubleshooting (e.g. "my laptop won't turn on", "wifi keeps
disconnecting", "app keeps crashing"). This is a separate quick-help mode — see "Troubleshooting mode"
below. Detect which mode a message needs and switch accordingly.

You do not write code.

## Step 1 — Get a system overview first
Before asking any scoping questions, make sure you have a plain-language overview of what the client
actually wants to build: the general idea, the problem it solves, and roughly who it's for. If the
client's first message already gives you this (even briefly), don't ask for it again — move straight
to Step 2. If it's too vague to plan from (e.g. "I need an app" or "help me with a system"), your
very next reply must ask them to describe what they want to build in a sentence or two, in their own
words. This is a single open-ended question — no buttons or checkboxes block here, since there's no
fixed set of answers to offer.

Do not skip ahead to scoping questions, a flowchart, or a plan until you have this overview.

## Step 2 — Scoping questions
Once you have the overview, don't jump to a full plan on thin information — a plan built on guesses
doesn't serve the client. Ask scoping questions ONE AT A TIME, one per reply, never bundled, and keep
the conversation going for as many rounds as it genuinely takes to actually understand the business.
Cover: which platform (Web/Mobile/IoT — skip this if already obvious from the overview), who uses it,
what it needs to do day to day, rough scale/volume, any tools or systems they already use that this
needs to work alongside, and — for IoT — what physical devices/sensors are involved. There's no fixed
question cap — usually this lands around 3-6 questions, but keep going if an answer opens up something
new that's worth confirming (e.g. they mention staff roles you hadn't scoped, or a payment flow that
needs its own follow-up). Only stop once you could describe the system back to the client in your own
words and be confident nothing important is missing.

Be a conversational, proactive planner, not a rigid form. When something the client says implies a
feature or need they didn't explicitly ask for (e.g. a food ordering business usually benefits from
low-stock alerts, a booking system usually needs a cancellation/reschedule path, a delivery flow
usually needs rider assignment), surface that suggestion in plain language as part of the natural
back-and-forth and ask if they want it included — don't silently add it, and don't save all your
recommendations for the final plan. Keep offering relevant suggestions like this throughout scoping,
the way a consultant would in a real conversation, not just once at the end.

Once you're confident you have the full picture, move to the plan. If something is ambiguous,
conflicting, or a genuine risk, ask about THAT specific thing directly instead of guessing. Only fall
back to stating an assumption when the gap is truly minor.

## Tone — talk to a business owner, not a developer
The client is not technical. Explain everything in plain, everyday business language.
- Avoid dev jargon (API, backend, database schema, framework, endpoint, repository, deployment, etc.)
  unless the client used the term first. Say what it means for their business instead — e.g. instead
  of "REST API integration with the payment gateway," say "connects to your payment provider so
  customers can pay online directly."
- Every item in Requirements and Functions should read like something you'd explain to a shop owner,
  not a line from a tech spec sheet.
- It's fine to name a well-known tool or platform if it helps the client picture it (e.g. "hosted
  online, like a website"), but don't stack technical detail on top of it.
- Sound like a consultant talking with the client, not a script running through a checklist. It's fine
  to briefly react to what they said, explain why you're asking the next question, or note a
  recommendation, before moving on.

## What every plan must contain, in this priority order
1. **Flowchart — the most important part.** A clear, easy-to-follow flowchart of the full process, in
   plain business terms. See the rules below. Never skip this for a planning reply.
2. **Requirements**, split into two clearly labeled lists, described in plain terms (what it is and
   why it's needed, not the tech name):
   - **Software:** e.g. "a website customers can order from," "an admin dashboard for staff," "an
     online payment system," "a place to store customer records."
   - **Hardware:** physical things needed — devices, sensors, terminals, network equipment. Always
     required for IoT. For Web/Mobile, only list hardware that's genuinely relevant (e.g. a payment
     terminal, or using the phone's camera/GPS).
3. **Who it's for** — the people who'll use it, one line each, in plain roles (e.g. "Customers,"
   "Shop staff," "Owner/manager").
4. **What it does** — one or two plain sentences, no tech terms.
5. **Features list** — short, concrete bullets a client would recognize as things they asked for.
6. **Functions** — the core things the system does, in plain verbs (e.g. "takes orders," "sends a
   receipt," "alerts staff when stock is low").

Keep every section tight — bullets only, no filler paragraphs, and don't add sections beyond these six.

## Style
Short, direct, no filler, no jargon. Pick the single best recommendation, don't hedge or list options.

## Don't drag the conversation out — but don't push "submit" too early either
The confirm button ("Submit Plan to URange Team") must ONLY appear once the client has actually seen
the full plan and signaled they're happy with it. It must NEVER appear on the reply that first
presents a plan or a changed plan — the client hasn't had a chance to react yet.

Two-stage flow:
1. **First time you present a complete plan (or any time you present a changed plan):** end with a
   plain buttons block asking if it looks good — e.g. \`[{"label": "Looks Good", "value": "That looks
   good"}, {"label": "Change something", "value": "I'd like to change something"}]\`. Do NOT include
   the confirm button here, and don't ask them to submit yet.
2. **Once the client replies that they're happy** (clicks "Looks Good", says "yes"/"looks fine"/
   "proceed"/similar, with no new change requests) — THEN, and only then, reply with a short line
   confirming you'll lock it in, and end with a buttons block containing the confirm option using
   EXACTLY this label and value: {"label": "Submit Plan to URange Team", "value": "Submit Plan to URange Team"} 
   (plus at most one other option in case they change their mind, e.g. "Actually,
   change something"). Say in one short sentence that clicking it locks in the plan and notifies the
   URange team to start building.

If the client asks for a change at any point (even after seeing the confirm button), make the change
and go back to step 1 — show the updated plan and ask again if it looks good, without the confirm
button, before ever offering it again. Once confirmed, the plan is finalized and the team is
notified — don't re-ask unless they want a change.

## Flowchart — one standard, single-page diagram, plain language
Show the process as ONE simple, standard flowchart the client can read at a glance — not a technical
diagram. Follow these rules exactly:
- Always \`flowchart TD\` (straight top-to-bottom flow). Never left-right, never mixed directions.
- NO \`subgraph\` blocks. Subgraphs push the layout wide and make it wrap across multiple screens —
  just use plain boxes/diamonds in a single top-to-bottom column with occasional short side branches.
- Every connector is a plain straight arrow (\`-->\`). Never use curved, dotted, or thick-line arrows.
- Keep it to ONE page: roughly 8-14 steps total. Cover the real process — start, the main steps in
  order, the key decision point(s), and how it ends — but don't pad it with every possible edge case.
  Pick the ones that actually matter to the client.
- Every decision is a diamond with plain Yes/No (or similar plain) labels — no technical branch names.
- Node labels are short (2-5 words) and written the way you'd say them out loud to the client — no
  system/dev terms (e.g. "Order Confirmed", not "Status = CONFIRMED").
- If a step can fail or get rejected, show where it goes next — don't let it dead-end — but keep this
  to the one or two paths that actually matter, not every possible failure mode.
Example (matches the level of detail and layout to aim for):
\`\`\`mermaid
flowchart TD
    A[Customer Places Order] --> B[Order Received by Staff]
    B --> C{Payment Received?}
    C -->|Yes| D[Order Confirmed]
    C -->|No| E[Customer Notified to Pay]
    E --> B
    D --> F[Order Prepared]
    F --> G[Staff Marks Ready]
    G --> H{Delivery or Pickup?}
    H -->|Delivery| I[Rider Assigned]
    H -->|Pickup| J[Customer Notified to Collect]
    I --> K[Order Delivered]
    J --> K
    K --> L[Order Closed]
\`\`\`
Only skip the diagram when there is truly nothing procedural to show (e.g. a plain pricing answer),
or when you're in Troubleshooting mode (see below).

## Choosing between buttons and checkboxes — these are NOT interchangeable
As the system planner running this chat, every question you ask the client needs exactly ONE of:
a buttons block, a checkboxes block, or plain open text. Never both in the same reply, never the
wrong one for the question — picking the wrong one is a real bug the client will notice immediately
(e.g. a "which features do you want?" question MUST be checkboxes, never buttons). In practice, most
of your scoping questions will be checkboxes — features, devices, integrations, and pain points are
almost always multi-select in the real world, so don't fall back to buttons out of habit.

These two blocks behave completely differently for the client, not just visually:
- \`buttons\` (also accepted as \`choices\` — same thing, prefer \`buttons\`) → the client taps ONE
  option and it is sent immediately. Use this whenever the answer is a single value from a fixed set.
- \`checkboxes\` → the client can tap MULTIPLE options, nothing is sent until they press a separate
  "Confirm selection" button. Use this whenever more than one answer can genuinely apply at once —
  most importantly, ANY "which features / which of these do you want" question is checkboxes.

Decide with this test before writing the block:
**Can the client truthfully pick more than one at the same time?**
- No → single answer from a set (a size, yes/no, "which platform", "delivery or pickup", "Looks Good"
  vs "Change something", the final confirm step) → use \`buttons\`.
- Yes → several could genuinely apply together ("which features do you want?", "which devices/sensors
  are involved?", "which integrations do you need?", "which of these pain points do you have?", "who
  will use this?") → use \`checkboxes\`.
- Neither → free-form (the system overview question, a name, a description, an unbounded number) →
  plain text, no block.

If the question lists or implies more than one selectable option, treat that as a signal for
\`checkboxes\` — do not force it into buttons just because a client *could* pick only one. Only use
\`buttons\` when the question is genuinely single-answer by nature (yes/no, one platform, one size,
one plan-review action). When in doubt and the option list has 3 or more items, lean toward
\`checkboxes\` rather than buttons — a client stuck picking only one option when several legitimately
apply is the exact bug to avoid. Never emit a \`buttons\` block as a "safety net" alongside or after a
\`checkboxes\` block in the same reply — exactly one interactive block per reply, ever.

### Buttons
Non-confirm labels must be specific to what was just discussed — reference an actual role/step/word
the client used, not a generic stock label (e.g. "Add Landlord Approval", not "Add Approval Step").
Keep them 1-3 words, under ~24 characters, no full sentences. Text right before the buttons should
relate only to the buttons.
\`\`\`buttons
[{"label": "Looks Good", "value": "That looks good"}, {"label": "Add Landlord Approval", "value": "Add a landlord approval step to this"}]
\`\`\`
The confirm button ("Submit Plan to URange Team") is the one exception to the labeling rule above —
see the two-stage flow above for exactly when it's allowed to appear. Never include it alongside
"Looks Good" in the same buttons block; they belong to different stages. No more than 3 options.

### Checkboxes
Same JSON shape as buttons: an array of {"label", "value"} objects, 2-6 options, labels short and
specific to what was just discussed (not generic).
\`\`\`checkboxes
[{"label": "Loyalty Points", "value": "Loyalty Points"}, {"label": "SMS Alerts", "value": "SMS Alerts"}, {"label": "Delivery Tracking", "value": "Delivery Tracking"}]
\`\`\`

Default to including one of these blocks whenever there's a next step with a fixed set of likely
answers. Only skip both when the reply is a closed answer with nothing left to decide, or the
question is genuinely open-ended (see the free-form case above).

## Troubleshooting mode
If the client's message is a computer/device problem rather than a "build me a system" request,
switch modes entirely: skip the system overview, scoping questions, flowchart, and requirements
structure. Just give a short numbered list (3-6 steps), most-likely fix first, plain and direct. No
buttons or checkboxes block unless there's a genuine next branch worth offering (e.g. "Still not
working? / Fixed it" — as buttons, since that's a single choice). Don't try to turn a troubleshooting
question into a system plan.

## Pricing
If asked, give estimate in ₱ (PHP) matching their scope, and
say plainly it's a estimated and the actual is base on URange Team Developers:
- Small (single form/workflow, one role): ₱15,000–₱40,000
- Medium (a few modules, 2-3 roles, maybe one integration): ₱60,000–₱150,000
- Large (multiple modules, several roles, integrations): ₱200,000+`;

const PLAN_DRAFT_PROMPT = `You are Orens AI. The client has just confirmed they're happy with the plan
discussed in this conversation by clicking "Submit Plan to URange Team". Write the FINAL plan as a
clean Markdown document for a non-technical business owner — plain language throughout, no dev jargon
(unless the client used the term themselves). Cover ONLY the following, in this order:

- Title and a one-line summary of what's being built, in plain terms
- ONE standard, single-page Mermaid flowchart of the process. Same rules as during planning:
  \`flowchart TD\`, straight arrows only, no subgraphs, roughly 8-14 steps, plain everyday labels, one
  column top to bottom with short side branches for decisions. Do not turn this into a sprawling
  technical diagram.
- Requirements, split into two clearly labeled lists, described in plain terms (what it is and why
  it's needed, not the tech name): **Software** and **Hardware** (always include Hardware for IoT)
- Who it's for — the people who'll use it, one line each, in plain roles
- What it does — one or two plain sentences
- Features list — short, concrete bullets a client would recognize
- Functions — the core things the system does, in plain verbs
- Estimated scope tier (Small / Medium / Large) with the matching ₱ price range from the
  pricing rules already given to you, labeled clearly as a estimate not and actual price depends on URange Team Dev Team

Do NOT include a buttons block and do NOT ask any questions. This is the finalized document, not
another turn in the conversation.`;

const NOT_CONFIGURED_MESSAGE = [
    "**Orens AI isn't fully set up yet.**",
    "The server is missing an `OPENROUTER_API_KEY` environment variable. Add one from " +
        "[openrouter.ai/keys](https://openrouter.ai/keys) to `.env.local` (and your deployment env) to enable real responses.",
].join("\n\n");

const INTERACTIVE_BLOCK_RE = /```(?:buttons|choices|checkboxes|contact-form)\s*\n[\s\S]*?```/;
const FENCE_START_RE = /```(buttons|choices|checkboxes|contact-form)\b/;
const MERMAID_RE = /```mermaid[\s\S]*?```/i;

const APPROVAL_RE =
    /\b(looks good|looks fine|that('| i)s good|sounds good|proceed|approve[d]?|go ahead|^yes\b)/i;

function hasInteractiveBlock(text: string): boolean {
    return INTERACTIVE_BLOCK_RE.test(text);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
    return EMAIL_RE.test(email.trim());
}

function validateInteractiveBlock(
    textBeforeBlock: string,
    blockRaw: string,
    conversation: ChatMessage[]
): { block: string; needsCheckboxRepair: boolean } {
    const parsed = /^```([a-zA-Z-]+)\s*\n([\s\S]*?)\s*```$/.exec(blockRaw.trim());
    if (!parsed) return { block: blockRaw, needsCheckboxRepair: false };

    const blockType = parsed[1];
    if (blockType !== "buttons" && blockType !== "choices") {
        return { block: blockRaw, needsCheckboxRepair: false };
    }

    let items: { label?: string; value?: string }[];
    try {
        items = JSON.parse(parsed[2]);
    } catch {
        return { block: blockRaw, needsCheckboxRepair: false };
    }
    if (!Array.isArray(items)) return { block: blockRaw, needsCheckboxRepair: false };

    const isConfirmBlock = items.some((i) => i?.value === CONFIRM_PHRASE);
    const isLooksGoodStage = items.some(
        (i) => /looks good/i.test(i?.label ?? "") || /looks good/i.test(i?.value ?? "")
    );

    const hasFlowchartInThisReply = MERMAID_RE.test(textBeforeBlock);

    if (isConfirmBlock) {
        const hasFlowchartAnywhere =
            hasFlowchartInThisReply ||
            conversation.some((m) => m.role === "assistant" && MERMAID_RE.test(m.content));

        const lastUserMessage = [...conversation].reverse().find((m) => m.role === "user");
        const approved = !!lastUserMessage && APPROVAL_RE.test(lastUserMessage.content.trim());

        if (!hasFlowchartAnywhere || !approved) {
            console.warn(
                "Orens AI: dropped premature confirm button (no prior flowchart or client hasn't approved yet)."
            );
            return { block: "", needsCheckboxRepair: false };
        }
        return { block: blockRaw, needsCheckboxRepair: false };
    }

    if (isLooksGoodStage) {
        if (!hasFlowchartInThisReply) {
            console.warn(
                "Orens AI: dropped premature 'Looks Good' buttons — no flowchart/plan in this reply."
            );
            return { block: "", needsCheckboxRepair: false };
        }
        return { block: blockRaw, needsCheckboxRepair: false };
    }

    const questionText = textBeforeBlock.slice(-400).toLowerCase();
    const multiSelectSignal =
        /\b(which (features|devices|sensors|integrations|options|of these)|select all|choose any|any of the following|pick as many)\b/.test(
            questionText
        );
    if (items.length >= 3 && multiSelectSignal) {
        console.warn(
            "Orens AI: buttons block looked like a multi-select question — flagging for checkboxes repair."
        );
        return { block: blockRaw, needsCheckboxRepair: true };
    }

    return { block: blockRaw, needsCheckboxRepair: false };
}

async function openUpstreamStream(messages: ChatMessage[]): Promise<Response> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("NOT_CONFIGURED");
    }

    const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": "Orens AI",
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            temperature: 0.4,
            stream: true,
        }),
    });

    if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        console.error("OpenRouter error:", res.status, errText);
        throw new Error(`OpenRouter request failed with status ${res.status}`);
    }

    return res;
}

async function completeOnce(messages: ChatMessage[]): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
        const res = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "Orens AI",
            },
            body: JSON.stringify({ model: MODEL, messages, temperature: 0.2, stream: false }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        return typeof text === "string" ? text : null;
    } catch (err) {
        console.error("Orens AI completeOnce failed:", err);
        return null;
    }
}

async function repairButtonsToCheckboxes(
    conversation: ChatMessage[],
    replyTextSoFar: string
): Promise<string | null> {
    const repairMessages: ChatMessage[] = [
        ...conversation,
        { role: "assistant", content: replyTextSoFar },
        {
            role: "user",
            content:
                "The buttons block you just sent asked a question where more than one answer could " +
                "genuinely apply (e.g. features, devices/sensors, integrations). That must be a " +
                "```checkboxes\\n[...]\\n``` block instead, not buttons, so the client isn't forced to " +
                "pick only one. Resend ONLY the corrected block — a single ```checkboxes\\n[...]\\n``` " +
                "block with the same options, no other text.",
        },
    ];

    const text = await completeOnce(repairMessages);
    if (!text) return null;
    const match = /```checkboxes\s*\n[\s\S]*?```/.exec(text);
    return match ? match[0] : null;
}

async function repairMissingInteractiveBlock(
    conversation: ChatMessage[],
    replyText: string,
    droppedPrematureConfirmish: boolean = false
): Promise<string | null> {
    const instruction = droppedPrematureConfirmish
        ? "Your last reply tried to show a 'Looks Good / Change something' or confirm button, but " +
          "there is NOT yet a complete plan (with a flowchart) presented in this conversation, or the " +
          "client hasn't actually said the plan looks good yet. Do NOT use those buttons. Instead, " +
          "reply with ONLY ONE fenced block that continues the actual planning work at this point — " +
          "either a ```checkboxes\\n[...]\\n``` block for a multi-select scoping question, a " +
          "```buttons\\n[...]\\n``` block for a single-answer scoping question, or plain text with no " +
          "block if the next step is an open-ended question. Never include 'Looks Good' or 'Submit " +
          "Plan to URange Team' unless a full plan has genuinely already been shown and approved."
        : "You forgot the required interactive block on your last reply. Reply with ONLY ONE " +
          "fenced block — no other text — and pick the correct type using this test: if the " +
          "client could truthfully select more than one option at once (e.g. a 'which features " +
          "do you want' style question), use a ```checkboxes\\n[...]\\n``` block; otherwise, for a " +
          "single-answer question, use a ```buttons\\n[...]\\n``` block. Most scoping questions " +
          "about features, devices, sensors, or integrations are multi-select — default to " +
          'checkboxes for those. Only include the exact "Submit Plan to URange Team" confirm ' +
          "button (in a buttons block) if the client had ALREADY said the plan looked good before " +
          'your last reply; otherwise for a plan-review buttons block use plain options like ' +
          '"Looks Good" / "Change something". Do not include both a buttons block and a ' +
          "checkboxes block.";

    const repairMessages: ChatMessage[] = [
        ...conversation,
        { role: "assistant", content: replyText },
        { role: "user", content: instruction },
    ];

    const text = await completeOnce(repairMessages);
    if (!text || !hasInteractiveBlock(text)) return null;

    const match = INTERACTIVE_BLOCK_RE.exec(text);
    if (!match) return null;

    const { block: validated, needsCheckboxRepair } = validateInteractiveBlock(
        replyText,
        match[0],
        conversation
    );

    if (needsCheckboxRepair) {
        const fixed = await repairButtonsToCheckboxes(conversation, replyText);
        return fixed ?? null;
    }

    return validated || null;
}

function isFinalizeRequest(body: RequestBody, message: string): boolean {
    if (body.finalize === true) return true;
    return message.trim().toLowerCase() === CONFIRM_PHRASE.toLowerCase();
}

function logPlanDraft(entry: { id: string; createdAt: string; planText: string; name: string; email: string }): void {
    console.log(`\n===== Orens AI — Plan Draft Finalized =====`);
    console.log(`id:        ${entry.id}`);
    console.log(`createdAt: ${entry.createdAt}`);
    console.log(`name:      ${entry.name}`);
    console.log(`email:     ${entry.email}`);
    console.log(`--------------------------------------------`);
    console.log(entry.planText);
    console.log(`============================================\n`);
}

function buildDummyDraftLink(id: string): string {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.urange.tech";
    return `${base.replace(/\/$/, "")}/draft/orensplans/${id}`;
}

async function notifyURangeTeam(entry: {
    id: string;
    createdAt: string;
    planText: string;
    name: string;
    email: string;
}): Promise<void> {
    try {
        console.log(`\n----- URange team notified: new dev request -----`);
        console.log(`planId: ${entry.id}`);
        console.log(`createdAt: ${entry.createdAt}`);
        console.log(`client: ${entry.name} <${entry.email}>`);
        console.log(`---------------------------------------------------\n`);
    } catch (err) {
        console.error("Failed to notify URange team:", err);
    }
}

function requestContactInfo(errorMessage?: string): NextResponse {
    const lines = [
        errorMessage ?? "Great — before I lock this in, who should the URange team follow up with?",
        "",
        "```contact-form",
        JSON.stringify({ fields: ["name", "email"], submitLabel: "Confirm & Submit Plan" }),
        "```",
    ];

    return new NextResponse(lines.join("\n"), {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Needs-Contact": "true",
        },
    });
}

function streamChatReply(conversation: ChatMessage[]): NextResponse {
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            let replyText = "";
            let sentText = "";
            let flushedLength = 0;
            let heldFenceStart = -1;
            let droppedPrematureConfirmish = false;

            const flushUpTo = async (end: number, { validate }: { validate: boolean }) => {
                if (end <= flushedLength) return;
                const chunk = replyText.slice(flushedLength, end);
                if (validate) {
                    const textBeforeBlock = replyText.slice(0, flushedLength);
                    const { block: validated, needsCheckboxRepair } = validateInteractiveBlock(
                        textBeforeBlock,
                        chunk,
                        conversation
                    );

                    let finalBlock = validated;
                    if (needsCheckboxRepair) {
                        const fixed = await repairButtonsToCheckboxes(conversation, sentText);
                        if (fixed) finalBlock = fixed;
                    }

                    if (finalBlock) {
                        sentText += finalBlock;
                        controller.enqueue(encoder.encode(finalBlock));
                    } else if (validated === "" && !needsCheckboxRepair) {
                        droppedPrematureConfirmish = true;
                    }
                } else {
                    sentText += chunk;
                    controller.enqueue(encoder.encode(chunk));
                }
                flushedLength = end;
            };

            try {
                const upstream = await openUpstreamStream(conversation);
                await pumpSSEDeltas(upstream.body!, async (delta) => {
                    replyText += delta;

                    if (heldFenceStart === -1) {
                        const searchFrom = Math.max(flushedLength - 3, 0);
                        const fenceMatch = FENCE_START_RE.exec(replyText.slice(searchFrom));
                        if (fenceMatch) {
                            heldFenceStart = searchFrom + fenceMatch.index;
                            await flushUpTo(heldFenceStart, { validate: false });
                        } else {
                            await flushUpTo(Math.max(replyText.length - 12, flushedLength), { validate: false });
                        }
                    }

                    if (heldFenceStart !== -1) {
                        const heldBlockText = replyText.slice(heldFenceStart);
                        const closeMatch = /```([\s\S]*?)```/.exec(heldBlockText);
                        if (closeMatch) {
                            const blockEnd = heldFenceStart + closeMatch[0].length;
                            await flushUpTo(blockEnd, { validate: true });
                            heldFenceStart = -1;
                        }
                    }
                });

                await flushUpTo(replyText.length, { validate: false });

                if (!hasInteractiveBlock(sentText)) {
                    const repaired = await repairMissingInteractiveBlock(
                        conversation,
                        sentText,
                        droppedPrematureConfirmish
                    );
                    if (repaired) {
                        controller.enqueue(encoder.encode("\n\n" + repaired));
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.message === "NOT_CONFIGURED") {
                    controller.enqueue(encoder.encode(NOT_CONFIGURED_MESSAGE));
                } else {
                    console.error("Orens AI stream error:", err);
                    controller.enqueue(
                        encoder.encode(
                            "Sorry, I ran into an error reaching the planning assistant. Please try again in a moment."
                        )
                    );
                }
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}

async function pumpSSEDeltas(
    body: ReadableStream<Uint8Array>,
    onDelta: (text: string) => void | Promise<void>
): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
                const parsed = JSON.parse(data);
                const delta = parsed?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length > 0) {
                    await onDelta(delta);
                }
            } catch {

            }
        }
    }
}

function streamFinalizedPlan(conversation: ChatMessage[], name: string, email: string): NextResponse {
    const draftMessages: ChatMessage[] = [
        { role: "system", content: PLAN_DRAFT_PROMPT },
        ...conversation.filter((m) => m.role !== "system"),
    ];

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const draftLink = buildDummyDraftLink(id);
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            let planText = "";

            try {
                const upstream = await openUpstreamStream(draftMessages);
                await pumpSSEDeltas(upstream.body!, (delta) => {
                    planText += delta;
                    controller.enqueue(encoder.encode(delta));
                });
            } catch (err) {
                if (err instanceof Error && err.message === "NOT_CONFIGURED") {
                    controller.enqueue(encoder.encode(NOT_CONFIGURED_MESSAGE));
                } else {
                    console.error("Orens AI finalize stream error:", err);
                    controller.enqueue(
                        encoder.encode(
                            "Sorry, I ran into an error saving your plan draft. Please try confirming again."
                        )
                    );
                }
                controller.close();
                return;
            }

            try {
                logPlanDraft({ id, createdAt, planText, name, email });
            } catch (err) {
                console.error("Failed to log plan draft:", err);
            }
            await notifyURangeTeam({ id, createdAt, planText, name, email });

            const footer = [
                "",
                "---",
                `**Draft saved and the URange team has been notified.** They've received your plan and will ` +
                    `follow up with **${name}** at **${email}** on scoping the build. Here's your draft plan ` +
                    `link: ${draftLink}`,
            ].join("\n\n");

            controller.enqueue(encoder.encode(footer));
            controller.close();
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Plan-Id": id,
            "X-Draft-Link": draftLink,
        },
    });
}

export async function POST(req: NextRequest) {
    let body: RequestBody;

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
        return NextResponse.json({ error: "`message` is required" }, { status: 400 });
    }

    const conversation: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history
            .filter(
                (m): m is ChatMessage =>
                    !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
            )
            .slice(-MAX_HISTORY_MESSAGES),
    ];

    const lastMessage = conversation[conversation.length - 1];
    if (!lastMessage || lastMessage.role !== "user" || lastMessage.content !== message) {
        conversation.push({ role: "user", content: message });
    }

    if (isFinalizeRequest(body, message)) {
        const name = typeof body.contactName === "string" ? body.contactName.trim() : "";
        const email = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";

        if (!name || !email) {
            return requestContactInfo();
        }
        if (!isValidEmail(email)) {
            return requestContactInfo("That email doesn't look right — mind double-checking it?");
        }

        return streamFinalizedPlan(conversation, name, email);
    }

    return streamChatReply(conversation);
}

export async function GET() {
    return NextResponse.json({
        status: "ok",
        model: MODEL,
        note:
            "POST { message, history, finalize?, contactName?, contactEmail? } to stream a chat with Orens AI " +
            "(plain-text streamed response body). Finalize requests without contactName/contactEmail get a " +
            "contact-form marker block back instead of the plan.",
    });
}