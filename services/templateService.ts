
/**
 * @file services/templateService.ts
 * @description Provides immutable 'System Templates' that serve as starter blueprints
 * for the Weaver Studio. Includes a comprehensive library of reusable agent components.
 */

import { AgentType, AgentTemplate } from '../types.js';
import { DEFAULT_AGENT_LLM_MODEL } from './llmDefaults.js';

export const SYSTEM_TEMPLATES: AgentTemplate[] = [
    // --- 1. WEB SCRAPING & HARVESTING ---
    {
        id: 'sys-news-crawler',
        syndicateId: 'system',
        name: 'News Crawler',
        description: 'Scrapes and summarizes news from a target URL.',
        type: AgentType.WebScraper,
        data: {
            target: 'https://news.ycombinator.com',
            extractionRules: 'Extract article titles and links.',
            cleanData: true
        }
    },
    {
        id: 'sys-competitor-monitor',
        syndicateId: 'system',
        name: 'Competitor Monitor',
        description: 'Tracks pricing or feature changes on a competitor page.',
        type: AgentType.WebScraper,
        data: {
            prompt: 'Monitor the pricing page for changes. Report any new tiers or price hikes.',
            schedule: '0 0 * * *' // Daily
        }
    },
    {
        id: 'sys-linkedin-harvester',
        syndicateId: 'system',
        name: 'Profile Harvester',
        description: 'Extracts professional details from a LinkedIn public profile.',
        type: AgentType.WebScraper,
        data: {
            extractionFields: ['Name', 'Title', 'Company', 'About'],
            format: 'JSON'
        }
    },

    // --- 2. DATA ANALYSIS & TRANSFORMATION ---
    {
        id: 'sys-sentiment-analyzer',
        syndicateId: 'system',
        name: 'Sentiment Analyzer',
        description: 'Classifies input text as Positive, Neutral, or Negative with a confidence score.',
        type: AgentType.CognitiveCore,
        persona: 'You are an objective Sentiment Analyst. Output JSON only: { "sentiment": "positive", "score": 0.95 }',
        model: DEFAULT_AGENT_LLM_MODEL,
        data: {
            prompt: 'Analyze the sentiment of the following text:\n\n{{input}}'
        }
    },
    {
        id: 'sys-json-flattener',
        syndicateId: 'system',
        name: 'JSON Flattener',
        description: 'Converts complex nested JSON into a flat CSV-ready structure.',
        type: AgentType.DataTransformer,
        data: {
            transformationInstruction: 'Flatten all nested objects into dot-notation keys. Convert arrays to pipe-separated strings.'
        }
    },
    {
        id: 'sys-pattern-spotter',
        syndicateId: 'system',
        name: 'Pattern Spotter',
        description: 'Identifies recurring anomalies or trends in a dataset.',
        type: AgentType.CognitiveCore,
        model: DEFAULT_AGENT_LLM_MODEL,
        data: {
            prompt: 'Review the following data points. Identify 3 statistical anomalies or recurring patterns that warrant attention.'
        }
    },

    // --- 3. API INTERACTION & INTEGRATIONS ---
    {
        id: 'sys-stripe-refund',
        syndicateId: 'system',
        name: 'Stripe Refund Agent',
        description: 'Issues a refund for a specific transaction ID via Stripe API.',
        type: AgentType.ApiCall,
        data: {
            method: 'POST',
            url: 'https://api.stripe.com/v1/refunds',
            headers: '{"Authorization": "Bearer {{stripe_key}}"}',
            body: '{"charge": "{{charge_id}}"}'
        }
    },
    {
        id: 'sys-slack-alert',
        syndicateId: 'system',
        name: 'Slack Alert Bot',
        description: 'Posts a formatted alert message to a designated Slack channel.',
        type: AgentType.ApiCall,
        data: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
            headers: '{"Content-Type": "application/json"}',
            body: '{"text": "🚨 ALERT: {{message}}", "channel": "#ops"}'
        }
    },
    {
        id: 'sys-webhook-receiver',
        syndicateId: 'system',
        name: 'Webhook Listener',
        description: 'Passive listener for incoming JSON webhooks.',
        type: AgentType.Trigger,
        data: {
            eventType: 'webhook',
            path: '/hooks/custom-event'
        }
    },

    // --- 4. TEXT GENERATION & CREATIVITY ---
    {
        id: 'sys-deep-writer',
        syndicateId: 'system',
        name: 'Deep Writer',
        description: 'Generates long-form, nuanced essays with structural integrity.',
        type: AgentType.CognitiveCore,
        persona: 'Master Essayist',
        model: DEFAULT_AGENT_LLM_MODEL,
        data: {
            prompt: 'Write a deep-dive article about {{topic}}. Include an introduction, 3 key arguments, and a conclusion.'
        }
    },
    {
        id: 'sys-tech-editor',
        syndicateId: 'system',
        name: 'Technical Editor',
        description: 'Refines technical documentation for clarity and accuracy.',
        type: AgentType.Copywriter,
        data: {
            tone: 'Precise, Professional, Concise',
            task: 'Fix grammar, improve flow, and verify terminology consistency.'
        }
    },
    {
        id: 'sys-email-drafter',
        syndicateId: 'system',
        name: 'Cold Email Drafter',
        description: 'Creates personalized sales outreach emails based on prospect data.',
        type: AgentType.Copywriter,
        data: {
            format: 'Cold Email',
            framework: 'AIDA (Attention, Interest, Desire, Action)'
        }
    },

    // --- 5. LOGIC & CONTROL ---
    {
        id: 'sys-router-sentiment',
        syndicateId: 'system',
        name: 'Sentiment Router',
        description: 'Routes workflow based on text sentiment (Positive -> Reply, Negative -> Escalate).',
        type: AgentType.Router,
        data: {
            routes: [
                { condition: 'sentiment == "positive"', target: 'reply_agent' },
                { condition: 'sentiment == "negative"', target: 'escalate_agent' }
            ]
        }
    },
    {
        id: 'sys-cron-hourly',
        syndicateId: 'system',
        name: 'Hourly Heartbeat',
        description: 'Triggers connected agents exactly once per hour.',
        type: AgentType.CronTrigger,
        data: {
            schedule: '0 * * * *'
        }
    },
    
    // --- BLUEPRINTS (Existing Complex Flows) ---
    {
        id: 'bp-marketing-engine',
        syndicateId: 'system',
        name: 'Inbound Content Engine',
        description: 'Autonomous content lifecycle: Strategy -> Creation -> Optimization -> Publishing.',
        type: AgentType.CampaignManager,
        persona: 'Chief Marketing Officer',
        model: DEFAULT_AGENT_LLM_MODEL,
        data: {},
        blueprint: {
            agents: [
                { 
                    id: 'strat', name: 'Strategy Planner', type: AgentType.CampaignManager, 
                    relativePosition: { x: 0, y: 200 },
                    data: { prompt: 'Analyze current trends in {{topic}} and generate a content calendar.' }
                },
                { 
                    id: 'writer', name: 'Content Writer', type: AgentType.Copywriter, 
                    relativePosition: { x: 350, y: 200 },
                    data: { tone: 'Thought Leadership', format: 'Blog Post' }
                },
                { 
                    id: 'seo', name: 'SEO/AEO Optimizer', type: AgentType.SEOAnalyzer, 
                    relativePosition: { x: 700, y: 100 },
                    data: { keywords: 'Agentic AI, Automation, Scalability' }
                },
                { 
                    id: 'brand', name: 'Brand Guard', type: AgentType.BrandGuard, 
                    relativePosition: { x: 700, y: 300 },
                    data: { strictness: 'High' }
                },
                { 
                    id: 'cms', name: 'CMS Publisher', type: AgentType.CMSPublisher, 
                    relativePosition: { x: 1050, y: 200 },
                    data: { platform: 'Wordpress' }
                }
            ],
            connections: [
                { from: 'strat', to: 'writer' },
                { from: 'writer', to: 'seo' },
                { from: 'writer', to: 'brand' },
                { from: 'seo', to: 'cms' },
                { from: 'brand', to: 'cms' }
            ]
        }
    },
    {
        id: 'bp-sdr-crew',
        syndicateId: 'system',
        name: 'Outbound SDR Crew',
        description: 'Hyper-personalized outreach pipeline with lead enrichment and AI response handling.',
        type: AgentType.CognitiveCore,
        persona: 'Head of Sales',
        model: DEFAULT_AGENT_LLM_MODEL,
        data: {},
        blueprint: {
            agents: [
                { 
                    id: 'leads', name: 'Lead Source', type: AgentType.Input, 
                    relativePosition: { x: 0, y: 200 },
                    data: { inputData: '{"leads": [{"company": "Acme", "contact": "Jane Doe"}]}' } 
                },
                { 
                    id: 'enrich', name: 'Lead Enrichment', type: AgentType.KnowledgeRetrieval, 
                    relativePosition: { x: 300, y: 200 },
                    data: { source: 'web', query: 'Find recent news and tech stack for {{company}}.' }
                },
                { 
                    id: 'drafter', name: 'Personalizer', type: AgentType.Copywriter, 
                    relativePosition: { x: 600, y: 200 },
                    data: { prompt: 'Draft a cold email to {{contact}} referencing {{news}}.' }
                },
                { 
                    id: 'email', name: 'Email Sender', type: AgentType.EmailAction, 
                    relativePosition: { x: 900, y: 100 },
                    data: { subject: 'Question about your tech stack' }
                },
                { 
                    id: 'ai-sdr', name: 'AI SDR (Replies)', type: AgentType.CognitiveCore, 
                    relativePosition: { x: 900, y: 300 },
                    persona: 'You are an SDR handling objections. If the reply is positive, book a meeting. If negative, handle gracefully.',
                    data: { prompt: 'Analyze reply and generate response.' }
                }
            ],
            connections: [
                { from: 'leads', to: 'enrich' },
                { from: 'enrich', to: 'drafter' },
                { from: 'drafter', to: 'email' },
                { from: 'drafter', to: 'ai-sdr' }
            ]
        }
    },
    {
        id: 'bp-legal-sentinel',
        syndicateId: 'system',
        name: 'Legal Sentinel',
        description: 'Automated contract drafting and risk compliance review.',
        type: AgentType.BrandGuard,
        persona: 'General Counsel',
        data: {},
        blueprint: {
            agents: [
                { 
                    id: 'terms', name: 'Deal Terms', type: AgentType.Input, 
                    relativePosition: { x: 0, y: 200 }
                },
                { 
                    id: 'draft', name: 'Contract Drafter', type: AgentType.CognitiveCore, 
                    relativePosition: { x: 300, y: 200 },
                    data: { prompt: 'Draft a standard NDA based on the input terms.' }
                },
                { 
                    id: 'scan', name: 'Risk Scanner', type: AgentType.BrandGuard, 
                    relativePosition: { x: 600, y: 200 },
                    data: { strictness: 'Max', focus: 'Liability Clauses' }
                },
                { 
                    id: 'research', name: 'Legal Precedent', type: AgentType.KnowledgeRetrieval, 
                    relativePosition: { x: 600, y: 400 },
                    data: { query: 'Find recent case law regarding liability caps in SaaS contracts.' }
                },
                { 
                    id: 'review', name: 'Final Sign-off', type: AgentType.ManualTask, 
                    relativePosition: { x: 900, y: 200 },
                    data: { description: 'Attorney Review Required' }
                }
            ],
            connections: [
                { from: 'terms', to: 'draft' },
                { from: 'draft', to: 'scan' },
                { from: 'scan', to: 'review' },
                { from: 'draft', to: 'research' },
                { from: 'research', to: 'review' }
            ]
        }
    }
];
