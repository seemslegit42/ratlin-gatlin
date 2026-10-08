# Email template UI components

This document describes the **Email Lab** template builder shipped under `components/marketing/email/EmailCampaignCanvas.tsx` and related services.

## Surfaces

| Surface | Responsibility |
|--------|----------------|
| **Block palette** | Adds new blocks to the document. Each block maps to a typed entry in `EmailBlock` (`services/emailCampaignTypes.ts`). |
| **Canvas** | Ordered list of blocks. Rows are **HTML5-draggable** for reordering (drop on another row). This keeps the dependency surface small (no extra DnD library). |
| **Inspector** | Edits the selected block’s fields. Alignment, copy, URLs, and spacer height are edited here. |
| **Live preview** | Embeds `renderEmailHtml()` output via `iframe[srcDoc]` with `sandbox="allow-same-origin"` for isolation. Toggle **desktop** vs **mobile** width only (email client quirks still require ESP-specific testing). |

## Block types

- **hero** — Headline, subline, alignment.
- **text** — Multiline body, alignment.
- **button** — Label + `href`.
- **image** — `src` + `alt` (always set alt for accessibility).
- **columns** — Two text columns rendered as a nested table for email clients.
- **spacer** — Vertical rhythm via pixel height.
- **divider** — Horizontal rule.

## Layout presets

`EmailLayoutPreset` controls max width in generated HTML (`narrow` 480px, `standard` 600px, `wide` 680px). See `services/emailHtmlRenderer.ts`.

## Persistence

`EmailMarketingLab` persists via **`useEmailMarketingState`** to Appwrite TablesDB table **`email_marketing_lab`**: one row per syndicate (`$id` = `syndicate_id`), with `template_json`, `segments_json`, and `schedules_json` (string payloads). Run `bun scripts/setup-appwrite-backend.ts` with a server API key to provision the table. Agent-specific filesystem or Turso vault data belongs elsewhere; this module uses Appwrite only for CRM-adjacent marketing configuration.

## Extension guidelines

1. Add the block variant to `EmailBlock` and `renderEmailHtml`.
2. Extend the palette entry and the inspector switch in `EmailCampaignCanvas`.
3. Update this file with props, accessibility notes, and any ESP-specific caveats.
