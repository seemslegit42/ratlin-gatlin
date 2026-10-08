/**
 * Renders `EmailTemplateDocument` blocks to responsive HTML for preview and export.
 */

import type { EmailBlock, EmailLayoutPreset, EmailTemplateDocument } from './emailCampaignTypes.js';

const maxWidth: Record<EmailLayoutPreset, string> = {
  narrow: '480px',
  standard: '600px',
  wide: '680px',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBlock(block: EmailBlock): string {
  switch (block.type) {
    case 'hero':
      return `
        <tr><td style="padding:28px 20px;text-align:${block.align};background:linear-gradient(135deg,#1a1030,#0f172a);border-radius:12px;">
          <h1 style="margin:0 0 8px;font-family:'Comfortaa',cursive;font-size:26px;line-height:1.2;color:#f8fafc;">${escapeHtml(block.headline)}</h1>
          <p style="margin:0;font-family:'Lexend',sans-serif;font-size:15px;line-height:1.5;color:#cbd5e1;">${escapeHtml(block.subline)}</p>
        </td></tr>`;
    case 'text':
      return `
        <tr><td style="padding:16px 4px;text-align:${block.align};">
          <p style="margin:0;font-family:'Lexend',sans-serif;font-size:15px;line-height:1.6;color:#e2e8f0;">${escapeHtml(block.body).replace(/\n/g, '<br/>')}</p>
        </td></tr>`;
    case 'button':
      return `
        <tr><td style="padding:16px 4px;text-align:center;">
          <a href="${escapeHtml(block.href)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(90deg,#14b8a6,#a855f7);color:#0b1020;font-weight:700;font-family:'Lexend',sans-serif;text-decoration:none;">${escapeHtml(block.label)}</a>
        </td></tr>`;
    case 'image':
      return `
        <tr><td style="padding:12px 4px;text-align:center;">
          <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" style="max-width:100%;height:auto;border-radius:10px;border:1px solid rgba(255,255,255,0.08);" />
        </td></tr>`;
    case 'columns':
      return `
        <tr><td style="padding:12px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td valign="top" width="50%" style="padding:8px;font-size:14px;line-height:1.5;color:#cbd5e1;">${escapeHtml(block.left).replace(/\n/g, '<br/>')}</td>
            <td valign="top" width="50%" style="padding:8px;font-size:14px;line-height:1.5;color:#cbd5e1;">${escapeHtml(block.right).replace(/\n/g, '<br/>')}</td>
          </tr></table>
        </td></tr>`;
    case 'spacer':
      return `<tr><td style="height:${block.heightPx}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
    case 'divider':
      return `<tr><td style="padding:12px 4px;"><hr style="border:none;border-top:1px solid rgba(255,255,255,0.12);margin:0;" /></td></tr>`;
    default:
      return '';
  }
}

export function renderEmailHtml(doc: EmailTemplateDocument): string {
  const inner = doc.blocks.map(renderBlock).join('\n');
  const mw = maxWidth[doc.layout];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#020617;padding:24px 12px;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(doc.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${mw};margin:0 auto;background:#0f172a;border-radius:16px;border:1px solid rgba(148,163,184,0.15);overflow:hidden;">
    ${inner}
  </table>
</body></html>`;
}
