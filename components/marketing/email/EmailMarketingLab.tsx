/**
 * Integrated email marketing workspace: templates, segmentation (CRM-backed), and scheduling.
 * Persisted in Appwrite TablesDB (`email_marketing_lab`) per syndicate — not localStorage.
 */

import React, { useMemo } from 'react';
import type { CRMContact, CRMActivity } from '../../../types.js';
import { useEmailMarketingState } from '../../../hooks/useEmailMarketingState.js';
import { EmailCampaignCanvas } from './EmailCampaignCanvas.js';
import { SegmentationWorkbench } from './SegmentationWorkbench.js';
import { ScheduleHub } from './ScheduleHub.js';

export interface EmailMarketingLabProps {
  syndicateId: string;
  userId: string;
  contacts: CRMContact[];
  activities: CRMActivity[];
}

export const EmailMarketingLab: React.FC<EmailMarketingLabProps> = ({
  syndicateId,
  userId,
  contacts,
  activities,
}) => {
  const { template, setTemplate, segments, setSegments, schedules, setSchedules, isLoading, persistError } =
    useEmailMarketingState(syndicateId, userId);

  const templates = useMemo(() => [template], [template]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-white/10 bg-black/30">
        <p className="text-sm text-text-secondary font-mono">Syncing Email Lab from Appwrite…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {persistError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {persistError}
        </div>
      )}
      <EmailCampaignCanvas document={template} onDocumentChange={setTemplate} />
      <SegmentationWorkbench segments={segments} onSegmentsChange={setSegments} contacts={contacts} activities={activities} />
      <ScheduleHub schedules={schedules} onSchedulesChange={setSchedules} segments={segments} templates={templates} />
    </div>
  );
};
