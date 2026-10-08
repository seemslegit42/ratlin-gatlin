/**
 * @file hooks/useWorkflowState.ts
 * @description The primary state management orchestrator for the Weaver Studio.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
// Fix: Added missing WorkflowSnapshot to type imports
import type { Agent, Connection, Crew, AgentTemplate, ChronicleEvent, WorkflowVersion, Moodlet, AgentMood, JsonObject, WorkflowSnapshot } from '../types';
import { AgentStatus, AgentType, ChronicleEventType } from '../types';
import { tablesDB, DATABASE_ID, TABLES, Query, client, storage, BUCKETS } from '../services/appwriteClient.js';
import { instantiateBlueprint, createAgent } from '../services/agentFactory';
import { runImageGeneration, generateMythicPrompt } from '../services/ollamaService';

// --- Constants for Collision Detection ---
const NODE_WIDTH = 340; // Increased width buffer (256px visual + ~80px padding)
const NODE_HEIGHT = 240; // Increased height buffer (~140px visual + ~100px padding)

// --- Mapping Helpers ---

const safeStringify = (value: unknown): string => {
    try {
        return JSON.stringify(value ?? null);
    } catch {
        return JSON.stringify(null);
    }
};

const safeParseJson = <T,>(value: unknown, fallback: T): T => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return fallback;
        try {
            return JSON.parse(trimmed) as T;
        } catch {
            return fallback;
        }
    }
    return value as T;
};

const mapAgentToDB = (agent: Agent) => {
  const persistenceData = { ...agent.data };
  
  persistenceData.avatar = agent.avatar;
  persistenceData.mood = agent.mood;
  persistenceData.specialization = agent.specialization;
  persistenceData.role = agent.role;
  persistenceData.goals = agent.goals;
  persistenceData.isVeiled = agent.isVeiled;

  return {
    id: agent.id,
    syndicate_id: agent.syndicateId,
    name: agent.name,
    description: agent.description,
    type: agent.type,
    status: agent.status,
        position: safeStringify(agent.position),
    data: JSON.stringify(persistenceData),
        output_data: safeStringify(agent.outputData),
        metrics: safeStringify(agent.metrics),
        needs: safeStringify(agent.needs),
    persona: agent.persona,
    model: agent.model,
    crew_id: agent.crewId
  };
};

const mapDBToAgent = (dbAgent: any): Agent => {
  const data = dbAgent.data ? (typeof dbAgent.data === 'string' ? JSON.parse(dbAgent.data) : dbAgent.data) : {};
  return {
    id: dbAgent.$id,
    syndicateId: dbAgent.syndicate_id,
    kind: 'agent',
    name: dbAgent.name,
    description: dbAgent.description,
    type: dbAgent.type as AgentType,
    status: dbAgent.status,
    position: safeParseJson(dbAgent.position, { x: 0, y: 0 }),
    data: data,
    outputData: safeParseJson(dbAgent.output_data, null),
    /* Fix: Cast JsonValue to string for Agent avatar */
    avatar: (data.avatar as string) || 'golem',
    metrics: (() => {
        const parsed = safeParseJson<any>(dbAgent.metrics, null);
        return {
            clarity: parsed?.clarity ?? 100,
            celerity: parsed?.celerity ?? 100,
            acuity: parsed?.acuity ?? 100,
            resilience: parsed?.resilience ?? 100,
            iqi: parsed?.iqi ?? 50,
        };
    })(),
    /* Fix: Map database needs to the correct Agent needs properties, removing logic/creativity which are not on the type */
    needs: (() => {
        const parsed = safeParseJson<any>(dbAgent.needs, null);
        return {
            cognitive: parsed?.cognitive ?? 50,
            data: parsed?.data ?? 50,
            social: parsed?.social ?? 50,
            integrity: parsed?.integrity ?? 100,
        };
    })(),
    /** Added missing memory and moodlets properties */
    memory: dbAgent.memory || { working: '', episodic: [], semantic: [], procedural: [] },
    /* Fix: Explicitly cast JsonValue to Moodlet[] and other types to resolve linting errors by using unknown as intermediate */
    moodlets: (data.moodlets as unknown as Moodlet[]) || [],
    mood: (data.mood as AgentMood) || 'Dormant',
    specialization: (data.specialization as string) || 'General',
    persona: dbAgent.persona,
    model: dbAgent.model,
    crewId: dbAgent.crew_id,
    role: (data.role as string) || '',
    goals: (data.goals as string[]) || [],
    isVeiled: !!data.isVeiled
  };
};

