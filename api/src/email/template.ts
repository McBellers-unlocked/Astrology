/**
 * Shared branded email template module.
 *
 * Every outbound Stellara email — nurture, welcome, password reset, newsletter —
 * uses these primitives so branding stays consistent.
 */

// ---- Constants ----

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://stellera.co';
const API_BASE = process.env.API_URL ?? 'https://api.stellera.co';
const LOGO_URL = `${FRONTEND_URL}/logo.png`;

// ---- Internal helpers ----

function unsubscribeUrl(userId: string): string {
  const token = Buffer.from(userId).toString('base64url');
  return `${API_BASE}/email/unsubscribe?token=${token}`;
}

function subscriberUnsubscribeUrl(subscriberId: string): string {
  const token = Buffer.from(subscriberId).toString('base64url');
  return `${API_BASE}/email/unsubscribe-subscriber?token=${token}`;
}

function preheaderHtml(text: string): string {
  // Hidden preheader text for email preview pane — padded with zero-width chars
  // so email clients don't pull body text into the preview.
  const padding = '&zwnj;&nbsp;'.repeat(80);
  return `<span style="display:none;font-size:1px;color:#050816;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${text}${padding}</span>`;
}

// ---- Exported primitives ----

export function ctaButton(text: string, href: string, options?: { variant?: 'primary' | 'gold' }): string {
  const variant = options?.variant ?? 'primary';
  const bg = variant === 'gold'
    ? 'background:#FBBF24;background:linear-gradient(135deg,#FBBF24,#f59e0b);'
    : 'background:#7C3AED;background:linear-gradient(135deg,#7C3AED,#6d28d9);';
  const textColor = variant === 'gold' ? '#050816' : '#ffffff';
  const weight = variant === 'gold' ? '700' : '600';

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr>
        <td align="center" style="${bg}border-radius:8px;">
          <a href="${href}" style="display:inline-block;padding:14px 32px;color:${textColor};font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:15px;font-weight:${weight};text-decoration:none;letter-spacing:0.3px;">${text} &rarr;</a>
        </td>
      </tr>
    </table>`;
}

export function infoBox(content: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background:linear-gradient(135deg,#f8f5ff,#ede9fe);border-left:4px solid #7C3AED;border-radius:8px;padding:20px 24px;">
          ${content}
        </td>
      </tr>
    </table>`;
}

export function goldDivider(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="height:1px;background:linear-gradient(90deg,transparent,#FBBF24,transparent);font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>`;
}

export function socialProofBlock(quote: string, attribution?: string): string {
  const attr = attribution
    ? `<p style="margin:8px 0 0;color:#a78bfa;font-size:12px;font-weight:600;">&mdash; ${attribution}</p>`
    : '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background:#050816;border-radius:8px;padding:20px 24px;text-align:center;">
          <p style="margin:0 0 4px;color:#FBBF24;font-size:18px;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
          <p style="margin:0;color:#e0dce8;font-style:italic;font-size:14px;line-height:1.5;">&ldquo;${quote}&rdquo;</p>
          ${attr}
        </td>
      </tr>
    </table>`;
}

// ---- Footer variants ----

export function userFooter(userId: string): string {
  return `<p style="margin:8px 0 0;color:#5255ab;font-size:11px;"><a href="${unsubscribeUrl(userId)}" style="color:#5255ab;text-decoration:underline;">Unsubscribe</a> from Stellara emails</p>`;
}

export function subscriberFooter(subscriberId: string): string {
  return `<p style="margin:8px 0 0;color:#5255ab;font-size:11px;"><a href="${subscriberUnsubscribeUrl(subscriberId)}" style="color:#5255ab;text-decoration:underline;">Unsubscribe</a> from Stellara emails</p>`;
}

export function transactionalFooter(): string {
  return `<p style="margin:8px 0 0;color:#5255ab;font-size:11px;">This is a transactional email from Stellara.</p>`;
}

// ---- Core branded wrapper ----

function brandedWrapper(content: string, options: {
  preheaderText?: string;
  footerHtml?: string;
}): string {
  const preheader = options.preheaderText ? preheaderHtml(options.preheaderText) : '';
  const footer = options.footerHtml ?? '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Stellara</title>
</head>
<body style="margin:0;padding:0;background-color:#f0eef6;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  ${preheader}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0eef6;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(5,8,22,0.12);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#050816;background-image:linear-gradient(135deg,#050816 0%,#0a0f2e 50%,#101640 100%);padding:32px 24px 24px;">
              <img src="${LOGO_URL}" alt="Stellara" width="140" style="display:block;max-width:140px;height:auto;" />
              <p style="margin:10px 0 0;color:#c4b5fd;font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:13px;letter-spacing:0.5px;">Your stars, decoded.</p>
            </td>
          </tr>

          <!-- GOLD DIVIDER -->
          <tr>
            <td style="background:linear-gradient(90deg,#FBBF24,#f59e0b,#FBBF24);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 32px 28px;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#1a1a2e;font-size:15px;line-height:1.65;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#050816;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 12px;color:#FBBF24;font-size:12px;letter-spacing:6px;">&#10022; &#10022; &#10022;</p>
              <p style="margin:0 0 8px;color:#c4b5fd;font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:13px;">
                Your stars, decoded. &mdash; <span style="color:#a78bfa;font-weight:600;">Stellara</span>
              </p>
              ${footer}
              <p style="margin:12px 0 0;color:#5255ab;font-size:11px;">
                <a href="${FRONTEND_URL}/horoscope" style="color:#5255ab;text-decoration:none;">Horoscopes</a> &nbsp;&middot;&nbsp;
                <a href="${FRONTEND_URL}/birth-chart" style="color:#5255ab;text-decoration:none;">Birth Chart</a> &nbsp;&middot;&nbsp;
                <a href="${FRONTEND_URL}/compatibility" style="color:#5255ab;text-decoration:none;">Compatibility</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---- Convenience wrappers ----

export function userEmailHtml(content: string, userId: string, preheaderText?: string): string {
  return brandedWrapper(content, { preheaderText, footerHtml: userFooter(userId) });
}

export function subscriberEmailHtml(content: string, subscriberId: string, preheaderText?: string): string {
  return brandedWrapper(content, { preheaderText, footerHtml: subscriberFooter(subscriberId) });
}

export function transactionalEmailHtml(content: string, preheaderText?: string): string {
  return brandedWrapper(content, { preheaderText, footerHtml: transactionalFooter() });
}
