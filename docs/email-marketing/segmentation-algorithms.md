# Segmentation algorithms

Audience rules in **Email Lab** evaluate against **derived personas** plus raw CRM fields. Implementation: `services/emailPersona.ts` and `services/emailSegmentation.ts`.

## Data inputs

| Source | Fields used |
|--------|----------------|
| **CRM contacts** (`crm_contacts`) | `name`, `role`, `company`, `email`, `lastContact`, `id` |
| **CRM activities** (`crm_activities`) | Matched when `target` or `topic` contains the contact’s name (case-insensitive) |

## Persona derivation

For each contact we compute a deterministic `EmailPersona`:

- **region** — Pseudo-assigned from a stable hash of `id|email|company` into `AMER | EMEA | APAC | LATAM | Unknown`. *Replace with geo-IP or account country when that column exists.*
- **seniority** — Regex map on `role` toward `IC | Lead | Director | VP | C-Level`.
- **engagementScore** — `min(100, activityMatches * 12 + hash_mod_18)` so frequent CRM touches raise the score without random drift across reloads.
- **lifecycle** — Buckets `cold | warm | active | advocate | dormant` from score + `daysSinceContact` derived from `lastContact` (or a synthetic default if missing).

## Rule evaluation

- **AND / OR** — `EmailSegmentDefinition.matchAny`: `false` = all rules must pass; `true` = any rule passes.
- **Operators** — Text fields support `contains` and `equals` (case-insensitive). `engagementScore` supports `gte`, `lte`, `equals` with numeric operands.
- **Dynamic segments** — The UI flag marks intent to re-run evaluation whenever CRM data refreshes from `useCRMState`; the engine itself is pure and side-effect free.

## Future upgrades

1. Push evaluation to Appwrite with scheduled functions for million-row lists.
2. Add event predicates (page views, product usage) once those streams exist in the vault.
3. Persist segment membership snapshots for audit trails.