const mapDBToCrew = (dbCrew: any): Crew => ({
    id: dbCrew.$id,
    syndicateId: dbCrew.syndicate_id,
    kind: 'crew',
    name: dbCrew.name,
    description: dbCrew.description,
    agentIds: Array.isArray(dbCrew.agent_ids) ? dbCrew.agent_ids : safeParseJson(dbCrew.agent_ids, [] as string[]),
    color: dbCrew.color
});

/**
 * Custom hook for managing the state and persistence of a syndicate's logical workflow graph.
 */
export const useWorkflowState = (
  syndicateId: string,
  /** Prefer `currentUser?.id`; blocks realtime + tenant fetch while logged out. */
  authenticatedUserId?: string | null,
) => {
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [crews, setCrews] = useState<Record<string, Crew>>({});
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [chronicle, setChronicle] = useState<ChronicleEvent[]>([]);
  
  const [isWorkflowExecuting, setIsWorkflowExecuting] = useState(false);
  const [history, setHistory] = useState<{agents: Record<string, Agent>, connections: Connection[], crews: Record<string, Crew>}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRestoring, setIsRestoring] = useState(false);
  const isLoaded = useRef(false);

  // --- Initial Data Load & Realtime Subscriptions ---
  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;

    const fetchInitialData = async () => {
      const [
          { rows: agentsData },
          { rows: connectionsData },
          { rows: crewsData },
          { rows: templatesData },
          { rows: versionsData },
          { rows: chronicleData }
      ] = await Promise.all([
          tablesDB.listRows(DATABASE_ID, TABLES.AGENTS, [Query.equal('syndicate_id', syndicateId), Query.limit(500)]),
          tablesDB.listRows(DATABASE_ID, TABLES.CONNECTIONS, [Query.equal('syndicate_id', syndicateId), Query.limit(500)]),
          tablesDB.listRows(DATABASE_ID, TABLES.CREWS, [Query.equal('syndicate_id', syndicateId), Query.limit(500)]),
          tablesDB.listRows(DATABASE_ID, TABLES.AGENT_TEMPLATES, [Query.equal('syndicate_id', syndicateId), Query.limit(100)]),
          tablesDB.listRows(DATABASE_ID, TABLES.WORKFLOW_VERSIONS, [Query.equal('syndicate_id', syndicateId), Query.orderDesc('timestamp'), Query.limit(100)]),
          tablesDB.listRows(DATABASE_ID, TABLES.CHRONICLE_EVENTS, [Query.equal('syndicate_id', syndicateId), Query.orderDesc('timestamp'), Query.limit(100)])
      ]);

      const mappedAgents = agentsData?.map(mapDBToAgent).reduce((acc, agent) => ({ ...acc, [agent.id]: agent }), {}) || {};
      const mappedConnections = connectionsData?.map((c: any) => ({ id: c.$id, syndicateId: c.syndicate_id, from: { agentId: c.from_agent_id, portId: c.from_port_id }, to: { agentId: c.to_agent_id, portId: c.to_port_id } })) || [];
      const mappedCrews = crewsData?.map(mapDBToCrew).reduce((acc, crew) => ({ ...acc, [crew.id]: crew }), {}) || {};
      const mappedTemplates = templatesData?.map((t: any) => ({ id: t.$id, syndicateId: t.syndicate_id, name: t.name, description: t.description, type: t.type as AgentType, persona: t.persona, model: t.model, data: typeof t.data === 'string' ? JSON.parse(t.data) : t.data, blueprint: t.blueprint })) || [];
      const mappedVersions = versionsData?.map((v: any) => ({ id: v.$id, syndicate_id: v.syndicate_id, timestamp: v.timestamp, name: v.name, description: v.description, snapshot: typeof v.snapshot === 'string' ? JSON.parse(v.snapshot) : v.snapshot })) || [];
      const mappedChronicle = chronicleData?.map((e: any) => ({ id: e.$id, timestamp: e.timestamp, syndicateId: e.syndicate_id, type: e.type, source: e.source, message: e.message })) || [];

      setAgents(mappedAgents);
      setConnections(mappedConnections as Connection[]);
      setCrews(mappedCrews as Record<string, Crew>);
      setTemplates(mappedTemplates);
      setVersions(mappedVersions as WorkflowVersion[]);
      setChronicle(mappedChronicle as ChronicleEvent[]);

      if (!isLoaded.current) { 
          if (Object.keys(mappedAgents).length === 0 && mappedConnections.length === 0) {
              const seed = generateSeedState(syndicateId);
              setAgents(seed.agents);
              setConnections(seed.connections);
              for (const a of Object.values(seed.agents)) { await tablesDB.createRow(DATABASE_ID, TABLES.AGENTS, a.id, mapAgentToDB(a)); }
              for (const c of seed.connections) { await tablesDB.createRow(DATABASE_ID, TABLES.CONNECTIONS, c.id, { 
                  id: c.id, 
                  syndicate_id: c.syndicateId, 
                  from_agent_id: c.from.agentId, 
                  from_port_id: c.from.portId, 
                  to_agent_id: c.to.agentId, 
                  to_port_id: c.to.portId 
              });}
          }
          isLoaded.current = true;
      }
      setHistory([{ agents: mappedAgents as Record<string, Agent>, connections: mappedConnections as Connection[], crews: mappedCrews as Record<string, Crew> }]);
      setHistoryIndex(0);
    };

    void fetchInitialData();

    // --- Subscriptions ---
    const agentsSub = client.subscribe(`databases.${DATABASE_ID}.collections.${TABLES.AGENTS}.documents`, payload => {
        const record = payload.payload as any;
        if (record.syndicate_id !== syndicateId) return;
        if (payload.events.some(e => e.includes('.delete'))) {
            setAgents(prev => { const next = { ...prev }; delete next[record.$id]; return next; });
        } else {
            setAgents(prev => ({ ...prev, [record.$id]: mapDBToAgent(record) }));
        }
    });
        
    const connectionsSub = client.subscribe(`databases.${DATABASE_ID}.collections.${TABLES.CONNECTIONS}.documents`, payload => {
        const record = payload.payload as any;
        if (record.syndicate_id !== syndicateId) return;
        if (payload.events.some(e => e.includes('.delete'))) {
            setConnections(prev => prev.filter(c => c.id !== record.$id));
        } else if (payload.events.some(e => e.includes('.create'))) {
            setConnections(prev => {
                if (prev.some(c => c.id === record.$id)) return prev;
                return [...prev, { 
                    id: record.$id, 
                    syndicateId: record.syndicate_id, 
                    from: { agentId: record.from_agent_id, portId: record.from_port_id }, 
                    to: { agentId: record.to_agent_id, portId: record.to_port_id } 
                }];
            });
        }
    });

    const crewsSub = client.subscribe(`databases.${DATABASE_ID}.collections.${TABLES.CREWS}.documents`, payload => {
        const record = payload.payload as any;
        if (record.syndicate_id !== syndicateId) return;
        if (payload.events.some(e => e.includes('.delete'))) {
            setCrews(prev => { const next = { ...prev }; delete next[record.$id]; return next; });
        } else {
            setCrews(prev => ({ ...prev, [record.$id]: mapDBToCrew(record) }));
        }
    });

    const versionsSub = client.subscribe(`databases.${DATABASE_ID}.collections.${TABLES.WORKFLOW_VERSIONS}.documents`, payload => {
        const record = payload.payload as any;
        if (record.syndicate_id !== syndicateId) return;
        if (payload.events.some(e => e.includes('.delete'))) {
            setVersions(prev => prev.filter(v => v.id !== record.$id));
        } else if (payload.events.some(e => e.includes('.create'))) {
            setVersions(prev => [{ 
                id: record.$id, 
                syndicate_id: record.syndicate_id,
                timestamp: record.timestamp,
                name: record.name,
                description: record.description,
                snapshot: typeof record.snapshot === 'string' ? JSON.parse(record.snapshot) : record.snapshot
            } as WorkflowVersion, ...prev]);
        }
    });
    
    // Sub for templates
    const templatesSub = client.subscribe(`databases.${DATABASE_ID}.collections.${TABLES.AGENT_TEMPLATES}.documents`, payload => {
         const t = payload.payload as any;
         if (t.syndicate_id !== syndicateId) return;
         if (payload.events.some(e => e.includes('.delete'))) {
             setTemplates(prev => prev.filter(tmpl => tmpl.id !== t.$id));
         } else if (payload.events.some(e => e.includes('.create'))) {
             const newTemplate = { id: t.$id, syndicateId: t.syndicate_id, name: t.name, description: t.description, type: t.type as AgentType, persona: t.persona, model: t.model, data: typeof t.data === 'string' ? JSON.parse(t.data) : t.data, blueprint: typeof t.blueprint === 'string' ? JSON.parse(t.blueprint) : t.blueprint };
             setTemplates(prev => [...prev, newTemplate]);
         }
    });

    return () => { 
        agentsSub();
        connectionsSub();
        crewsSub();
        versionsSub();
        templatesSub();
    };
  }, [syndicateId, authenticatedUserId]);

  const takeSnapshot = useCallback(() => {
    if (isRestoring) return;
    setHistory(prev => {
        const nextState = { agents, connections, crews };
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(nextState);
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [agents, connections, crews, historyIndex, isRestoring]);

  /**
   * Logs an event to the Chronicle and persists it to the database.
   */
  const logEvent = useCallback((event: Omit<ChronicleEvent, 'id' | 'timestamp' | 'syndicateId'>) => {
    const newEvent: ChronicleEvent = {
        ...event,
        id: nanoid(),
        timestamp: Date.now(),
        syndicateId: syndicateId
    };
    setChronicle(prev => [newEvent, ...prev].slice(0, 100));
    tablesDB.createRow(DATABASE_ID, TABLES.CHRONICLE_EVENTS, nanoid(), {
        syndicate_id: syndicateId,
        type: event.type,
        source: event.source,
        message: event.message,
        timestamp: newEvent.timestamp
    }).catch(e => console.error(e));
  }, [syndicateId]);

  /**
   * Internal helper to synthesize an avatar for an agent.
   */
  const synthesizeAgentAvatar = useCallback(async (agent: Agent) => {
    try {
        const prompt = generateMythicPrompt(agent.name, agent.type, agent.description);
        const result = await runImageGeneration(prompt);
        if (result.error) throw new Error(result.error);

        const base64Data = result.data;
        const blob = await (await fetch(`data:${result.mimeType};base64,${base64Data}`)).blob();
        const fileName = `${agent.id}-avatar-${Date.now()}.png`;

        const file = new File([blob], fileName, { type: result.mimeType });
        await storage.createFile(BUCKETS.AVATARS, nanoid(), file);

        

        // Use the persist update path. Notice Appwrite requires project id. For now we use the storage API view URL.
        const url = storage.getFileView(BUCKETS.AVATARS, file.name) as any;
        await updateAgent(agent.id, { avatar: url.href || url }, { snapshot: false, persist: true });
        logEvent({ type: ChronicleEventType.SYSTEM, source: 'SYSTEM', message: `Visual artifact synthesized for ${agent.name}.` });
    } catch (err) {
        console.error("Avatar synthesis failed:", err);
    }
  }, [logEvent]);

  // --- Persistence Wrappers ---

  const updateAgent = useCallback(async (id: string, updates: Partial<Agent>, options: { snapshot?: boolean, persist?: boolean } = {}) => {
    const { snapshot = true, persist = true } = options;
    
    setAgents(prev => {
        const current = prev[id];
        if (!current) return prev;
        return { ...prev, [id]: { ...current, ...updates } };
    });

    if (persist) {
        setAgents(prev => {
            const fullAgent = prev[id];
            if (fullAgent) {
                void tablesDB.updateRow(DATABASE_ID, TABLES.AGENTS, id, mapAgentToDB(fullAgent));
            }
            return prev;
        });
    }

    if(snapshot) setTimeout(takeSnapshot, 50);
  }, [takeSnapshot]);

  const addConnection = useCallback(async (connection: Connection) => {
      setConnections(prev => [...prev, connection]);
      await tablesDB.createRow(DATABASE_ID, TABLES.CONNECTIONS, connection.id, {
          syndicate_id: syndicateId,
          from_agent_id: connection.from.agentId,
          from_port_id: connection.from.portId,
          to_agent_id: connection.to.agentId,
          to_port_id: connection.to.portId
      });
      takeSnapshot();
  }, [syndicateId, takeSnapshot]);

  const deleteConnection = useCallback(async (id: string) => {
      setConnections(prev => prev.filter(c => c.id !== id));
      await tablesDB.deleteRow(DATABASE_ID, TABLES.CONNECTIONS, id);
      takeSnapshot();
  }, [takeSnapshot]);

  const addCrew = useCallback(async (crew: Crew) => {
      setCrews(prev => ({ ...prev, [crew.id]: crew }));
      await tablesDB.createRow(DATABASE_ID, TABLES.CREWS, crew.id, {
          syndicate_id: syndicateId,
          name: crew.name,
          description: crew.description,
          agent_ids: crew.agentIds,
          color: crew.color
        });
      takeSnapshot();
  }, [syndicateId, takeSnapshot]);

  const updateCrew = useCallback(async (id: string, updates: Partial<Crew>) => {
      setCrews(prev => {
          const current = prev[id];
          if (!current) return prev;
          const updated = { ...current, ...updates };
          
          void tablesDB.updateRow(DATABASE_ID, TABLES.CREWS, id, {
              name: updated.name,
              description: updated.description,
              agent_ids: updated.agentIds,
              color: updated.color
          });
          
          return { ...prev, [id]: updated };
      });
      setTimeout(takeSnapshot, 50);
  }, [takeSnapshot]);

  const deleteCrew = useCallback(async (id: string) => {
      setCrews(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
      });
      await tablesDB.deleteRow(DATABASE_ID, TABLES.CREWS, id);
      takeSnapshot();
  }, [takeSnapshot]);

  // --- Versioning Logic ---

  const saveVersion = useCallback(async (name: string, description: string) => {
      if (!syndicateId) return;

      const snapshot = {
          agents,
          connections,
          crews
      };

      const newVersion: WorkflowVersion = {
          id: nanoid(),
          syndicate_id: syndicateId,
          timestamp: Date.now(),
          name,
          description,
          snapshot
      };

      // Optimistic update
      setVersions(prev => [newVersion, ...prev]);

      try {
          await tablesDB.createRow(DATABASE_ID, TABLES.WORKFLOW_VERSIONS, newVersion.id, {
              syndicate_id: syndicateId,
              name,
              description,
              timestamp: newVersion.timestamp,
              snapshot: JSON.stringify(snapshot)
          });
          logEvent({ type: ChronicleEventType.SYSTEM, message: `Version '${name}' archived successfully.` });
      } catch (error) {
          console.error("Failed to save version:", error);
          logEvent({ type: ChronicleEventType.SYSTEM, message: `Failed to save version: ${(error as any).message}` });
      }
  }, [agents, connections, crews, syndicateId, logEvent]);

  const restoreVersion = useCallback(async (versionId: string) => {
      const version = versions.find(v => v.id === versionId);
      if (!version) return;

      setIsRestoring(true);
      logEvent({ type: ChronicleEventType.SYSTEM, message: `Restoring version: ${version.name}...` });

      try {
          // 1. Clear current state (Optimistic)
          setAgents({});
          setConnections([]);
          setCrews({});
          
          // 2. Clear Database (Atomic RPC)
          /* RPC reset is handled below */

          // 3. Hydrate from snapshot
          const { snapshot } = version;
          if (!snapshot) throw new Error("Empty snapshot data");

          // 4. Repopulate Database
          const eraseCurrent = async (table: string) => {
             const { rows } = await tablesDB.listRows(DATABASE_ID, table, [Query.equal('syndicate_id', syndicateId), Query.limit(100)]);
             for (const d of rows) { await tablesDB.deleteRow(DATABASE_ID, table, d.$id); }
          };
          await Promise.all([eraseCurrent(TABLES.AGENTS), eraseCurrent(TABLES.CONNECTIONS), eraseCurrent(TABLES.CREWS)]);

          const agentsToInsert = Object.values(snapshot.agents || {}).map(mapAgentToDB);
          const connectionsToInsert = (snapshot.connections || []).map(c => ({
              id: c.id,
              syndicate_id: c.syndicateId, // Using correct property for DB insertion
              from_agent_id: c.from.agentId,
              from_port_id: c.from.portId,
              to_agent_id: c.to.agentId,
              to_port_id: c.to.portId,
              created_at: new Date().toISOString()
          }));
          const crewsToInsert = Object.values(snapshot.crews || {}).map((c: Crew) => ({
              id: c.id,
              syndicate_id: c.syndicateId, // Using correct property for DB insertion
              name: c.name,
              description: c.description,
              agent_ids: c.agentIds,
              color: c.color,
              created_at: new Date().toISOString()
          }));

          for (const a of agentsToInsert) { await tablesDB.createRow(DATABASE_ID, TABLES.AGENTS, (a as any).id, a); }
          for (const c of connectionsToInsert) { await tablesDB.createRow(DATABASE_ID, TABLES.CONNECTIONS, (c as any).id, c); }
          for (const c of crewsToInsert) { await tablesDB.createRow(DATABASE_ID, TABLES.CREWS, (c as any).id, c); }

          // 5. Set State (in case subscription is slow)
          setAgents(snapshot.agents || {});
          setConnections(snapshot.connections || []);
          setCrews(snapshot.crews || {});

          logEvent({ type: ChronicleEventType.SYSTEM, message: `Version '${version.name}' restored.` });
          takeSnapshot(); // Add restore point to local undo history
      } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : "unknown error";
          console.error("Restore failed:", e);
          logEvent({ type: ChronicleEventType.SYSTEM, message: `Restore failed: ${errMsg}` });
      } finally {
          setIsRestoring(false);
      }
  }, [versions, syndicateId, logEvent, takeSnapshot]);

  const deleteVersion = useCallback(async (versionId: string) => {
      setVersions(prev => prev.filter(v => v.id !== versionId));
      await tablesDB.deleteRow(DATABASE_ID, TABLES.WORKFLOW_VERSIONS, versionId);
  }, []);

  const saveTemplate = useCallback(async (agent: Agent, name: string) => {
      const template: AgentTemplate = {
          id: nanoid(),
          syndicateId,
          name,
          description: agent.description || 'Custom Agent Template',
          type: agent.type,
          persona: agent.persona,
          model: agent.model,
          data: agent.data,
          specialization: agent.specialization,
          goals: agent.goals
      };

      // Optimistic
      setTemplates(prev => [...prev, template]);

      await tablesDB.createRow(DATABASE_ID, TABLES.AGENT_TEMPLATES, template.id, {
          syndicate_id: syndicateId,
          name: template.name,
          description: template.description,
          type: template.type,
          persona: template.persona,
          model: template.model,
          data: JSON.stringify(template.data)
      });
      
      logEvent({ type: ChronicleEventType.SYSTEM, message: `Template saved: ${name}` });
  }, [syndicateId, logEvent]);

  const deleteTemplate = useCallback(async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    await tablesDB.deleteRow(DATABASE_ID, TABLES.AGENT_TEMPLATES, id);
  }, []);

  const addAgent = useCallback(async (
    type: AgentType,
    template?: AgentTemplate,
    dropAnchor?: { x: number; y: number },
  ): Promise<Agent> => {
    let x: number;
    let y: number;

    // Explicit canvas drop placement (palette drag-drop) skips auto-layout.
    if (dropAnchor) {
      x = dropAnchor.x;
      y = dropAnchor.y;
    } else {
      // Smart Placement Algorithm
      let newNodesRelative: { x: number; y: number }[] = [];
      if (template?.blueprint) {
        newNodesRelative = template.blueprint.agents.map((a) => a.relativePosition);
      } else {
        newNodesRelative = [{ x: 0, y: 0 }];
      }

      const existingRects = Object.values(agents).map((a: Agent) => ({
        x: a.position.x,
        y: a.position.y,
        w: NODE_WIDTH,
        h: NODE_HEIGHT,
      }));

      let startX = 200;
      let startY = 200;

      if (existingRects.length > 0) {
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        existingRects.forEach((r) => {
          if (r.x > maxX) maxX = r.x;
          if (r.y < minY) minY = r.y;
          if (r.y > maxY) maxY = r.y;
        });

        if (maxX > -Infinity) {
          startX = maxX + NODE_WIDTH + 50;
          if (minY !== Infinity && maxY !== -Infinity) {
            startY = (minY + maxY) / 2;
            startY = Math.round(startY / 40) * 40;
          }
        }
      }

      x = startX;
      y = startY;
      let found = false;
      let attempts = 0;
      const maxAttempts = 500;

      while (!found && attempts < maxAttempts) {
        const collision = newNodesRelative.some((rel) => {
          const absX = x + rel.x;
          const absY = y + rel.y;

          return existingRects.some((ex) => {
            return (
              absX < ex.x + ex.w &&
              absX + ex.w > ex.x &&
              absY < ex.y + ex.h &&
              absY + ex.h > ex.y
            );
          });
        });

        if (!collision) {
          found = true;
        } else {
          const angle = 0.5 * attempts;
          const radius = 50 + 30 * attempts;
          x = startX + radius * Math.cos(angle);
          y = startY + radius * Math.sin(angle);
          attempts++;
        }
      }

      if (!found) {
        x += 500;
      }
    }

    const result = instantiateBlueprint(syndicateId, type, template, { x, y });
    setAgents(prev => ({ ...prev, ...result.agents }));
    setConnections(prev => [...prev, ...result.connections]);
    
    for (const ag of Object.values(result.agents)) { await tablesDB.createRow(DATABASE_ID, TABLES.AGENTS, ag.id, mapAgentToDB(ag)); }
    
    if (result.connections.length > 0) {
        for (const c of result.connections) {
            await tablesDB.createRow(DATABASE_ID, TABLES.CONNECTIONS, c.id, {
              syndicate_id: c.syndicateId,
              from_agent_id: c.from.agentId,
              from_port_id: c.from.portId,
              to_agent_id: c.to.agentId,
              to_port_id: c.to.portId
          });
        }
    }
    
    const mainAgent = Object.values(result.agents)[0];
    logEvent({ type: ChronicleEventType.SYSTEM, message: `Instantiated Agent: ${mainAgent.name}` });
    
    // TRIGGER AUTOMATIC AVATAR SYNTHESIS
    void synthesizeAgentAvatar(mainAgent);

    setTimeout(takeSnapshot, 50);
    return mainAgent;
  }, [syndicateId, takeSnapshot, logEvent, agents, synthesizeAgentAvatar]);

  const deleteAgent = useCallback(async (id: string) => {
    setAgents(prev => { const next = {...prev}; delete next[id]; return next; });
    setConnections(prev => prev.filter(c => c.from.agentId !== id && c.to.agentId !== id));
    await tablesDB.deleteRow(DATABASE_ID, TABLES.AGENTS, id);
    setTimeout(takeSnapshot, 50);
  }, [takeSnapshot]);

  const resetWorkspace = useCallback(async () => {
      setAgents({});
      setConnections([]);
      setCrews({});
      const eraseCurrent = async (table: string) => {
             const { rows } = await tablesDB.listRows(DATABASE_ID, table, [Query.equal('syndicate_id', syndicateId), Query.limit(100)]);
             for (const d of rows) { await tablesDB.deleteRow(DATABASE_ID, table, d.$id); }
      };
      await Promise.all([eraseCurrent(TABLES.AGENTS), eraseCurrent(TABLES.CONNECTIONS), eraseCurrent(TABLES.CREWS)]);
      takeSnapshot();
  }, [syndicateId, takeSnapshot]);

  const resetAllAgents = useCallback(async () => {
    const agentIds = Object.keys(agents);
    if (agentIds.length === 0) return;

    setAgents(prev => {
        const next = { ...prev };
        agentIds.forEach(id => {
            next[id] = { ...next[id], status: AgentStatus.Idle, outputData: null };
        });
        return next;
    });
    
    const { rows } = await tablesDB.listRows(DATABASE_ID, TABLES.AGENTS, [Query.equal('syndicate_id', syndicateId), Query.limit(100)]);
    for (const d of rows) { await tablesDB.updateRow(DATABASE_ID, TABLES.AGENTS, d.$id, { status: AgentStatus.Idle, output_data: null }); }
        
    takeSnapshot();
  }, [agents, syndicateId, takeSnapshot]);

  const duplicateAgent = useCallback(async (id: string) => {
      const agent = agents[id];
      if (!agent) return;
      
      const newAgent: Agent = {
          ...agent,
          id: nanoid(),
          name: `${agent.name} (Replicate)`,
          position: { x: agent.position.x + 40, y: agent.position.y + 40 },
          status: AgentStatus.Idle,
          outputData: null
      };
      setAgents(prev => ({ ...prev, [newAgent.id]: newAgent }));
      await tablesDB.createRow(DATABASE_ID, TABLES.AGENTS, newAgent.id, mapAgentToDB(newAgent));
      takeSnapshot();
  }, [agents, takeSnapshot]);

  return {
    agents, setAgents, connections, setConnections, crews, setCrews, templates, versions, chronicle,
    isWorkflowExecuting, setIsWorkflowExecuting,
    addAgent, updateAgent, deleteAgent, duplicateAgent,
    addConnection, deleteConnection,
    addCrew, updateCrew, deleteCrew,
    resetWorkspace, takeSnapshot,
    saveVersion, restoreVersion, deleteVersion, saveTemplate, deleteTemplate,
    logEvent, resetAllAgents,
    synthesizeAgentAvatar
  };
};

