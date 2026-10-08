/**
 * @file hooks/useProcurementState.ts
 * @description State hook for the Procurement module.
 * Manages the lifecycle of Purchase Orders (POs) and vendor relations.
 */

import { useCallback, useState, useEffect } from 'react';
import type { PurchaseOrder } from '../types.js';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import { nanoid } from 'nanoid';

const mapDBToPO = (dbPO: any): PurchaseOrder => ({
    id: dbPO.$id,
    poNumber: dbPO.po_number,
    vendor: dbPO.vendor,
    amount: dbPO.amount,
    status: dbPO.status as PurchaseOrder['status'],
    createdDate: dbPO.created_date
});

/**
 * Manages procurement data with syndicate isolation.
 * @param syndicateId - The target tenant ID.
 */
export const useProcurementState = (
  syndicateId: string,
  authenticatedUserId?: string | null,
) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const fetchPOs = useCallback(async () => {
      if (!syndicateId) return;
      try {
        const { rows } = await tablesDB.listRows(
          DATABASE_ID,
          TABLES.PROCUREMENT_ORDERS,
          [Query.equal('syndicate_id', syndicateId), Query.orderDesc('created_date')]
        );
        setPurchaseOrders(rows.map(mapDBToPO));
      } catch (error) {
        console.error('Error fetching procurement orders:', error);
      }
  }, [syndicateId]);

  useEffect(() => {
      if (!syndicateId || !authenticatedUserId) return;
      
      fetchPOs();
      
      const channel = `databases.${DATABASE_ID}.collections.${TABLES.PROCUREMENT_ORDERS}.documents`;
      const unsubscribe = client.subscribe(channel, (response) => {
          const record = response.payload as any;
          if (record.syndicate_id === syndicateId) {
             fetchPOs();
          }
      });
      
      return () => { unsubscribe(); };
  }, [syndicateId, authenticatedUserId, fetchPOs]);

  /**
   * Instantiates a new Purchase Order in the ledger.
   */
  const addPurchaseOrder = useCallback(async (newPoData: Omit<PurchaseOrder, 'id' | 'createdDate'>) => {
      const poId = nanoid();
      const newPOData = {
          syndicate_id: syndicateId, 
          po_number: newPoData.poNumber,
          vendor: newPoData.vendor, 
          amount: newPoData.amount, 
          status: newPoData.status,
          created_date: Date.now()
      };
      
      // Optimistically update UI
      const optimisticPO = {
          $id: poId,
          ...newPOData
      };
      setPurchaseOrders(prev => [mapDBToPO(optimisticPO), ...prev]);
      
      try {
        await tablesDB.createRow(
          DATABASE_ID,
          TABLES.PROCUREMENT_ORDERS,
          poId,
          newPOData
        );
      } catch (error) {
        // Revert optimistic update on error
        setPurchaseOrders(prev => prev.filter(po => po.id !== poId));
        throw error;
      }
  }, [syndicateId]);

  return { purchaseOrders, addPurchaseOrder };
};
