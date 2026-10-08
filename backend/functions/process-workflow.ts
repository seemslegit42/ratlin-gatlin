/**
 * @file backend/functions/process-workflow.ts
 * @description Appwrite Function to process and execute Beepin workflows
 * 
 * Triggered by: API call or scheduled event
 * Purpose: Execute workflow agents in sequence, handle data flow, manage state
 */

import { Client, Databases, ID, Query } from 'node-appwrite';

type FunctionContext = {
  req: { body?: string };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

type WorkflowExecutionBody = {
  workflowId?: string;
  syndicateId?: string;
  inputData?: Record<string, unknown>;
};

const EXECUTOR_MODE = process.env.WORKFLOW_EXECUTOR_MODE || 'stub';

const buildError = (
  res: FunctionContext['res'],
  statusCode: number,
  errorCode: string,
  message: string,
  details?: Record<string, unknown>
) =>
  res.json(
    {
      success: false,
      error: {
        type: statusCode >= 500 ? 'system' : statusCode === 403 ? 'auth' : 'validation',
        code: errorCode,
        message,
        details,
      },
    },
    statusCode
  );

const executeAgent = async (
  agent: Record<string, any>,
  executionContext: Record<string, unknown>
) => {
  if (EXECUTOR_MODE === 'stub') {
    return {
      agentId: agent.$id,
      agentName: agent.name,
      output: {},
      timestamp: new Date().toISOString(),
      metadata: {
        mode: 'stub',
        contextKeys: Object.keys(executionContext),
      },
    };
  }

  return {
    agentId: agent.$id,
    agentName: agent.name,
    output: {},
    timestamp: new Date().toISOString(),
    metadata: {
      mode: EXECUTOR_MODE,
    },
  };
};

const writeChronicleEvent = async (
  databases: Databases,
  databaseId: string,
  syndicateId: string,
  workflowId: string,
  executionLog: unknown[],
  finalContext: Record<string, unknown>
) => {
  await databases.createDocument(databaseId, 'chronicle_events', ID.unique(), {
    syndicate_id: syndicateId,
    event_type: 'workflow_executed',
    data: JSON.stringify({
      workflowId,
      executionLog,
      finalContext,
    }),
    timestamp: new Date().toISOString(),
  });
};

export default async ({ req, res, log, error }: FunctionContext) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);
  const databaseId = process.env.DATABASE_ID;

  try {
    const { workflowId, syndicateId, inputData }: WorkflowExecutionBody = JSON.parse(req.body || '{}');

    if (!databaseId) {
      return buildError(res, 500, 'MISSING_DATABASE_ID', 'Missing DATABASE_ID environment variable');
    }

    if (!workflowId || !syndicateId) {
      return buildError(res, 400, 'MISSING_REQUIRED_FIELDS', 'Missing workflowId or syndicateId', {
        required: ['workflowId', 'syndicateId'],
      });
    }

    log(`🔄 Processing workflow ${workflowId} for syndicate ${syndicateId}`);

    // 1. Fetch workflow configuration
    const workflow = await databases.getDocument(
      databaseId,
      'workflows',
      workflowId
    );

    if (workflow.syndicate_id !== syndicateId) {
      return buildError(res, 403, 'UNAUTHORIZED_WORKFLOW_ACCESS', 'Workflow does not belong to syndicate');
    }

    // 2. Fetch agents in topological order
    const agents = await databases.listDocuments(
      databaseId,
      'agents',
      [
        Query.equal('syndicate_id', syndicateId),
        Query.orderAsc('execution_order'), // Assumes column exists
      ]
    );

    log(`📋 Found ${agents.documents.length} agents`);

    // 3. Execute agents in sequence
    let executionContext: Record<string, unknown> = inputData || {};
    const executionLog: any[] = [];

    for (const agent of agents.documents) {
      log(`▶️  Executing agent: ${agent.name}`);

      try {
        const result = await executeAgent(agent, executionContext || {});

        executionLog.push(result);
        executionContext = { ...executionContext, ...(result.output || {}) };

        log(`✅ Agent ${agent.name} completed`);
      } catch (agentError) {
        error(`Agent ${agent.name} failed: ${agentError}`);
        throw agentError;
      }
    }

    // 4. Log execution to chronicle (best effort)
    try {
      await writeChronicleEvent(
        databases,
        databaseId,
        syndicateId,
        workflowId,
        executionLog,
        executionContext || {}
      );
    } catch (chronicleError: any) {
      error(`Chronicle logging failed: ${chronicleError?.message || chronicleError}`);
    }

    log('✅ Workflow execution complete');

    return res.json({
      success: true,
      workflowId,
      executionLog,
      finalContext: executionContext,
      warnings: [],
    });
  } catch (err: any) {
    error(`Workflow processing failed: ${err.message}`);
    return buildError(res, 500, 'WORKFLOW_EXECUTION_FAILED', err.message);
  }
};
