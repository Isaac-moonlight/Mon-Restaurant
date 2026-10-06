import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Sparkles, Utensils, Check, ArrowRight, QrCode } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { RestaurantLogo } from '../common/RestaurantLogo';

interface TableWelcomeModalProps {
  onConfirmed: () => void;
}

export const TableWelcomeModal: React.FC<TableWelcomeModalProps> = ({ onConfirmed }) => {
  const { settings, currentTable, setCurrentTable, theme } = useRestaurant();
  const isDark = theme === 'dark';
  const [selectedTable, setSelectedTable] = useState<number>(currentTable || 1);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const handleConfirm = () => {
    soundFx.playTactileClick();
    setIsConfirming(true);
    setCurrentTable(selectedTable);
    setTimeout(() => {
      onConfirmed();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className={`w-full max-w-sm rounded-[40px] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border text-center space-y-6 relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0c0f17] border-white/10 text-white'
            : 'bg-gradient-to-b from-[#fbf8f2] via-[#f5ede1] to-[#eedfcc] border-white/80 text-slate-900'
        }`}
      >
        {/* Animated glowing decorative blur */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/25 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Intro Gastronomic Emblem with viral-style spring animation */}
        <div className="relative flex justify-center pt-2">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
            className="relative"
          >
            <RestaurantLogo size="xl" isDark={isDark} />
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md z-10"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
          </motion.div>
        </div>

        {/* Welcome Headline */}
        <div className="space-y-1.5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] font-extrabold uppercase tracking-widest text-amber-500"
          >
            Bienvenue chez {settings.name}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`text-2xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            À quelle table êtes-vous assis ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xs max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Indiquez votre table afin que notre brigade puisse vous servir directement vos commandes fraîches et boissons.
          </motion.p>
        </div>

        {/* Table Selector Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-2 text-left"
        >
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <span className="flex items-center gap-1.5 text-amber-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>Numéro de table</span>
            </span>
            <span className="text-[11px] text-amber-500 font-mono font-bold">
              Table sélectionnée : T{selectedTable}
            </span>
          </div>

          <div className={`grid grid-cols-5 gap-2 max-h-44 overflow-y-auto no-scrollbar p-1.5 rounded-2xl border shadow-inner ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/80'
          }`}>
            {Array.from({ length: settings.tablesCount }, (_, i) => i + 1).map(num => {
              const isSelected = selectedTable === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    soundFx.playTactileClick();
                    setSelectedTable(num);
                  }}
                  className={`h-11 rounded-xl text-xs font-black font-mono-numbers transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-400'
                      : isDark
                      ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80'
                  }`}
                >
                  T{num}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Confirm Button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={isConfirming}
          className="w-full py-4 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-95"
        >
          <span>{isConfirming ? 'Accès au Menu...' : `Confirmer la Table ${selectedTable} & Commander`}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </motion.button>
      </motion.div>
    </div>
  );
};
