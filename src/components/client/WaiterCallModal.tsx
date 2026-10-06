import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Receipt, GlassWater, HelpCircle, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface WaiterCallModalProps {
  onClose: () => void;
}

export const WaiterCallModal: React.FC<WaiterCallModalProps> = ({ onClose }) => {
  const { callWaiter, currentTable, theme } = useRestaurant();
  const isDark = theme === 'dark';

  const [selectedReason, setSelectedReason] = useState<'bill' | 'water_bread' | 'assistance'>('bill');
  const [paymentPref, setPaymentPref] = useState<string>('Carte bancaire');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  const handleSend = () => {
    let label = '';
    if (selectedReason === 'bill') {
      label = `Demande d'addition (${paymentPref})`;
    } else if (selectedReason === 'water_bread') {
      label = `Carafe d'eau & Pain frais`;
    } else {
      label = `Assistance en salle / Conseil sommelier`;
    }

    callWaiter(selectedReason, label, selectedReason === 'bill' ? paymentPref : undefined);
    setSentSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full sm:max-w-md border rounded-t-[40px] sm:rounded-[40px] p-6 space-y-6 shadow-2xl transition-colors ${
          isDark 
            ? 'bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0c0f17] border-white/10 text-white' 
            : 'bg-gradient-to-b from-[#fdfbf7] via-[#f7f0e5] to-[#f0e4d4] border-white/80 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-500 font-black">
              Service à Table
            </span>
            <h3 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Appeler un Serveur · Table {currentTable}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
              isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white/70 text-slate-700 hover:bg-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Appel transmis à la brigade !
            </h4>
            <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Un équipier de salle se rend immédiatement à votre Table {currentTable}.
            </p>
          </div>
        ) : (
          <>
            {/* Options */}
            <div className="space-y-3">
              {/* Option 1: Demander l'addition */}
              <div
                onClick={() => setSelectedReason('bill')}
                className={`p-4 rounded-[24px] border cursor-pointer transition-all ${
                  selectedReason === 'bill'
                    ? isDark
                      ? 'bg-amber-500/15 border-amber-500 shadow-md text-white'
                      : 'bg-white border-slate-900 shadow-md text-slate-900'
                    : isDark
                    ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-white/70 border-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Demander l'addition</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Règlement à table ou au comptoir</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedReason === 'bill' 
                      ? 'border-amber-500 bg-amber-500 text-slate-950 font-black' 
                      : isDark ? 'border-white/20' : 'border-slate-300'
                  }`}>
                    {selectedReason === 'bill' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Sub-selector for payment preference if bill is chosen */}
                {selectedReason === 'bill' && (
                  <div className={`mt-3 pt-3 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Mode de règlement souhaité
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Carte bancaire', 'Apple / Sans contact', 'Espèces'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentPref(method);
                          }}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-colors ${
                            paymentPref === method
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : isDark
                              ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Carafe / Pain */}
              <div
                onClick={() => setSelectedReason('water_bread')}
                className={`p-4 rounded-[24px] border cursor-pointer transition-all ${
                  selectedReason === 'water_bread'
                    ? isDark
                      ? 'bg-cyan-500/15 border-cyan-500 shadow-md text-white'
                      : 'bg-white border-slate-900 shadow-md text-slate-900'
                    : isDark
                    ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-white/70 border-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <GlassWater className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Carafe d'eau, pain ou couverts</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Réapprovisionnement rapide à table</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedReason === 'water_bread' 
                      ? 'border-cyan-500 bg-cyan-500 text-slate-950 font-black' 
                      : isDark ? 'border-white/20' : 'border-slate-300'
                  }`}>
                    {selectedReason === 'water_bread' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 3: Assistance / conseil */}
              <div
                onClick={() => setSelectedReason('assistance')}
                className={`p-4 rounded-[24px] border cursor-pointer transition-all ${
                  selectedReason === 'assistance'
                    ? isDark
                      ? 'bg-purple-500/15 border-purple-500 shadow-md text-white'
                      : 'bg-white border-slate-900 shadow-md text-slate-900'
                    : isDark
                    ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-white/70 border-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Assistance ou conseil du sommelier</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recommandations et accompagnement</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedReason === 'assistance' 
                      ? 'border-purple-500 bg-purple-500 text-white font-black' 
                      : isDark ? 'border-white/20' : 'border-slate-300'
                  }`}>
                    {selectedReason === 'assistance' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSend}
              className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Transmettre l'appel à la brigade</span>
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};
