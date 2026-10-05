import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { FloorTable } from '../../types/restaurant';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { motion } from 'motion/react';
import {
  Users,
  Receipt,
  UtensilsCrossed,
  X,
} from 'lucide-react';

interface FloorPlan2DProps {
  onSelectTableForPOS: (tableNum: number) => void;
  onOpenBillForTable: (tableNum: number) => void;
}

export const FloorPlan2D: React.FC<FloorPlan2DProps> = ({
  onSelectTableForPOS,
  onOpenBillForTable,
}) => {
  const { floorTables, orders, updateTableStatus, settings, theme } = useRestaurant();
  const isDark = theme === 'dark';

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activeTable, setActiveTable] = useState<FloorTable | null>(null);

  const zones = [
    { id: 'all', label: 'Toutes les zones' },
    { id: 'salle', label: 'Salle Principale' },
    { id: 'terrasse', label: 'Terrasse Extérieure' },
  ];

  const filteredTables = floorTables.filter(
    t => selectedZone === 'all' || t.zone === selectedZone
  );

  const getStatusColor = (status: FloorTable['status']) => {
    switch (status) {
      case 'free':
        return {
          bg: 'bg-emerald-50/80',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Libre',
        };
      case 'occupied':
        return {
          bg: 'bg-amber-50/80',
          border: 'border-amber-200',
          text: 'text-amber-800',
          dot: 'bg-amber-500',
          label: 'Installée',
        };
      case 'ordered':
        return {
          bg: 'bg-orange-50/80',
          border: 'border-orange-200',
          text: 'text-orange-800',
          dot: 'bg-orange-500 animate-pulse',
          label: 'Commande en cours',
        };
      case 'bill_requested':
        return {
          bg: 'bg-cyan-50/80',
          border: 'border-cyan-200',
          text: 'text-cyan-800',
          dot: 'bg-cyan-500 animate-bounce',
          label: 'Addition demandée',
        };
    }
  };

  const tableOrder = activeTable?.currentOrderId
    ? orders.find(o => o.id === activeTable.currentOrderId)
    : orders.find(o => o.tableNumber === activeTable?.id && o.status !== 'served');

  return (
    <div className={`min-h-screen flex flex-col p-4 sm:p-6 space-y-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-b from-[#0b0e14] via-[#10141f] to-[#080a0e] text-slate-100' 
        : 'bg-gradient-to-b from-[#faf6f0] via-[#f3ebe1] to-[#e8decb] text-slate-800'
    }`}>
      {/* Top Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Plan de Salle 2D Interactif
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
              {floorTables.length} Tables
            </span>
          </div>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Surveillance en temps réel de l'occupation, des services et des demandes de note.
          </p>
        </div>

        {/* Legend */}
        <div className={`flex flex-wrap items-center gap-3 text-xs border px-4 py-2 rounded-2xl shadow-sm ${
          isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white/80 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>En cours</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Addition</span>
          </div>
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex items-center gap-2">
        {zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedZone === zone.id
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : isDark
                ? 'bg-white/10 border border-white/10 text-slate-300 hover:bg-white/15'
                : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* 2D Canvas Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Grid */}
        <div className={`lg:col-span-2 p-6 rounded-[32px] border shadow-lg relative min-h-[460px] flex flex-col justify-between ${
          isDark ? 'bg-[#121622]/90 border-white/10' : 'bg-white/80 border-white'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredTables.map(table => {
              const status = getStatusColor(table.status);
              const isSelected = activeTable?.id === table.id;

              return (
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  key={table.id}
                  onClick={() => setActiveTable(table)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between h-36 ${status.bg} ${status.border} shadow-sm ${
                    isSelected ? 'ring-3 ring-[#14171d] scale-105 shadow-md' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                      <span className="text-sm font-black text-slate-900">
                        {table.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-700 bg-white/80 px-2 py-0.5 rounded-full font-bold shadow-xs">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{table.seats}p</span>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className={`text-xs font-black ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span>{table.zone === 'terrasse' ? 'Terrasse' : 'Salle'}</span>
                    {table.currentOrderId && (
                      <span className="text-amber-900 font-bold">{table.currentOrderId}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-4 text-center text-xs text-slate-500">
            Touchez une table pour afficher ses détails, modifier son état ou gérer l'addition.
          </div>
        </div>

        {/* Selected Table Detail Drawer */}
        <div className="p-6 rounded-[32px] bg-white/85 backdrop-blur-md border border-white shadow-xl space-y-6">
          {activeTable ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Fiche Table
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    {activeTable.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Capacité : {activeTable.seats} personnes · {activeTable.zone === 'terrasse' ? 'Terrasse extérieure' : 'Salle principale'}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTable(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Change Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Modifier l'état
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateTableStatus(activeTable.id, 'free')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      activeTable.status === 'free'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Libre
                  </button>

                  <button
                    onClick={() => updateTableStatus(activeTable.id, 'occupied')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      activeTable.status === 'occupied'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Occupée
                  </button>

                  <button
                    onClick={() => updateTableStatus(activeTable.id, 'ordered')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      activeTable.status === 'ordered'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Commande en cours
                  </button>

                  <button
                    onClick={() => updateTableStatus(activeTable.id, 'bill_requested')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      activeTable.status === 'bill_requested'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Addition demandée
                  </button>
                </div>
              </div>

              {/* Current Order info if any */}
              {tableOrder ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Bon {tableOrder.id}</span>
                    <span className="text-amber-800 font-mono font-bold">{formatTime(tableOrder.createdAt)}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {tableOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-slate-700">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono text-slate-900 font-bold">
                          {formatCurrency(item.itemTotal, settings.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-slate-900">
                    <span>Total TTC</span>
                    <span className="text-slate-900 font-mono text-sm">
                      {formatCurrency(tableOrder.totalTTC + tableOrder.tipAmount, settings.currency)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                  Aucune commande active rattachée à cette table.
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onSelectTableForPOS(activeTable.id)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#14171d] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-300" />
                  <span>Prendre commande en Caisse (POS)</span>
                </button>

                {tableOrder && (
                  <button
                    onClick={() => onOpenBillForTable(activeTable.id)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-cyan-600" />
                    <span>Facturer / Imprimer Ticket</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl">
                🗺️
              </div>
              <p className="text-slate-800 font-bold">Aucune table sélectionnée</p>
              <p className="text-xs text-slate-500">
                Touchez une table dans le plan 2D pour ouvrir sa fiche de service.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
