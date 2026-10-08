/**
 * @file hooks/useCodexState.ts
 * @description Manages persistence and state for The Codex.
 * Handles unstructured shards (notes) with real-time Appwrite integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import type { Note } from '../types.js';
import { nanoid } from 'nanoid';

const mapDBToNote = (dbNote: any): Note => ({
    id: dbNote.$id,
    syndicateId: dbNote.syndicate_id,
    title: dbNote.title,
    content: dbNote.content,
    category: dbNote.category as any,
    tags: dbNote.tags ? JSON.parse(dbNote.tags) : [],
    status: dbNote.status as any,
    updatedAt: new Date(dbNote.updated_at).getTime()
});

const mapNoteToDB = (note: Note) => ({
    syndicate_id: note.syndicateId,
    title: note.title,
    content: note.content,
    category: note.category,
    tags: JSON.stringify(note.tags),
    status: note.status,
    updated_at: new Date().toISOString()
});

/**
 * Hook for managing textual shards within a syndicate.
 * @param syndicateId - Isolation ID.
 */
export const useCodexState = (
  syndicateId: string,
  authenticatedUserId?: string | null,
) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        if (!syndicateId) return;
        setIsLoading(true);
        try {
            const { rows } = await tablesDB.listRows(
                DATABASE_ID,
                TABLES.NOTES,
                [Query.equal('syndicate_id', syndicateId), Query.orderDesc('updated_at')]
            );
            setNotes(rows.map(mapDBToNote));
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [syndicateId]);

    useEffect(() => {
        if (!syndicateId || !authenticatedUserId) return;
        
        fetchNotes();
        
        const channel = `databases.${DATABASE_ID}.collections.${TABLES.NOTES}.documents`;
        const unsubscribe = client.subscribe(channel, (response) => {
            const record = response.payload as any;
            if (record.syndicate_id === syndicateId) {
                fetchNotes();
            }
        });
        
        return () => { unsubscribe(); };
    }, [syndicateId, authenticatedUserId, fetchNotes]);

    /**
     * Persists or updates a shard in the Codex.
     */
    const saveNote = useCallback(async (note: Partial<Note>) => {
        const id = note.id || nanoid();
        const noteToSave: Note = {
            id, syndicateId,
            title: note.title || 'Untitled Shard', content: note.content || '',
            category: note.category || 'Drafts', tags: note.tags || [],
            status: note.status || 'Active', updatedAt: Date.now()
        };
        
        setNotes(prev => [noteToSave, ...prev.filter(n => n.id !== id)].sort((a, b) => b.updatedAt - a.updatedAt));
        
        try {
            if (note.id) {
                await tablesDB.updateRow(DATABASE_ID, TABLES.NOTES, id, mapNoteToDB(noteToSave));
            } else {
                await tablesDB.createRow(DATABASE_ID, TABLES.NOTES, id, mapNoteToDB(noteToSave));
            }
        } catch (error) {
            console.error("Error saving note:", error);
            // In a more robust scenario, we could revert if it fails.
            // If it's a create failure maybe it exists already, try to upsert.
        }
        
        return noteToSave;
    }, [syndicateId]);

    /**
     * Purges a shard from memory and disk.
     */
    const deleteNote = useCallback(async (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        try {
            await tablesDB.deleteRow(DATABASE_ID, TABLES.NOTES, id);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    }, []);

    return { notes, saveNote, deleteNote, isLoading };
};
