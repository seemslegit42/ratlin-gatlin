/**
 * @file types.ts
 * @description Centralized type definitions for the ΛΞVON OS (Agentic Operating System).
 */

export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export enum Theme {
  Dark = 'dark',
  Light = 'light',
}

export enum AnimationLevel {
  Full = 'full',
  Minimal = 'minimal',
}

export type UnitType = 'Micro-App' | 'Shard' | 'Widget';

export type View =
  | 'main'
  | 'weaver'
  | 'simulacrum'
  | 'microAppForge'
  | 'economy'
  | 'avf'
  | 'finance'
  | 'crm'
  | 'hrm'
  | 'production'
  | 'operations'
  | 'security'
  | 'marketing'
  | 'procurement'
  | 'admin'
  | 'codex'
  | 'pantheon'
  | 'vault'
  | 'registry'
  | 'help';

export interface Settings {
  theme: Theme;
  animationLevel: AnimationLevel;
  interactionStyle: InteractionStyle;
  anomalySensitivity: number;
  learningParameters?: {
    patientWaitTimeThresholdMinutes?: number;
    taskDelayMultiplier?: number;
    securityDeviationThreshold?: 'Strict' | 'Moderate' | 'Relaxed';
  };
  llmProvider: 'ollama' | 'openai' | 'anthropic' | 'mediapipe' | 'litellm' | 'openrouter' | 'llamacpp';
  mcpAutoAbsorption: boolean;
}

export type WeaverMode = 'live' | 'architect';

export type InteractionStyle = 'concise' | 'conversational' | 'technical';

// --- RITES OF ASCENSION ---

export type PsycheMatrixState = 'Harried' | 'Tempered' | 'Ascended';

export interface PillarOfEternity {
    userId: string;
    psycheMatrixState: PsycheMatrixState;
    unlockedRites: string[];
    earnedSigils: string[];
    lastUpdated: number;
}

export enum RiteType {
    FOLLY_INTERDICTION = 'FOLLY_INTERDICTION',
    BURNOUT_FUNERAL = 'BURNOUT_FUNERAL'
}

// --- WORKSPACE & REGISTRY TYPES ---

export interface WorkspacePackage {
  id: string;
  name: string;
  version: string;
  description: string;
  path: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  type: 'micro-app' | 'protocol' | 'library';
  status: 'linked' | 'published' | 'draft';
}

// --- AGENTFS INTEGRATION TYPES ---

export interface FSNode {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  path: string;
  mtime: number;
}

export interface KVEntry {
  key: string;
  value: JsonValue;
  updatedAt: number;
}

export interface ToolCallEntry {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number;
  input: JsonObject;
  output: JsonObject;
  duration: number;
}

// --- THE TRI-AGENTIC MIND ---

export enum MindPersona {
  BEEP = 'BEEP', 
  AEGIS = 'AEGIS', 
  LOOM = 'LOOM'  
}

// --- PROJECT MAGENTA KI: CONSTITUTION ---

export interface ConstitutionalPrinciple {
    id: string;
    title: string;
    mandate: string;
    governedBehaviors: string[];
    riskMitigated: string;
    status: 'ENFORCED' | 'AUDITING' | 'PENDING';
}

// --- USERS & AUTH ---

export type Covenant = 'motion' | 'silence';

export interface User {
  id: string;
  name: string;
  color: string;
  syndicateId: string;
  cursor?: { x: number; y: number };
  calibrationScore: number; 
  selectedAgentId?: string | null;
}

// --- XI ECONOMY ENHANCEMENTS ---

export type PactTier = 'Apprentice' | 'Artisan' | 'Priesthood';

export enum BoonType {
  XI = 'Ξ',          
  POTENTIAL = 'Φ',   
  CHAOS_CARD = 'CC', 
  RESONANCE = 'PMR'  
}

export interface CurrentUser extends User {
  covenant: Covenant;
  xiBalance: number;
  phiBalance: number; 
  resonanceScore: number;
  mythosTitles: string[];
  titheRate: number; 
  pact: PactTier;
  cogniOpsRemaining: number;
  cogniOpsLimit: number;
  hasOnboarded: boolean;
  ageOfAscension: boolean; 
}

// --- CHAOS DECK PROTOCOLS ---

