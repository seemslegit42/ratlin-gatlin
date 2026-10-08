
/**
 * @file components/procurement/CreatePurchaseOrderModal.tsx
 * @description Modal component for creating a new purchase order.
 */

import React, { useState } from 'react';
import Modal from '../shared/Modal';
import type { PurchaseOrder } from '../../types';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePo: (newPo: Omit<PurchaseOrder, 'id' | 'createdDate'>) => void;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({ isOpen, onClose, onCreatePo }) => {
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [poNumber, setPoNumber] = useState('');
  const [status, setStatus] = useState<PurchaseOrder['status']>('Pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || amount === '' || !poNumber.trim()) {
      // Basic validation
      alert('Please fill in all required fields.');
      return;
    }

    onCreatePo({
      vendor,
      amount: Number(amount),
      poNumber,
      status,
    });

    // Reset form fields
    setVendor('');
    setAmount('');
    setPoNumber('');
    setStatus('Pending');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Purchase Order">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vendorName" className="block text-xs font-bold text-text-secondary uppercase mb-1">Vendor Name</label>
          <input
            type="text"
            id="vendorName"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="w-full bg-input-bg border border-glass-border rounded-md p-2 text-sm text-vitreous-white focus:ring-1 focus:ring-orange-400"
            placeholder="e.g. Acme Supplies"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-xs font-bold text-text-secondary uppercase mb-1">Amount ($)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-input-bg border border-glass-border rounded-md p-2 text-sm text-vitreous-white focus:ring-1 focus:ring-orange-400"
            placeholder="e.g. 15000"
            required
            min="0"
          />
        </div>

        <div>
          <label htmlFor="poNumber" className="block text-xs font-bold text-text-secondary uppercase mb-1">PO Number</label>
          <input
            type="text"
            id="poNumber"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            className="w-full bg-input-bg border border-glass-border rounded-md p-2 text-sm text-vitreous-white focus:ring-1 focus:ring-orange-400"
            placeholder="e.g. PO-2024-004"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-xs font-bold text-text-secondary uppercase mb-1">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PurchaseOrder['status'])}
            className="w-full bg-input-bg border border-glass-border rounded-md p-2 text-sm text-vitreous-white focus:ring-1 focus:ring-orange-400"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Shipped">Shipped</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            Create PO
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePurchaseOrderModal;
