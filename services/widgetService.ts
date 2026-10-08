
/**
 * @file services/widgetService.ts
 * @description A service responsible for generating the data structures for various interactive widgets
 * that can be displayed in the CommandStream. This acts as a centralized factory for widget data.
 */

import { WidgetType, type WidgetData, DiagnosticsWidgetData, CashFlowWidgetData, InvoiceWidgetData, OnboardingWidgetData, NavigationWidgetData, TaskWidgetData, SecurityAlertWidgetData, MorningBriefWidgetData, CrmContactWidgetData, RevenueChartWidgetData, WorkflowScaffoldWidgetData } from '../types';

/**
 * Generates the appropriate widget data object based on a given type and parameters.
 * This function is typically called in response to an LLM tool call that requests a widget to be shown.
 * 
 * @param {string} type - The type of widget to generate, corresponding to the `WidgetType` enum.
 * @param {any} params - An object containing the parameters for the widget, extracted from tool call arguments.
 * @returns {WidgetData | undefined} The fully-formed widget data object, or `undefined` if the widget type is unknown.
 */
export const generateWidgetData = (type: string, params: any): WidgetData | undefined => {
    switch (type) {
        // Generates data for a system diagnostics overview.
        case WidgetType.DIAGNOSTICS:
            return {
                type: WidgetType.DIAGNOSTICS,
                systems: [
                    { name: "Cognitive Core", status: "OPERATIONAL", details: "0.2ms latency" },
                    { name: "AEGIS Financial Link", status: "OPERATIONAL", details: "Stable" },
                    { name: "Market Analysis Subsystem", status: "DEGRADED", details: "High Volatility" },
                ]
            } as DiagnosticsWidgetData;
            
        // Generates sample data for a cash flow chart.
        case WidgetType.CASH_FLOW:
            return {
                type: WidgetType.CASH_FLOW,
                title: 'Q3 Cash Flow (Millions)',
                data: [
                    { label: 'July', value: 2.5 },
                    { label: 'August', value: 3.1 },
                    { label: 'September', value: 2.8 },
                ]
            } as CashFlowWidgetData;

        // Generates data for an invoice settlement widget.
        case WidgetType.INVOICE:
            return {
                type: WidgetType.INVOICE,
                invoiceNumber: params.invoiceNumber || "N/A",
                clientName: params.clientName || "Client X",
                status: params.status || "PAID", // Defaults to PAID if not specified
                amount: params.amount || 15000
            } as InvoiceWidgetData;

        // Generates data for a contractor onboarding status widget.
        case WidgetType.ONBOARDING:
            return {
                type: WidgetType.ONBOARDING,
                contractorName: params.contractorName || "Jane Doe",
                accessStatus: params.accessStatus || "PENDING",
                payrollStatus: params.payrollStatus || "SCHEDULED"
            } as OnboardingWidgetData;

        // New: Task Creation Widget
        case WidgetType.TASK:
            return {
                type: WidgetType.TASK,
                taskName: params.taskName || "New Task",
                assignee: params.assignee || "Unassigned",
                dueDate: params.dueDate || "TBD",
                location: params.location || "Remote",
                status: "Pending"
            } as TaskWidgetData;

        // New: Security Alert Widget
        case WidgetType.SECURITY_ALERT:
            return {
                type: WidgetType.SECURITY_ALERT,
                severity: params.severity || "Medium",
                alertTitle: params.alertTitle || "Security Anomaly Detected",
                description: params.description || "Unusual activity detected in the system.",
                timestamp: new Date().toLocaleTimeString(),
                recommendedAction: params.recommendedAction || "Investigate logs."
            } as SecurityAlertWidgetData;

        // New: Morning Brief Widget
        case WidgetType.MORNING_BRIEF:
            return {
                type: WidgetType.MORNING_BRIEF,
                date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                securityStatus: params.securityStatus || "Nominal. No critical incidents overnight.",
                operationalHighlights: params.operationalHighlights || [
                    "3 Projects awaiting approval.",
                    "Cloud resource usage at 45%.",
                    "New compliance protocols active."
                ],
                financialOutlook: params.financialOutlook || "Cash flow positive. Q4 projections trending up by 12% based on current pipeline."
            } as MorningBriefWidgetData;

        // CRM Contact Card micro-frontend (spec §2.2, §5 CRM)
        case WidgetType.CRM_CONTACT:
            return {
                type: WidgetType.CRM_CONTACT,
                name:        params.name        ?? 'Unknown Contact',
                role:        params.role        ?? 'Stakeholder',
                company:     params.company     ?? 'Unknown Co.',
                email:       params.email,
                phone:       params.phone,
                dealStage:   params.dealStage   ?? 'Lead',
                dealValue:   params.dealValue,
                lastActivity: params.lastActivity ?? 'No recent activity',
                score:       params.score,
                avatarColor: params.avatarColor ?? '#6A0DAD',
                tags:        params.tags        ?? [],
            } as CrmContactWidgetData;

        // Revenue / Pipeline Chart micro-frontend (spec §2.2)
        case WidgetType.REVENUE_CHART:
            return {
                type:       WidgetType.REVENUE_CHART,
                title:      params.title      ?? 'Revenue Overview',
                totalValue: params.totalValue ?? 0,
                currency:   params.currency   ?? '$',
                breakdown:  params.breakdown  ?? [
                    { label: 'New Business', value: 45000, color: 'var(--patina-green)' },
                    { label: 'Renewals',     value: 38000, color: 'var(--roman-aqua)'   },
                    { label: 'Upsells',      value: 17000, color: 'var(--imperial-purple)' },
                ],
                period: params.period,
                trend:  params.trend,
            } as RevenueChartWidgetData;

        // Conversational scaffolding preview (spec §3.3)
        case WidgetType.WORKFLOW_SCAFFOLD:
            return {
                type:           WidgetType.WORKFLOW_SCAFFOLD,
                workflowName:   params.workflowName    ?? 'Generated Workflow',
                description:    params.description     ?? 'AI-scaffolded workflow',
                estimatedNodes: params.estimatedNodes  ?? 5,
                phases:         params.phases          ?? [
                    { label: 'Trigger',    agents: ['Start Node']       },
                    { label: 'Processing', agents: ['Cognitive Core']   },
                    { label: 'Output',     agents: ['Notification Node'] },
                ],
                completionPct: params.completionPct ?? 70,
                scaffoldId:    params.scaffoldId,
            } as WorkflowScaffoldWidgetData;

        // Strategic Galaxy Overview Widget
        case WidgetType.GALAXY_STRATEGIC:
            return {
                type: WidgetType.GALAXY_STRATEGIC,
                title: params.title || 'Syndicate Galactic Overview',
                rivals: params.rivals || [
                    { id: 'ql-01', name: 'QuantumLeap Inc.', velocity: 88.2, threat: 'HIGH THREAT', alliance: 'RIVAL' },
                    { id: 'av-02', name: 'ApexVector Global', velocity: 76.5, threat: 'MED THREAT', alliance: 'NEUTRAL' },
                    { id: 'sd-03', name: 'SovereignDAO', velocity: 91.0, threat: 'LOW THREAT', alliance: 'ALLIED' },
                ],
                bounties: params.bounties || [
                    { id: 'b1', title: '48h Autonomous Product Launch', reward: '50,000 Ξ', difficulty: 'EXTREME' },
                    { id: 'b2', title: 'Latency Compression Sprint', reward: '18,500 Ξ', difficulty: 'TACTICAL' },
                ],
            } as any;

        // PvP Battle Combat Widget
        case WidgetType.PVP_BATTLE:
            return {
                type: WidgetType.PVP_BATTLE,
                rivalName: params.rivalName || 'QuantumLeap Inc.',
                durationHours: params.durationHours || 48,
                yourVelocity: params.yourVelocity || 94.8,
                rivalVelocity: params.rivalVelocity || 88.2,
                stakes: params.stakes || 'Future collaboration talks & 50,000 Ξ treasury pool',
                status: params.status || 'ACTIVE',
                timeRemaining: params.timeRemaining || '47h 58m 12s',
                battleLog: params.battleLog || [
                    'MATCH INITIATED: 48-Hour Innovation Velocity Sprint',
                    'TERMS RATIFIED: Autonomous product deployment velocity',
                    'YOUR SYNDICATE: +6.6% velocity advantage detected',
                ],
            } as any;

        // Returns undefined for any unknown widget type.
        default:
            return undefined;
    }
};
