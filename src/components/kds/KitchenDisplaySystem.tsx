import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order } from '../../types/restaurant';
import { formatTime, getElapsedMinutes } from '../../utils/formatters';
import { soundFx } from '../../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle,
  Bell,
  Volume2,
  VolumeX,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';

export const KitchenDisplaySystem: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    waiterCalls,
    resolveWaiterCall,
    soundEnabled,
    setSoundEnabled,
    theme,
  } = useRestaurant();

  const isDark = theme === 'dark';

  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'received');
  const cookingOrders = orders.filter(o => o.status === 'in_kitchen');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const handleAdvance = (order: Order) => {
    if (order.status === 'received') {
      updateOrderStatus(order.id, 'in_kitchen');
    } else if (order.status === 'in_kitchen') {
      updateOrderStatus(order.id, 'ready');
      soundFx.playKitchenOrderBell();
    } else if (order.status === 'ready') {
      updateOrderStatus(order.id, 'served');
    }
  };

  const renderOrderCard = (order: Order) => {
    const elapsed = getElapsedMinutes(order.createdAt);
    const isUrgent = elapsed >= 15;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        key={order.id}
        className={`p-5 rounded-[28px] border transition-all shadow-md space-y-4 ${
          isUrgent
            ? isDark
              ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/50 shadow-rose-900/30 text-rose-100'
              : 'bg-rose-50/95 border-rose-300 ring-2 ring-rose-400 text-slate-800'
            : order.status === 'ready'
            ? isDark
              ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30 text-emerald-100'
              : 'bg-emerald-50/95 border-emerald-300 ring-1 ring-emerald-400/40 text-slate-800'
            : order.status === 'in_kitchen'
            ? isDark
              ? 'bg-amber-950/25 border-amber-500/40 text-amber-100'
              : 'bg-amber-50/95 border-amber-300 text-slate-800'
            : isDark
            ? 'bg-[#181d2a] border-white/10 text-white'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-950 px-3.5 py-1 rounded-2xl bg-amber-400 font-mono-numbers shadow-sm">
              T{order.tableNumber}
            </span>
            <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {order.id}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black font-mono-numbers ${
              isUrgent
                ? 'bg-rose-500 text-white animate-pulse'
                : isDark
                ? 'bg-white/10 text-slate-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsed} min</span>
          </div>
        </div>

        {order.customerName && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{order.customerName}</span>
            <span>·</span>
            <span>{formatTime(order.createdAt)}</span>
          </div>
        )}

        {/* Dish Items List */}
        <div className={`space-y-2.5 pt-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200/80'}`}>
          {order.items.map(item => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border shadow-sm space-y-1 ${
                isDark 
                  ? 'bg-white/5 border-white/5 text-white' 
                  : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2 font-medium">
                  <span className="text-base font-black text-amber-400 font-mono">
                    {item.quantity}x
                  </span>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.name}
                  </span>
                </div>
              </div>

              {item.cookingPreference && (
                <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                  isDark 
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                    : 'bg-orange-100 text-orange-900'
                }`}>
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>Cuisson : {item.cookingPreference.toUpperCase()}</span>
                </div>
              )}

              {item.selectedExtras.length > 0 && (
                <div className={`text-xs pl-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  + {item.selectedExtras.map(e => e.name).join(', ')}
                </div>
              )}

              {item.specialNotes && (
                <div className={`text-xs px-2.5 py-1 rounded-xl font-semibold border ${
                  isDark
                    ? 'text-rose-200 bg-rose-950/40 border-rose-500/30'
                    : 'text-rose-800 bg-rose-50 border-rose-200'
                }`}>
                  ⚠️ Note client : {item.specialNotes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {order.status === 'received' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAdvance(order)}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Lancer en cuisson / préparation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {order.status === 'in_kitchen' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAdvance(order)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span>Prêt au passe ! Sonner le service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {order.status === 'ready' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAdvance(order)}
              className={`w-full py-3 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-900 hover:bg-black'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Marquer comme Servie à table</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col p-4 sm:p-6 space-y-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-b from-[#0b0e14] via-[#10141f] to-[#080a0e] text-slate-100' 
        : 'bg-gradient-to-b from-[#faf6f0] via-[#f3ebe1] to-[#e8decb] text-slate-800'
    }`}>
      {/* Top KDS Bar with warm aesthetic */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
            <ChefHat className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                KDS Cuisine · Écran Brigade
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                Direct Live
              </span>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Gestion tactile des cuissons, temps de passe et sonneries de service.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => soundFx.playKitchenOrderBell()}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' 
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Tester Cloche</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                : isDark
                ? 'bg-white/5 text-slate-400 border-white/10'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
            title={soundEnabled ? 'Son activé' : 'Son coupé'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Active Waiter Calls Alert Bar if any */}
      {waiterCalls.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Appels en salle actifs ({waiterCalls.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {waiterCalls.map(call => (
              <div
                key={call.id}
                className={`p-3.5 rounded-2xl border shadow-md flex items-center justify-between gap-3 ${
                  isDark
                    ? 'bg-[#181d2a] border-amber-500/40 text-white'
                    : 'bg-white border-amber-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black text-slate-950 px-2.5 py-1 rounded-xl bg-amber-400 font-mono-numbers">
                    T{call.tableNumber}
                  </span>
                  <div>
                    <div className="text-xs font-bold">{call.reasonLabel}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Il y a {getElapsedMinutes(call.createdAt)} min
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-sm transition-all active:scale-95"
                >
                  Traité ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Column Kanban Board with warm aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        {/* Col 1: Commandes en attente */}
        <div className={`p-5 rounded-[32px] border backdrop-blur-md shadow-lg space-y-4 ${
          isDark 
            ? 'bg-[#121622]/85 border-white/10 shadow-black/40' 
            : 'bg-white/70 border-white/80 shadow-[0_15px_30px_rgba(180,150,130,0.1)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                En attente
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono shadow-sm border ${
              isDark 
                ? 'bg-white/10 text-white border-white/10' 
                : 'bg-white text-slate-800 border-slate-200'
            }`}>
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className={`text-center py-16 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Aucun bon en attente
              </div>
            ) : (
              pendingOrders.map(order => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* Col 2: En cuisson / préparation */}
        <div className={`p-5 rounded-[32px] border backdrop-blur-md shadow-lg space-y-4 ${
          isDark 
            ? 'bg-[#121622]/85 border-white/10 shadow-black/40' 
            : 'bg-white/70 border-white/80 shadow-[0_15px_30px_rgba(180,150,130,0.1)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                En cuisson & dressage
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${
              isDark 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-amber-100 text-amber-900 border-amber-200'
            }`}>
              {cookingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {cookingOrders.length === 0 ? (
              <div className={`text-center py-16 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Postes de cuisson dégagés
              </div>
            ) : (
              cookingOrders.map(order => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* Col 3: Prêtes à servir */}
        <div className={`p-5 rounded-[32px] border backdrop-blur-md shadow-lg space-y-4 ${
          isDark 
            ? 'bg-[#121622]/85 border-white/10 shadow-black/40' 
            : 'bg-white/70 border-white/80 shadow-[0_15px_30px_rgba(180,150,130,0.1)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Prêtes au passe
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
            }`}>
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className={`text-center py-16 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Passe de dressage vide
              </div>
            ) : (
              readyOrders.map(order => renderOrderCard(order))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
