/**
 * Persists Email Lab (template, segments, schedules) to Appwrite TablesDB — one row per syndicate.
 * Debounced writes; realtime refresh when another client updates the same syndicate.
 *
 * Run `bun scripts/setup-appwrite-backend.ts` (with server API key) to create `email_marketing_lab`.
 */

import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import type {
  CampaignScheduleConfig,
  EmailSegmentDefinition,
  EmailTemplateDocument,
} from '../services/emailCampaignTypes.js';
import { DEFAULT_EMAIL_TEMPLATE } from '../services/emailTemplatePresets.js';
import { nanoid } from 'nanoid';

const DEBOUNCE_MS = 700;

function emptySegment(): EmailSegmentDefinition {
  return {
    id: nanoid(),
    name: 'New dynamic segment',
    dynamic: true,
    rules: [],
    matchAny: false,
  };
}

function defaultSchedule(templateId: string): CampaignScheduleConfig {
  const start = new Date(Date.now() + 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}`;
  return {
    id: nanoid(),
    campaignName: 'Lifecycle pulse',
    segmentId: null,
    templateId,
    mode: 'once',
    startLocal: local,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    recurring: 'weekly',
    dayOfWeek: 2,
    sto: 'engagement',
    enabled: true,
  };
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mergeTemplate(loaded: EmailTemplateDocument): EmailTemplateDocument {
  return {
    ...DEFAULT_EMAIL_TEMPLATE,
    ...loaded,
    blocks: Array.isArray(loaded.blocks) && loaded.blocks.length ? loaded.blocks : DEFAULT_EMAIL_TEMPLATE.blocks,
  };
}

type LabRow = {
  $id: string;
  syndicate_id: string;
  template_json?: string;
  segments_json?: string;
  schedules_json?: string;
  updated_at?: string;
};

export function useEmailMarketingState(syndicateId: string, authenticatedUserId?: string | null) {
  const [template, setTemplateState] = useState<EmailTemplateDocument>(DEFAULT_EMAIL_TEMPLATE);
  const [segments, setSegmentsState] = useState<EmailSegmentDefinition[]>([emptySegment()]);
  const [schedules, setSchedulesState] = useState<CampaignScheduleConfig[]>([
    defaultSchedule(DEFAULT_EMAIL_TEMPLATE.id),
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [persistError, setPersistError] = useState<string | null>(null);

  const templateRef = useRef(template);
  const segmentsRef = useRef(segments);
  const schedulesRef = useRef(schedules);
  templateRef.current = template;
  segmentsRef.current = segments;
  schedulesRef.current = schedules;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemoteUpdatedAtRef = useRef('');
  const needsInitialCreateRef = useRef(false);
  const ignoreRemoteUntilRef = useRef(0);

  const flushPersist = useCallback(async () => {
    if (!syndicateId) return;
    const t = templateRef.current;
    const segs = segmentsRef.current;
    const schs = schedulesRef.current;
    const updatedAt = new Date().toISOString();
    const payload = {
      syndicate_id: syndicateId,
      template_json: JSON.stringify(t),
      segments_json: JSON.stringify(segs),
      schedules_json: JSON.stringify(schs),
      updated_at: updatedAt,
    };

    try {
      setPersistError(null);
      await tablesDB.updateRow(DATABASE_ID, TABLES.EMAIL_MARKETING_LAB, syndicateId, payload);
      lastRemoteUpdatedAtRef.current = updatedAt;
      ignoreRemoteUntilRef.current = Date.now() + 1500;
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string };
      if (err?.code === 404) {
        try {
          await tablesDB.createRow(DATABASE_ID, TABLES.EMAIL_MARKETING_LAB, syndicateId, payload);
          lastRemoteUpdatedAtRef.current = updatedAt;
          ignoreRemoteUntilRef.current = Date.now() + 1500;
          return;
        } catch (createErr) {
          console.error('Email lab create failed:', createErr);
          setPersistError('Could not create Email Lab record in Appwrite.');
        }
      } else {
        console.error('Email lab persist failed:', e);
        setPersistError(err?.message || 'Could not save Email Lab to Appwrite.');
      }
    }
  }, [syndicateId]);

  const queuePersist = useCallback(() => {
    if (!syndicateId || !authenticatedUserId || isLoading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void flushPersist();
    }, DEBOUNCE_MS);
  }, [syndicateId, authenticatedUserId, isLoading, flushPersist]);

  const loadRow = useCallback(async () => {
    if (!syndicateId) return;
    setIsLoading(true);
    try {
      const { rows } = await tablesDB.listRows(DATABASE_ID, TABLES.EMAIL_MARKETING_LAB, [
        Query.equal('syndicate_id', syndicateId),
        Query.limit(1),
      ]);
      const row = rows[0] ? (rows[0] as unknown as LabRow) : undefined;
      if (!row) {
        const tpl = { ...DEFAULT_EMAIL_TEMPLATE, id: nanoid(), updatedAt: Date.now() };
        setTemplateState(tpl);
        setSegmentsState([emptySegment()]);
        setSchedulesState([defaultSchedule(tpl.id)]);
        templateRef.current = tpl;
        segmentsRef.current = [emptySegment()];
        schedulesRef.current = [defaultSchedule(tpl.id)];
        lastRemoteUpdatedAtRef.current = '';
        needsInitialCreateRef.current = true;
      } else {
        const tpl = mergeTemplate(parseJson<EmailTemplateDocument>(row.template_json, DEFAULT_EMAIL_TEMPLATE));
        const segs = parseJson<EmailSegmentDefinition[]>(row.segments_json, []);
        const schs = parseJson<CampaignScheduleConfig[]>(row.schedules_json, []);
        setTemplateState(tpl);
        setSegmentsState(segs.length ? segs : [emptySegment()]);
        setSchedulesState(schs.length ? schs : [defaultSchedule(tpl.id)]);
        templateRef.current = tpl;
        segmentsRef.current = segs.length ? segs : [emptySegment()];
        schedulesRef.current = schs.length ? schs : [defaultSchedule(tpl.id)];
        lastRemoteUpdatedAtRef.current = row.updated_at || '';
        needsInitialCreateRef.current = false;
      }
    } catch (e) {
      console.error('Email lab load failed:', e);
      setPersistError('Could not load Email Lab from Appwrite. Run scripts/setup-appwrite-backend.ts if the table is missing.');
      const tpl = { ...DEFAULT_EMAIL_TEMPLATE, id: nanoid(), updatedAt: Date.now() };
      setTemplateState(tpl);
      setSegmentsState([emptySegment()]);
      setSchedulesState([defaultSchedule(tpl.id)]);
      templateRef.current = tpl;
      segmentsRef.current = [emptySegment()];
      schedulesRef.current = [defaultSchedule(tpl.id)];
      needsInitialCreateRef.current = true;
    } finally {
      setIsLoading(false);
    }
  }, [syndicateId]);

  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;
    void loadRow();
  }, [syndicateId, authenticatedUserId, loadRow]);

  useEffect(() => {
    if (!isLoading || !needsInitialCreateRef.current || !syndicateId || !authenticatedUserId) return;
    needsInitialCreateRef.current = false;
    queuePersist();
  }, [isLoading, syndicateId, authenticatedUserId, queuePersist]);

  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;
    const channel = `databases.${DATABASE_ID}.collections.${TABLES.EMAIL_MARKETING_LAB}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      const record = response.payload as LabRow | undefined;
      if (!record || record.syndicate_id !== syndicateId) return;
      if (Date.now() < ignoreRemoteUntilRef.current) return;
      if (debounceRef.current) return;
      const remote = record.updated_at || '';
      if (remote && remote <= lastRemoteUpdatedAtRef.current) return;
      void loadRow();
    });
    return () => {
      unsubscribe();
    };
  }, [syndicateId, authenticatedUserId, loadRow]);

  const setTemplate = useCallback(
    (u: SetStateAction<EmailTemplateDocument>) => {
      setTemplateState((prev) => {
        const next = typeof u === 'function' ? (u as (p: EmailTemplateDocument) => EmailTemplateDocument)(prev) : u;
        templateRef.current = next;
        return next;
      });
      queuePersist();
    },
    [queuePersist],
  );

  const setSegments = useCallback(
    (u: SetStateAction<EmailSegmentDefinition[]>) => {
      setSegmentsState((prev) => {
        const next = typeof u === 'function' ? (u as (p: EmailSegmentDefinition[]) => EmailSegmentDefinition[])(prev) : u;
        segmentsRef.current = next;
        return next;
      });
      queuePersist();
    },
    [queuePersist],
  );

  const setSchedules = useCallback(
    (u: SetStateAction<CampaignScheduleConfig[]>) => {
      setSchedulesState((prev) => {
        const next = typeof u === 'function' ? (u as (p: CampaignScheduleConfig[]) => CampaignScheduleConfig[])(prev) : u;
        schedulesRef.current = next;
        return next;
      });
      queuePersist();
    },
    [queuePersist],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    template,
    setTemplate,
    segments,
    setSegments,
    schedules,
    setSchedules,
    isLoading,
    persistError,
    reload: loadRow,
  };
}