export enum ChaosCardClass {
  Class1 = 'Aesthetic Aberrations',
  Class2 = 'Agentic Whims',
  Class3 = 'Systemic Tremors',
  Class4 = 'Syndicate Invocations'
}

export interface ChaosCard {
  id: string;
  name: string;
  class: ChaosCardClass;
  cost: number;
  description: string;
  systemEffect: string;
  duration: number; 
  visualKey?: string;
}

export interface ActiveChaosEffect {
  cardId: string;
  startTime: number;
  endTime: number;
  visualKey?: string;
}

// --- COALA MEMORY MODULES ---

export interface MemoryStore {
    working: string;      
    episodic: string[];   
    semantic: string[];   
    procedural: string[]; 
}

// --- AGENTIC WORKFLOW & SHARDS ---

export enum AgentType {
    CognitiveCore = 'Cognitive Core',
    DataTransformer = 'Data Transformer',
    ApiCall = 'API Call',
    Condition = 'Condition',
    Input = 'Input',
    Output = 'Output',
    KnowledgeRetrieval = 'Knowledge Retrieval',
    WebScraper = 'WebScraper',
    Router = 'Router',
    EmailAction = 'Email Action',
    CampaignManager = 'Campaign Manager',
    Copywriter = 'Copywriter',
    SEOAnalyzer = 'SEO Analyzer',
    SocialPoster = 'Social Poster',
    BrandGuard = 'Brand Guard',
    CMSPublisher = 'CMS Publisher',
    AnalyticsTracker = 'Analytics Tracker',
    CodeExecution = 'Code Execution',
    WasmExecutor = 'WASM Executor',
    Notification = 'Notification',
    Prompt = 'Prompt',
    Start = 'Start',
    End = 'End',
    Trigger = 'Trigger',
    ManualTask = 'Manual Task',
    CronTrigger = 'Cron Trigger',
    ImageGeneration = 'Image Generation',
    ImageEditing = 'Image Editing',
    VisionAnalysis = 'Vision Analysis',
    MicroApp = 'Micro-App',
    MCP_Bridge = 'MCP Bridge',
    Vortex_Vanguard = 'Vortex Vanguard',
}

export enum AgentStatus {
    Idle = 'Idle',
    Pending = 'Pending',
    Running = 'Running',
    Success = 'Success',
    Error = 'Error',
    OPERATIONAL = 'Operational',
    DEGRADED = 'Degraded',
    TERMINATED = 'Terminated',
    COMPILING = 'Compiling',
    WAITING_FOR_HUMAN = 'Waiting for Human'
}

export type AgentMood = 'Ebullient' | 'Pensive' | 'Faltering' | 'Dormant';

export interface Moodlet {
    name: string;
    valence: 'Positive' | 'Negative' | 'Neutral';
    intensity: number; 
    source: string;
    decayRate: number;
}

export interface Agent {
  id: string;
  syndicateId: string;
  kind: 'agent';
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  position: { x: number; y: number };
  data: JsonObject;
  outputData: JsonObject | null; 
  metrics: {
    clarity: number;
    celerity: number; 
    acuity: number;
    resilience: number;
    iqi: number; 
  };
  needs: {
    cognitive: number; 
    data: number;      
    social: number;    
    integrity: number; 
  };
  memory: MemoryStore; 
  moodlets: Moodlet[];
  mood: AgentMood;
  persona?: string;
  model?: string;
  avatar?: string;
  specialization?: string;
  role?: string;
  goals?: string[];
  crewId?: string;
  isVeiled: boolean;
  interactionStyle?: InteractionStyle;
  room?: string;
}

export interface Connection {
  id: string;
  syndicateId: string;
  from: { agentId: string; portId: string };
  to: { agentId: string; portId: string };
}

export interface Crew {
  id: string;
  syndicateId: string;
  kind: 'crew';
  name: string;
  description?: string;
  agentIds: string[];
  color: string;
}

// --- CHAT & WIDGETS ---

export enum MessageSource {
  USER = 'USER',
  BEEP = 'BEEP',
  AEGIS = 'AEGIS', 
  SYSTEM = 'SYSTEM',
}