export const generateSeedState = (syndicateId: string): { agents: Record<string, Agent>, connections: Connection[] } => {
    const s1 = 'agent-1';
    const s2 = nanoid();
    const s3 = nanoid();
    const s4 = nanoid();
    const s5 = nanoid();
    const s6 = nanoid();

    return {
        agents: {
            [s1]: { 
                ...createAgent(syndicateId, AgentType.Input, undefined, { x: 100, y: 300 }), 
                id: s1, 
                name: 'Synaptic Root',
                avatar: 'brain',
                description: 'The primary conduit for Sovereign intent.',
                mood: 'Ebullient'
            },
            [s2]: { 
                ...createAgent(syndicateId, AgentType.CognitiveCore, undefined, { x: 500, y: 300 }), 
                id: s2, 
                name: 'Aetheria Core', 
                mood: 'Pensive',
                description: 'A deep-reasoning node for complex synthesis.'
            },
            [s3]: {
                ...createAgent(syndicateId, AgentType.CognitiveCore, undefined, { x: 900, y: 300 }), 
                id: s3,
                name: 'Strategic Overwatch',
                mood: 'Ebullient',
                description: 'Secondary cognitive processing unit.'
            },
            [s6]: {
                ...createAgent(syndicateId, AgentType.CognitiveCore, undefined, { x: 1300, y: 300 }),
                id: s6,
                name: 'Insight Architect',
                mood: 'Pensive',
                description: 'Advanced pattern recognition and strategy formulation.'
            },
            [s4]: {
                ...createAgent(syndicateId, AgentType.Router, undefined, { x: 500, y: 600 }),
                id: s4,
                name: 'Swarm Dispatcher',
                mood: 'Pensive',
                description: 'Routes high-velocity directives to specialized sub-swarms.'
            },
            [s5]: {
                ...createAgent(syndicateId, AgentType.Vortex_Vanguard, undefined, { x: 900, y: 600 }),
                id: s5,
                name: 'Rapid Response Unit',
                mood: 'Faltering',
                description: 'Execute tasks with maximum speed. Kinetic action node.'
            }
        },
        connections: [
            { id: nanoid(), syndicateId, from: { agentId: s1, portId: 'default' }, to: { agentId: s2, portId: 'default' } },
            { id: nanoid(), syndicateId, from: { agentId: s2, portId: 'default' }, to: { agentId: s3, portId: 'default' } },
            { id: nanoid(), syndicateId, from: { agentId: s3, portId: 'default' }, to: { agentId: s6, portId: 'default' } },
            { id: nanoid(), syndicateId, from: { agentId: s1, portId: 'default' }, to: { agentId: s4, portId: 'default' } },
            { id: nanoid(), syndicateId, from: { agentId: s4, portId: 'default' }, to: { agentId: s5, portId: 'default' } }
        ]
    };
};
