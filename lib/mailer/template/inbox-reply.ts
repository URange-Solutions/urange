const LOGO_URL = "https://www.urange.tech/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-dark.3qr4r_tld5q7n.png&w=1080&q=75"
const BRAND_NAME = "URange Solutions"
const BRAND_COLOR = "#ff2600" 
const SITE_URL = "https://urange.tech"
const CONTACT_URL = "https://urange.tech/#contact" 

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

export function markdownToEmailHtml(raw: string): string {
    if (!raw) return ""
    let html = escapeHtml(raw)

    // inline code
    html = html.replace(
        /`([^`]+)`/g,
        '<code style="background:#f3f4f6;padding:2px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">$1</code>'
    )
    // bold
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // italic
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    // links
    html = html.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        `<a href="$2" style="color:${BRAND_COLOR};text-decoration:underline;" target="_blank" rel="noopener noreferrer">$1</a>`
    )
    // headers
    html = html.replace(/^### (.*)$/gm, '<h3 style="margin:16px 0 6px;font-size:15px;font-weight:600;">$1</h3>')
    html = html.replace(/^## (.*)$/gm, '<h2 style="margin:18px 0 8px;font-size:17px;font-weight:600;">$1</h2>')
    html = html.replace(/^# (.*)$/gm, '<h1 style="margin:20px 0 10px;font-size:20px;font-weight:700;">$1</h1>')
    // blockquotes
    html = html.replace(
        /^&gt; (.*)$/gm,
        '<blockquote style="margin:10px 0;padding:2px 0 2px 12px;border-left:3px solid #e5e7eb;color:#6b7280;font-style:italic;">$1</blockquote>'
    )
    // unordered list blocks
    html = html.replace(/(^|\n)((?:[-*] .*(?:\n|$))+)/g, (_match, lead: string, block: string) => {
        const items = block
            .trim()
            .split("\n")
            .map((line) => line.replace(/^[-*] /, "").trim())
            .filter(Boolean)
        return `${lead}<ul style="margin:8px 0;padding-left:20px;">${items
            .map((i) => `<li style="margin:2px 0;">${i}</li>`)
            .join("")}</ul>`
    })
    // paragraphs / line breaks (skip blocks that are already block-level HTML)
    html = html
        .split(/\n\n+/)
        .map((block) => {
            if (/^\s*<(h1|h2|h3|ul|blockquote)/.test(block)) return block
            return `<p style="margin:0 0 14px;line-height:1.6;">${block.replace(/\n/g, "<br/>")}</p>`
        })
        .join("")

    return html
}

interface ReplyEmailParams {
    toName: string
    originalSubject: string
    body: string // raw markdown, as typed in the admin reply box
}

export function buildReplyEmailHtml({ toName, originalSubject, body }: ReplyEmailParams): string {
    const bodyHtml = markdownToEmailHtml(body)
    const year = new Date().getFullYear()

    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reply to: ${escapeHtml(originalSubject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;">

            <!-- Header / logo -->
            <tr>
              <td style="background:${BRAND_COLOR};padding:20px 16px;text-align:left;">
                <img src="${LOGO_URL}" alt="${BRAND_NAME}" height="28" style="display:block;height:28px;width:auto;border:0;" />
                <h1 style="color:white;font-weight: bold;font-size: 20px;margin:8px 0 0;">${BRAND_NAME}</h1>
              </td>
            </tr>

            <!-- Subject / greeting -->
            <tr>
              <td style="padding:24px 16px 0;">
                <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Re: ${escapeHtml(originalSubject)}</p>
                <p style="margin:0 0 16px;font-size:16px;">Hi ${escapeHtml(toName)},</p>
              </td>
            </tr>

            <!-- Reply body (rendered markdown) -->
            <tr>
              <td style="padding:0 16px;font-size:15px;color:#1f2937;">
                ${bodyHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 16px 24px;">
                <p style="margin:0;font-size:14px;color:#374151;">— The ${BRAND_NAME} Team</p>
              </td>
            </tr>

            <!-- Follow-up CTA -->
            <tr>
              <td style="padding:0 16px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${BRAND_COLOR};">
                      <a href="${CONTACT_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                        Send us a new message
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding:16px;">
                <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                  This is a reply to a message you sent us through
                  <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:underline;">www.urange.tech</a>.
                </p>
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  This mailbox isn't monitored — if you have a follow-up, please
                  <a href="${CONTACT_URL}" style="color:#9ca3af;text-decoration:underline;">submit a new message on our site</a>
                  rather than replying to this email.
                </p>
                <p style="margin:12px 0 0;font-size:11px;color:#c1c5cb;">&copy; ${year} ${BRAND_NAME}. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim()
}


export function buildReplyEmailText({ toName, originalSubject, body }: ReplyEmailParams): string {
    return `Hi ${toName},\n\nRe: ${originalSubject}\n\n${body}\n\n— The ${BRAND_NAME} Team\n\nThis mailbox isn't monitored. For a follow-up, please submit a new message here: ${CONTACT_URL}`
}