export interface ChatMessage {
  id: string;
  syndicateId: string;
  content: string;
  text: string;
  source: MessageSource;
  timestamp: number;
  widget?: JsonObject;
  userName: string;
  userColor?: string;
  isFinal?: boolean;
  isInputTranscription?: boolean;
  isOutputTranscription?: boolean;
  userId?: string;
  isAgent?: boolean;
  reasoningChain?: string;
  attachment?: { name: string; mimeType: string; data: string };
}

export interface GossipLogEntry {
    id: string;
    sourceAgentId: string;
    targetAgentId?: string;
    message: string;
    timestamp: number;
}

export interface Note {
    id: string;
    syndicateId: string;
    title: string;
    content: string;
    category: 'Strategy' | 'Prompts' | 'Ideas' | 'Logs' | 'Drafts';
    tags: string[];
    status: 'Active' | 'Pinned' | 'Archived';
    updatedAt: number;
}

export interface OperationTask {
    id: string;
    syndicateId: string;
    title: string;
    status: 'Pending' | 'In Progress' | 'Done' | 'Blocked';
    assignee: string;
    assigneeType?: 'Human' | 'Agent';
    due: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    description?: string;
    location?: string;
    complexity?: number; 
    estimatedHours?: number;
    energyConsumption?: number; 
}

export interface DesktopWidget {
  id: string;
  type: DesktopWidgetType;
  title: string;
  position: { x: number; y: number };
  zIndex: number;
}

export enum DesktopWidgetType {
  SwarmIntegrity = 'SwarmIntegrity',
  FinancialPulse = 'FinancialPulse',
  SystemResources = 'SystemResources',
  SyndicateOverview = 'SyndicateOverview',
  Chronicle = 'Chronicle'
}

export interface Blueprint {
    agents: { id: string; name: string; type: AgentType; relativePosition: { x: number; y: number }; data?: JsonObject; persona?: string; model?: string; description?: string }[];
    connections: { from: string; to: string; fromPort?: string }[];
}

export interface AgentTemplate {
  id: string;
  syndicateId: string;
  name: string;
  description: string;
  type: AgentType;
  persona?: string;
  model?: string;
  data: JsonObject;
  blueprint?: Blueprint;
  specialization?: string;
  goals?: string[];
}

export type KlepsydraState = 'Flow' | 'Anxiety' | 'Boredom';

export interface KlepsydraMetric {
  flowScore: number;
  state: KlepsydraState;
  streak: number;
  lastActionTimestamp: number;
}

export enum WidgetType {
  INVOICE = 'INVOICE',
  ONBOARDING = 'ONBOARDING',
  CASH_FLOW = 'CASH_FLOW',
  DIAGNOSTICS = 'DIAGNOSTICS',
  NAVIGATION = 'NAVIGATION',
  TASK = 'TASK',
  SECURITY_ALERT = 'SECURITY_ALERT',
  MORNING_BRIEF = 'MORNING_BRIEF',
  /** Inline editable CRM contact card micro-frontend (spec §2.2, §5) */
  CRM_CONTACT = 'CRM_CONTACT',
  /** Inline revenue / pipeline chart micro-frontend (spec §2.2) */
  REVENUE_CHART = 'REVENUE_CHART',
  /** Conversational scaffolding workflow preview (spec §3.3) */
  WORKFLOW_SCAFFOLD = 'WORKFLOW_SCAFFOLD',
  GALAXY_STRATEGIC = 'GALAXY_STRATEGIC',
  PVP_BATTLE = 'PVP_BATTLE',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
}

export interface WidgetData {
  type: WidgetType;
}

export interface InvoiceWidgetData extends WidgetData {
  invoiceNumber: string;
  clientName: string;
  status: string;
  amount: number;
  milestoneName?: string;
}

export interface OnboardingWidgetData extends WidgetData {
  contractorName: string;
  accessStatus: string;
  payrollStatus: string;
}

export interface CashFlowWidgetData extends WidgetData {
  title: string;
  data: { label: string; value: number }[];
}

