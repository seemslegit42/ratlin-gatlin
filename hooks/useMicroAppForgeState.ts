/**
 * @file hooks/useMicroAppForgeState.ts
 * @description A custom React hook to manage the state of the Micro-App Forge,
 * including modules, patch cables, and the active Code Draft.
 * Provides persistence through Appwrite and real-time collaboration syncing.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { ModuleData, Patch, PublishedMicroApp, Jack } from '../types.js';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import { ID } from 'appwrite';

// --- Mapping Helpers ---
const mapForgeModuleToDB = (module: ModuleData) => ({
  syndicate_id: module.syndicateId,
  name: module.name,
  position: JSON.stringify(module.position),
  jacks: JSON.stringify(module.jacks),
  data: module.data ? JSON.stringify(module.data) : null,
});

const mapDBToForgeModule = (dbModule: any): ModuleData => ({
  id: dbModule.$id,
  syndicateId: dbModule.syndicate_id,
  name: dbModule.name,
  position: typeof dbModule.position === 'string' ? JSON.parse(dbModule.position) : dbModule.position,
  jacks: typeof dbModule.jacks === 'string' ? JSON.parse(dbModule.jacks) : dbModule.jacks,
  data: dbModule.data ? (typeof dbModule.data === 'string' ? JSON.parse(dbModule.data) : dbModule.data) : undefined,
});

const mapForgePatchToDB = (patch: Patch) => ({
  syndicate_id: patch.syndicateId,
  start_jack: JSON.stringify({ module_id: patch.startJack.moduleId, jack_id: patch.startJack.jackId }),
  end_jack: JSON.stringify({ module_id: patch.endJack.moduleId, jack_id: patch.endJack.jackId }),
});

const mapDBToForgePatch = (dbPatch: any): Patch => {
  const start = typeof dbPatch.start_jack === 'string' ? JSON.parse(dbPatch.start_jack) : dbPatch.start_jack;
  const end = typeof dbPatch.end_jack === 'string' ? JSON.parse(dbPatch.end_jack) : dbPatch.end_jack;
  return {
    id: dbPatch.$id,
    syndicateId: dbPatch.syndicate_id,
    startJack: { moduleId: start.module_id, jackId: start.jack_id },
    endJack: { moduleId: end.module_id, jackId: end.jack_id },
  };
};

const mapPublishedMicroAppToDB = (app: PublishedMicroApp) => ({
  syndicate_id: app.syndicateId,
  name: app.name,
  description: app.description,
  inputs: JSON.stringify(app.inputs),
  outputs: JSON.stringify(app.outputs),
  modules: JSON.stringify(app.modules),
  patches: JSON.stringify(app.patches),
  timestamp: app.timestamp,
});

const mapDBToPublishedMicroApp = (dbApp: any): PublishedMicroApp => ({
  id: dbApp.$id,
  syndicateId: dbApp.syndicate_id,
  name: dbApp.name,
  description: dbApp.description,
  inputs: typeof dbApp.inputs === 'string' ? JSON.parse(dbApp.inputs) : dbApp.inputs,
  outputs: typeof dbApp.outputs === 'string' ? JSON.parse(dbApp.outputs) : dbApp.outputs,
  modules: typeof dbApp.modules === 'string' ? JSON.parse(dbApp.modules) : dbApp.modules,
  patches: typeof dbApp.patches === 'string' ? JSON.parse(dbApp.patches) : dbApp.patches,
  timestamp: dbApp.timestamp,
});

export const useMicroAppForgeState = (
  syndicateId: string,
  authenticatedUserId?: string | null,
) => {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [publishedApps, setPublishedApps] = useState<PublishedMicroApp[]>([]);
  
  // --- Active Code Draft State ---
  const [activeCode, setActiveCode] = useState<string>('// Loading Syndicate Draft...');
  const [activeAppName, setActiveAppName] = useState<string>('Untitled Protocol');
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Initial Data Load & Realtime Subscriptions ---
  const fetchInitialData = useCallback(async () => {
    if (!syndicateId) return;
    try {
      const [modulesRes, patchesRes, appsRes, draftsRes] = await Promise.all([
        tablesDB.listRows(DATABASE_ID, TABLES.MICRO_APP_MODULES, [Query.equal('syndicate_id', syndicateId)]),
        tablesDB.listRows(DATABASE_ID, TABLES.MICRO_APP_PATCHES, [Query.equal('syndicate_id', syndicateId)]),
        tablesDB.listRows(DATABASE_ID, TABLES.PUBLISHED_MICRO_APPS, [Query.equal('syndicate_id', syndicateId)]),
        tablesDB.listRows(DATABASE_ID, TABLES.MICRO_APP_DRAFTS, [Query.equal('syndicate_id', syndicateId), Query.limit(1)])
      ]);

      setModules(modulesRes.documents.map(mapDBToForgeModule));
      setPatches(patchesRes.documents.map(mapDBToForgePatch));
      setPublishedApps(appsRes.documents.map(mapDBToPublishedMicroApp));
      
      const draftData = draftsRes.documents[0];
      
      if (draftData) {
          setActiveCode(draftData.code || '// Initialize Protocol');
          setActiveAppName(draftData.name || 'Untitled Protocol');
      } else {
          // Initialize first draft if missing
          const initialCode = `// The Anvil: Initialize Protocol
import React from 'react';

export default function MicroApp() {
  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold font-comfortaa">Hello World</h1>
      <p className="text-sm opacity-70">Ready for instructions...</p>
    </div>
  );
}`;
          setActiveCode(initialCode);
          try {
              await tablesDB.createRow(
                  DATABASE_ID,
                  TABLES.MICRO_APP_DRAFTS,
                  syndicateId, 
                  {
                      syndicate_id: syndicateId,
                      name: 'Untitled Protocol',
                      code: initialCode
                  }
              );
          } catch(e) {
              console.error("Draft initialization failed", e);
          }
      }
    } catch (e) {
      console.error("Forge Initial Fetch Error", e);
    }
  }, [syndicateId]);

  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;

    void fetchInitialData();

    const channel = `databases.${DATABASE_ID}`;
    const unsubscribe = client.subscribe(
        channel,
        (response) => {
            const record = response.payload as any;
            if (record.syndicate_id !== syndicateId) return;

            const isCreate = response.events.some(e => e.includes('.create'));
            const isUpdate = response.events.some(e => e.includes('.update'));
            const isDelete = response.events.some(e => e.includes('.delete'));

            if (response.events.some(e => e.includes(`collections.${TABLES.MICRO_APP_MODULES}`))) {
                if (isCreate || isUpdate) {
                    setModules(prev => {
                        const existing = prev.filter(m => m.id !== record.$id);
                        return [...existing, mapDBToForgeModule(record)];
                    });
                } else if (isDelete) {
                    setModules(prev => prev.filter(m => m.id !== record.$id));
                }
            } else if (response.events.some(e => e.includes(`collections.${TABLES.MICRO_APP_PATCHES}`))) {
                if (isCreate || isUpdate) {
                    setPatches(prev => {
                        const existing = prev.filter(p => p.id !== record.$id);
                        return [...existing, mapDBToForgePatch(record)];
                    });
                } else if (isDelete) {
                    setPatches(prev => prev.filter(p => p.id !== record.$id));
                }
            } else if (response.events.some(e => e.includes(`collections.${TABLES.MICRO_APP_DRAFTS}`))) {
                if ((isCreate || isUpdate) && !isDraftSaving) {
                    setActiveCode(record.code);
                    setActiveAppName(record.name);
                }
            }
        }
    );

    return () => {
      unsubscribe();
    };
  }, [syndicateId, authenticatedUserId, fetchInitialData, isDraftSaving]);


  // --- Logic Graph Actions ---

  const addModule = useCallback(async (module: ModuleData) => {
    try {
      await tablesDB.createRow(DATABASE_ID, TABLES.MICRO_APP_MODULES, module.id, mapForgeModuleToDB(module));
    } catch (error) { console.error("Error adding module:", error); }
  }, []);

  const updateModule = useCallback(async (id: string, updates: Partial<ModuleData>) => {
    try {
        await tablesDB.updateRow(DATABASE_ID, TABLES.MICRO_APP_MODULES, id, mapForgeModuleToDB(updates as ModuleData));
    } catch (error) { console.error("Error updating module:", error); }
  }, []);

  const deleteModule = useCallback(async (id: string, currentPatches: Patch[]) => {
    // Delete associated patches locally first
    const patchesToDelete = currentPatches.filter(p => p.startJack.moduleId === id || p.endJack.moduleId === id);
    for (const p of patchesToDelete) {
        try {
            await tablesDB.deleteRow(DATABASE_ID, TABLES.MICRO_APP_PATCHES, p.id);
        } catch(e) {}
    }

    try {
        await tablesDB.deleteRow(DATABASE_ID, TABLES.MICRO_APP_MODULES, id);
    } catch (error) { console.error("Error deleting module:", error); }
  }, []);

  const addPatch = useCallback(async (patch: Patch) => {
    try {
        await tablesDB.createRow(DATABASE_ID, TABLES.MICRO_APP_PATCHES, patch.id, mapForgePatchToDB(patch));
    } catch (error) { console.error("Error adding patch:", error); }
  }, []);

  const deletePatch = useCallback(async (id: string) => {
    try {
        await tablesDB.deleteRow(DATABASE_ID, TABLES.MICRO_APP_PATCHES, id);
    } catch (error) { console.error("Error deleting patch:", error); }
  }, []);

  // --- Vibe Studio Actions ---

  const updateDraft = useCallback((code: string, name: string) => {
      setActiveCode(code);
      setActiveAppName(name);
      setIsDraftSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
          try {
              // Try to update using syndicateId as document ID
              await tablesDB.updateRow(DATABASE_ID, TABLES.MICRO_APP_DRAFTS, syndicateId, {
                  code: code,
                  name: name,
              });
          } catch(e) {
              // If it fails, maybe it doesn't exist yet, try creating
              try {
                  await tablesDB.createRow(DATABASE_ID, TABLES.MICRO_APP_DRAFTS, syndicateId, {
                      syndicate_id: syndicateId,
                      name: name,
                      code: code
                  });
              } catch(e2) {
                  // Both failed
              }
          } finally {
              setIsDraftSaving(false);
          }
      }, 1000); // 1s Debounce
  }, [syndicateId]);

  const publishMicroApp = useCallback(async (name: string, description: string, code: string) => {
      const inputs: Jack[] = [];
      const outputs: Jack[] = [];

      modules.forEach(mod => {
          if (mod.name === 'System Input') {
              inputs.push({ id: mod.id, type: 'input', label: (mod.data?.label as string) || mod.name });
          } else if (mod.name === 'System Output') {
              outputs.push({ id: mod.id, type: 'output', label: (mod.data?.label as string) || mod.name });
          }
      });

      const dbId = ID.unique();
      const newApp: PublishedMicroApp = {
          id: dbId,
          syndicateId,
          name,
          description,
          inputs,
          outputs,
          modules: JSON.parse(JSON.stringify(modules)), 
          patches: JSON.parse(JSON.stringify(patches)), 
          timestamp: Date.now()
      };

      try {
          await tablesDB.createRow(DATABASE_ID, TABLES.PUBLISHED_MICRO_APPS, dbId, mapPublishedMicroAppToDB(newApp));
      } catch (error) {
          console.error("Error publishing micro-app:", error);
      }

      return newApp;
  }, [modules, patches, syndicateId]);

  return {
    modules,
    patches,
    publishedApps,
    activeCode,
    activeAppName,
    isDraftSaving,
    addModule,
    updateModule,
    deleteModule: (id: string) => deleteModule(id, patches), // pass current patches to delete func
    addPatch,
    deletePatch,
    updateDraft,
    publishMicroApp,
  };
};
