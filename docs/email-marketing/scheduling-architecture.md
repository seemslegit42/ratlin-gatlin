# Scheduling architecture & analytics

Scheduling UI lives in `components/marketing/email/ScheduleHub.tsx` with logic in `services/emailScheduler.ts`.

## Configuration model

`CampaignScheduleConfig` captures:

- **mode** — `once` or `recurring` with `daily | weekly | monthly` cadence.
- **startLocal + timeZone** — Authoring uses `<input type="datetime-local">`; we interpret the instant with `Intl.DateTimeFormat` + `timeZone` to align the UTC instant (see `parseLocalDateTime` in code).
- **sto (send-time optimization)** — Heuristic modes:
  - `off` — Uses the scheduled instant verbatim (post parsing).
  - `engagement` — Nudges send hour to a UTC afternoon window (placeholder for ML/ESP send-time API).
  - `timezone` — Morning anchor for regional sends (placeholder).

`expandScheduleOccurrences` returns the next *N* sends with a `stoAdjusted` flag for UI transparency.

## CRM integration

- Schedules bind optionally to a **segment id** and **template id** chosen from definitions stored in Appwrite (`email_marketing_lab.schedules_json` / `segments_json` alongside `template_json`).
- Production path: POST schedule payloads to your ESP or an Appwrite function; subscribe to webhooks for delivery/bounce/open/click and write back to analytics tables.

## Analytics methodology (current)

`syntheticPerformanceSnapshot` produces **deterministic demo metrics** from the schedule id hash so the dashboard is never empty in development. **Do not** treat these numbers as real reporting.

### Recommended production pipeline

1. **Ingest** — ESP webhooks → append-only event store.
2. **Aggregate** — Hourly rollups: sends, delivered, hard bounces, opens (unique per subscriber), clicks, complaints, unsubscribes.
3. **Quality** — Seed confidence from sample size (`delivered`) and variance against cohort baselines.
4. **STO feedback** — Compare open lift for STO cohort vs control; feed into provider ML or internal bandit.

## API sketch (future backend)

```
POST /v1/campaigns/:id/schedule
{ "mode":"recurring","recurring":"weekly","start":"2026-05-10T09:00","timeZone":"Europe/London","sto":"engagement","segmentId":"...","templateId":"..." }

GET /v1/campaigns/:id/performance?from=&to=
{ "sends":..., "openRate":..., "confidence":... }
```

Document the real contract alongside your ESP or internal orchestrator when wired.
