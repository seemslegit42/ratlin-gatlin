
import React, { useState } from 'react';
import { PurchaseOrderList } from '../../components/procurement/PurchaseOrderList';
import { SupplierRiskMatrix } from '../../components/procurement/SupplierRiskMatrix';
import { SpendCategoryChart, ContractRenewals, SavingsTracking } from '../../components/procurement/SpendAnalytics';
import BackButton from '../../components/shared/BackButton';
import type { View, PurchaseOrder } from '../../types';
import CreatePurchaseOrderModal from '../../components/procurement/CreatePurchaseOrderModal'; 

interface ProcurementViewProps {
    onNavigate: (view: View) => void;
    purchaseOrders: PurchaseOrder[];
    addPurchaseOrder: (newPoData: Omit<PurchaseOrder, 'id' | 'createdDate'>) => void;
}

const ProcurementView: React.FC<ProcurementViewProps> = ({ onNavigate, purchaseOrders, addPurchaseOrder }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreatePurchaseOrder = (newPoData: any) => {
        addPurchaseOrder(newPoData);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 high-density">
            <div className="flex items-center space-x-4 mb-2">
                <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
            </div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        Procurement
                    </h1>
                    <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1">SOURCING // VENDORS // ORDERS</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-lg text-xs font-bold hover:bg-orange-500/30 transition-all"
                >
                    + Create PO
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PurchaseOrderList orders={purchaseOrders} />
                <SupplierRiskMatrix />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SpendCategoryChart />
                <ContractRenewals />
                <SavingsTracking />
            </div>

            <CreatePurchaseOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreatePo={handleCreatePurchaseOrder}
            />
        </div>
    );
};

export default ProcurementView;
