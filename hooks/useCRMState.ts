import { useCallback, useState, useEffect } from 'react';
import type { CRMDeal, CRMActivity, CRMContact, InfluenceLink } from '../types.js';
import { client } from '../services/appwriteClient.js';
import { runDealStrategist } from '../services/ollamaService.js';
import {
  fetchCrmSnapshot,
  fetchCrmSlice,
  createCrmActivity,
  createCrmContact,
  createCrmDeal,
  updateCrmDealFull,
  moveCrmDealStage,
  persistDealStrategy,
  deleteCrmContact,
  deleteCrmDeal,
  mapDBToActivity,
  mapDBToContact,
  mapDBToDeal,
  getCrmRealtimeChannels,
  parseCrmRealtimeSlice,
  type CrmPipelineStage,
} from '../services/crmService.js';
import { ID } from 'appwrite';

export const useCRMState = (
  syndicateId: string,
  currentUserName: string = 'Operator',
  authenticatedUserId?: string | null,
) => {
  const [pipeline, setPipeline] = useState<Record<string, CRMDeal[]>>({
    Prospecting: [],
    Qualification: [],
    Proposal: [],
    Negotiation: [],
  });

  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [influenceLinks, setInfluenceLinks] = useState<InfluenceLink[]>([]);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);

  const applySnapshot = useCallback(
    (snapshot: Awaited<ReturnType<typeof fetchCrmSnapshot>>) => {
      setPipeline(snapshot.pipeline);
      setActivities(snapshot.activities);
      setContacts(snapshot.contacts);
      setInfluenceLinks(snapshot.influenceLinks);
    },
    [],
  );

  const fetchData = useCallback(async () => {
    if (!syndicateId) return;
    try {
      const snapshot = await fetchCrmSnapshot(syndicateId);
      applySnapshot(snapshot);
    } catch (err) {
      console.error('Appwrite CRM fetch failed:', err);
    }
  }, [syndicateId, applySnapshot]);

  const refreshSlice = useCallback(
    async (slice: NonNullable<ReturnType<typeof parseCrmRealtimeSlice>>) => {
      if (!syndicateId) return;
      try {
        const partial = await fetchCrmSlice(syndicateId, slice);
        if (partial.pipeline) setPipeline(partial.pipeline);
        if (partial.activities) setActivities(partial.activities);
        if (partial.contacts) setContacts(partial.contacts);
        if (partial.influenceLinks) setInfluenceLinks(partial.influenceLinks);
      } catch (err) {
        console.error(`Appwrite CRM slice refresh (${slice}) failed:`, err);
      }
    },
    [syndicateId],
  );

  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;

    void fetchData();

    const channels = getCrmRealtimeChannels();
    const unsubscribes = channels.map((channel) =>
      client.subscribe(channel, (response) => {
        const slice = parseCrmRealtimeSlice(response.events);
        if (slice) void refreshSlice(slice);
      }),
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [syndicateId, authenticatedUserId, fetchData, refreshSlice]);

  const logActivity = useCallback(
    async (action: CRMActivity['action'], target: string, topic: string) => {
      const dbId = ID.unique();
      const optimistic = mapDBToActivity({
        $id: dbId,
        syndicate_id: syndicateId,
        user_name: currentUserName,
        action,
        target,
        topic,
        timestamp: Date.now(),
      });

      setActivities((prev) => [optimistic, ...prev].slice(0, 20));

      try {
        await createCrmActivity(syndicateId, currentUserName, action, target, topic, dbId);
      } catch (err) {
        console.error('Failed to log CRM activity:', err);
        void fetchData();
      }
    },
    [syndicateId, currentUserName, fetchData],
  );

  const updateDeal = useCallback(
    async (deal: CRMDeal, stage: string) => {
      await updateCrmDealFull(deal, syndicateId, stage);
      void logActivity('updated', deal.company, 'Deal details synced.');
      void refreshSlice('deals');
    },
    [syndicateId, logActivity, refreshSlice],
  );

  const moveDeal = useCallback(
    async (dealId: string | number, targetStage: string) => {
      await moveCrmDealStage(dealId.toString(), targetStage as CrmPipelineStage);
      void logActivity('updated', 'Deal', `Moved to ${targetStage}`);
      void refreshSlice('deals');
    },
    [logActivity, refreshSlice],
  );

  const addContact = useCallback(
    async (contact: Omit<CRMContact, 'id'>) => {
      const dbId = ID.unique();
      const row = await createCrmContact(syndicateId, contact, dbId);
      const mapped = mapDBToContact(row);
      setContacts((prev) => [mapped, ...prev]);
      void refreshSlice('contacts');
    },
    [syndicateId, refreshSlice],
  );

  const removeContact = useCallback(
    async (contactId: string) => {
      await deleteCrmContact(contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      void refreshSlice('contacts');
    },
    [refreshSlice],
  );

  const addDeal = useCallback(
    async (deal: Omit<CRMDeal, 'id'>, stage: CrmPipelineStage = 'Prospecting') => {
      const dbId = ID.unique();
      try {
        const row = await createCrmDeal(syndicateId, deal, stage, dbId);
        const mapped = mapDBToDeal(row);
        setPipeline((prev) => ({
          ...prev,
          [stage]: [mapped, ...(prev[stage] ?? [])],
        }));
        void logActivity('created', deal.company, `New deal: ${deal.dealName}`);
      } catch (err) {
        console.error('Failed to create CRM deal:', err);
        void refreshSlice('deals');
      }
    },
    [syndicateId, logActivity, refreshSlice],
  );

  const removeDeal = useCallback(
    async (dealId: string) => {
      await deleteCrmDeal(dealId);
      setPipeline((prev) => {
        const next = { ...prev };
        for (const stage of Object.keys(next)) {
          next[stage] = next[stage].filter((d) => d.id.toString() !== dealId);
        }
        return next;
      });
      void refreshSlice('deals');
    },
    [refreshSlice],
  );

  const generateTacticalStrategy = useCallback(
    async (dealId: string | number) => {
      const deal = (Object.values(pipeline).flat() as CRMDeal[]).find(
        (d) => d.id === dealId,
      );
      if (!deal) return;

      setIsLoadingBrief(true);
      try {
        const strategy = await runDealStrategist(deal);
        await persistDealStrategy(dealId.toString(), strategy);
        await refreshSlice('deals');
      } catch (e) {
        console.error('Strategy generation failed', e);
      } finally {
        setIsLoadingBrief(false);
      }
    },
    [pipeline, refreshSlice],
  );

  return {
    pipeline,
    activities,
    contacts,
    influenceLinks,
    isLoadingBrief,
    updateDeal,
    moveDeal,
    logActivity,
    addContact,
    addDeal,
    removeContact,
    removeDeal,
    generateTacticalStrategy,
    refreshCrm: fetchData,
  };
};