export interface DiagnosticsWidgetData extends WidgetData {
  systems: { name: string; status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE'; details: string }[];
}

export interface NavigationWidgetData extends WidgetData {
  text: string;
  targetView: View;
}

export interface TaskWidgetData extends WidgetData {
  taskName: string;
  assignee: string;
  dueDate: string;
  location?: string;
  priority?: OperationTask['priority'];
}

export interface SecurityAlertWidgetData extends WidgetData {
  severity: string;
  alertTitle: string;
  description: string;
  timestamp: string;
  recommendedAction: string;
}

export interface MorningBriefWidgetData extends WidgetData {
  date: string;
  securityStatus: string;
  operationalHighlights: string[];
  financialOutlook: string;
}

/** Inline CRM contact card — editable micro-frontend rendered in the Activity Stream (spec §2.2, §5). */
export interface CrmContactWidgetData extends WidgetData {
  contactId?: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  phone?: string;
  dealStage?: string;
  dealValue?: number;
  lastActivity?: string;
  score?: number;
  avatarColor?: string;
  tags?: string[];
}

/** Inline revenue / pipeline chart micro-frontend rendered in the Activity Stream (spec §2.2). */
export interface RevenueChartWidgetData extends WidgetData {
  title: string;
  totalValue: number;
  currency?: string;
  breakdown: { label: string; value: number; color?: string }[];
  period?: string;
  trend?: number;
}

/** Conversational scaffolding preview — shows a partial workflow graph summary (spec §3.3). */
export interface WorkflowScaffoldWidgetData extends WidgetData {
  workflowName: string;
  description: string;
  estimatedNodes: number;
  phases: { label: string; agents: string[] }[];
  completionPct: number;
  scaffoldId?: string;
}

export interface AvailableModule {
    name: string;
    jacks: Jack[];
    data?: JsonObject;
}

export interface ModuleCategory {
    name: string;
    modules: AvailableModule[];
}

export interface ModuleData {
  id: string;
  syndicateId: string;
  name: string;
  position: { x: number; y: number };
  jacks: Jack[];
  data?: JsonObject;
}

export interface Jack {
  id: string;
  type: 'input' | 'output';
  label: string;
}

export interface JackPosition {
  x: number;
  y: number;
}

export interface Patch {
  id: string;
  syndicateId: string;
  startJack: { moduleId: string; jackId: string };
  endJack: { moduleId: string; jackId: string };
}

export interface PublishedMicroApp {
  id: string;
  syndicateId: string;
  name: string;
  description: string;
  inputs: Jack[];
  outputs: Jack[];
  modules: ModuleData[];
  patches: Patch[];
  timestamp: number;
}

export enum ChronicleEventType {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  AGENT = 'AGENT'
}

export interface ChronicleEvent {
  id: string;
  timestamp: number;
  syndicateId: string;
  type: ChronicleEventType;
  source?: string;
  message: string;
}

export interface CRMDeal {
  id: string | number;
  company: string;
  dealName: string;
  priority: 'High' | 'Medium' | 'Low';
  value: number;
  lastContact: string;
  resonance: number;
  strategy?: CRMStrategy;
}

export interface CRMStrategy {
  gambit: string;
  tactics: string[];
  riskScore: number;
  resonance: number;
}

export interface CRMContact {
  id: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  lastContact?: string;
  syndicateId: string;
  avatarColor?: string;
}

export interface CRMActivity {
  id: string;
  user: string;
  action: 'emailed' | 'called' | 'updated' | 'created';
  target: string;
  topic: string;
  timestamp: number;
  time: string;
  color: string;
}

export interface InfluenceLink {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
}

export interface WorkflowSnapshot {
  agents: Record<string, Agent>;
  connections: Connection[];
  crews: Record<string, Crew>;
}

export interface WorkflowVersion {
    id: string;
    syndicate_id: string;
    timestamp: number;
    name: string;
    description: string;
    snapshot: WorkflowSnapshot;
}

export interface TableUser {
    id: string;
    syndicate_id: string;
    name: string;
    color: string;
    covenant: Covenant;
    pact: PactTier;
    mythic_status?: { tutorial_completed: boolean; weaver_onboarded_at?: number; first_login: number };
}

export interface TableAgent {
    id: string;
    syndicate_id: string;
    name: string;
    description: string;
    type: string;
    status: AgentStatus;
    position: { x: number; y: number };
    data: JsonObject;
    output_data: JsonObject | null;
    metrics: {
        clarity: number;
        celerity: number;
        acuity: number;
        resilience: number;
        iqi: number;
    };
    needs: {
        cognitive: number;
        data: number;
        social: number;
        integrity: number;
    };
    memory: MemoryStore; 
    persona?: string;
    model?: string;
    crew_id?: string;
}

export interface TableConnection {
  id: string;
  syndicate_id: string;
  from_agent_id: string;
  from_port_id: string;
  to_agent_id: string;
  to_port_id: string;
}

export interface TableCrew {
  id: string;
  syndicate_id: string;
  name: string;
  description?: string;
  agent_ids: string[];
  color: string;
}

export interface TableCRMDeal {
  $id: string;
  syndicate_id: string;
  company: string;
  deal_name: string;
  priority: string;
  value: number;
  stage: string;
  last_contact: string;
  resonance: number;
  strategy_json?: string;
}

export interface TableCRMActivity {
  $id: string;
  syndicate_id: string;
  user_name: string;
  action: string;
  target: string;
  topic: string;
  timestamp: number;
}

export interface TableCRMContact {
  $id: string;
  syndicate_id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  last_contact: string;
}

export interface TablePurchaseOrder {
  $id: string;
  syndicate_id: string;
  po_number: string;
  vendor: string;
  amount: number;
  status: string;
  created_date: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Received' | 'Cancelled';
  createdDate: number;
}

export interface TableTreasuryTransaction {
  $id: string;
  syndicate_id: string;
  type: string;
  description: string;
  amount: number;
  timestamp: number;
}

export interface TreasuryTransaction {
  id: string;
  type: 'debit' | 'credit' | 'accrual' | 'transmutation';
  description: string;
  amount: number;
  timestamp: number;
}

export interface EconomyGovernance {
  baseRTR: number;
  pityBoonThreshold: number;
  transmutationTithe: number;
  tributeVelocity: number;
}

export interface TableNote {
  $id: string;
  syndicate_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  updated_at: string;
}

export interface TableTask {
  $id: string;
  syndicate_id: string;
  title: string;
  status: OperationTask['status'];
  assignee: string;
  assignee_type: string;
  due_date: string;
  priority: OperationTask['priority'];
  location?: string;
  complexity?: number;
  estimated_hours?: number;
}

export interface TableForgeModule {
    $id: string;
    syndicate_id: string;
    name: string;
    position: { x: number; y: number };
    jacks: Jack[];
    data: JsonObject;
}

export interface TableForgePatch {
    $id: string;
    syndicate_id: string;
    start_jack: { module_id: string; jack_id: string };
    end_jack: { module_id: string; jack_id: string };
}

export interface TablePublishedMicroApp {
    $id: string;
    syndicate_id: string;
    name: string;
    description: string;
    inputs: Jack[];
    outputs: Jack[];
    modules: ModuleData[];
    patches: Patch[];
    timestamp: number;
}

export interface Soul {
  id: string;
  name: string;
  covenant: Covenant;
  tributeVelocity: number;
  psycheMatrix: {
    frustration: number;
    engagement: number;
    anxiety: number;
    lastAgentFsCall: number;
  };
  coordinates: { x: number; y: number };
  status: 'active' | 'alert' | 'idle';
}

export interface KlepsydraOutcome {
  transactionId: string;
  instrumentType: string;
  complexityMultiplier: number;
  efficiencyScore: number;
  boonAmount: number;
  boonType: BoonType; 
  rewardFormula: string;
  narrativeTrigger: string;
  chaosCardActive?: ChaosCard; 
  isSecondWind: boolean;
  updatedLseCounter: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface SREParams {
  A: number;
  f: number;
  phi: number;
  baseComplexity: number;
}

export interface PulseProfile {
  userId: string;
  archetype: string;
  sreParams: SREParams;
  lseCounter: number;
  lastEventTimestamp: number;
  lastResolvedPhase?: string;
}

export interface AgentSuggestion {
    type: AgentType;
    name: string;
    description: string;
}

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  type: string;
  duration: number;
  status: 'SUCCESS' | 'FAILURE';
  metadata?: JsonObject;
}

export interface InfraMetric {
  latency: number;
  throughput: number;
  errorRate: number;
  neuralLoad: number;
  activeNodes: number;
  totalTokens: number;
  costEstimate: number;
}

export type ShardType = 'Mycelium' | 'Weaver' | 'Obelisk';