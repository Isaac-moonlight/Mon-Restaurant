import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, formatTime, getElapsedMinutes } from '../../utils/formatters';
import { X, CheckCircle2, Clock, ChefHat, BellRing, Sparkles, Flame, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderStatusModalProps {
  orderId?: string;
  onClose: () => void;
  onOpenWaiterCall: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  orderId,
  onClose,
  onOpenWaiterCall,
}) => {
  const { orders, currentTable, settings, theme } = useRestaurant();
  const isDark = theme === 'dark';

  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const order = orderId
    ? orders.find(o => o.id === orderId)
    : orders.find(o => o.tableNumber === currentTable && o.status !== 'served') || orders[0];

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className={`w-full max-w-md border rounded-3xl p-6 text-center space-y-4 shadow-2xl ${
          isDark ? 'bg-[#141824] border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}>
          <p className="font-medium">Aucune commande active pour la Table {currentTable}.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  const elapsed = getElapsedMinutes(order.createdAt);
  const estimatedRemaining = Math.max(0, 15 - elapsed);

  const steps = [
    { key: 'received', label: 'Reçue en brigade', desc: 'Bon transmis aux chefs', icon: CheckCircle2 },
    { key: 'in_kitchen', label: 'En cuisson & dressage', desc: 'Au feu par notre brigade', icon: ChefHat },
    { key: 'ready', label: 'Prête au passe', desc: 'En route vers votre table !', icon: BellRing },
    { key: 'served', label: 'Servie à table', desc: 'Bon appétit & régalez-vous', icon: Sparkles },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'received': return 0;
      case 'in_kitchen': return 1;
      case 'ready': return 2;
      case 'served': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full sm:max-w-md border rounded-t-[40px] sm:rounded-[40px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isDark 
            ? 'bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0c0f17] border-white/10 text-white' 
            : 'bg-gradient-to-b from-[#fdfbf7] via-[#f7f0e5] to-[#f0e4d4] border-white/80 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-white/70'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-500 font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Suivi Radar Live</span>
              </span>
              <span className="text-xs bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-mono font-black">
                {order.id}
              </span>
            </div>
            <h3 className={`text-lg font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Table {order.tableNumber}
            </h3>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
              isDark ? 'bg-white/10 text-slate-300 hover:text-white' : 'bg-white/70 text-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-4">
          {/* Aggressive Live Status Banner with ETA */}
          <div className="p-4 rounded-[28px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/20 text-center space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-slate-950/20 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {order.status === 'served'
                  ? 'Commande clôturée'
                  : order.status === 'ready'
                  ? 'Prêt au passe · En route !'
                  : `Temps estimé restant : ~${estimatedRemaining} min`}
              </span>
            </div>
            <div className="text-xl font-black">
              {steps[currentIndex]?.label}
            </div>
            <p className="text-xs font-medium opacity-90">
              {steps[currentIndex]?.desc}
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className={`p-4 rounded-[28px] border space-y-4 ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
          }`}>
            {steps.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="relative flex items-start gap-3.5">
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-8 -ml-px transition-colors ${
                        idx < currentIndex ? 'bg-amber-500' : isDark ? 'bg-white/10' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black ring-4 ring-amber-500/30 scale-110 shadow-md'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : isDark
                        ? 'bg-white/10 text-slate-500 border border-white/10'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-4 h-4" />}
                  </div>

                  <div className="pt-0.5">
                    <div className={`text-xs font-black ${
                      isCurrent ? 'text-amber-500' : isPast ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Recap */}
          <div className={`p-4 rounded-[28px] border space-y-2.5 ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Articles commandés</span>
              <span className="font-mono">
                {formatTime(order.createdAt)}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-500 font-mono">{item.quantity}x</span>
                    <span className="font-medium">{item.name}</span>
                    {item.cookingPreference && (
                      <span className="text-[10px] text-orange-400 font-semibold">({item.cookingPreference})</span>
                    )}
                  </div>
                  <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {formatCurrency(item.itemTotal, settings.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className={`pt-2 border-t flex justify-between items-center text-xs font-black ${
              isDark ? 'border-white/10 text-white' : 'border-slate-100 text-slate-900'
            }`}>
              <span>Total TTC</span>
              <span className={`font-mono text-sm ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                {formatCurrency(order.totalTTC + order.tipAmount, settings.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center gap-2 ${
          isDark ? 'bg-[#10131d] border-white/10' : 'bg-white/90 border-slate-200'
        }`}>
          <button
            onClick={() => {
              onClose();
              onOpenWaiterCall();
            }}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
              isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-amber-500" />
            <span>Appeler le serveur</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
