import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, formatTime, getElapsedMinutes } from '../../utils/formatters';
import { downloadOrderReceipt } from '../../utils/receiptGenerator';
import { soundFx } from '../../utils/audio';
import {
  X,
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  Sparkles,
  CreditCard,
  Download,
  Star,
  Coffee,
  Check,
  ArrowRight,
  Split,
  MessageSquare,
  Heart,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderStatusModalProps {
  orderId?: string;
  onClose: () => void;
  onOpenWaiterCall: () => void;
  onOrderDessert?: () => void;
  onResetTable?: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  orderId,
  onClose,
  onOpenWaiterCall,
  onOrderDessert,
  onResetTable,
}) => {
  const { orders, currentTable, settings, theme, markOrderPaid, callWaiter } = useRestaurant();
  const isDark = theme === 'dark';

  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const order = orderId
    ? orders.find(o => o.id === orderId)
    : orders.find(o => o.tableNumber === currentTable && o.status !== 'served') || orders[0];

  // Active view: 'tracking' | 'payment' | 'feedback'
  const isPaid = order?.paymentStatus === 'paid';
  const isServed = order?.status === 'served';

  const [activeTab, setActiveTab] = useState<'tracking' | 'payment' | 'feedback'>(() => {
    if (isPaid) return 'feedback';
    if (isServed) return 'payment';
    return 'tracking';
  });

  // Keep activeTab in sync if order status changes remotely
  useEffect(() => {
    if (isPaid) {
      setActiveTab('feedback');
    }
  }, [isPaid]);

  // Payment State
  const [selectedTipPercent, setSelectedTipPercent] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [callTpeSent, setCallTpeSent] = useState<boolean>(false);

  // Review & Feedback State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Cuisine raffinée', 'Cuisson parfaite']);
  const [comment, setComment] = useState<string>('');
  const [reviewSent, setReviewSent] = useState<boolean>(false);

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
    { key: 'served', label: 'Servie à table', desc: 'Bon appétit & régalez-vous 🍷', icon: Sparkles },
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

  // Calculate tip and total
  let tipVal = 0;
  if (isCustomTip) {
    tipVal = parseFloat(customTip) || 0;
  } else {
    tipVal = Math.round((order.totalTTC * (selectedTipPercent / 100)) * 100) / 100;
  }
  const totalWithTip = order.totalTTC + tipVal;
  const splitAmount = splitCount > 1 ? totalWithTip / splitCount : totalWithTip;

  const handlePayNow = (method: 'card' | 'apple_pay' | 'contactless') => {
    soundFx.playTactileClick();
    setPaymentProcessing(true);
    setTimeout(() => {
      markOrderPaid(order.id, method);
      setPaymentProcessing(false);
      soundFx.playSuccessChime();
      setActiveTab('feedback');
    }, 800);
  };

  const handleCallTpe = () => {
    soundFx.playTactileClick();
    callWaiter('bill', `Addition demandée à table avec TPE (Table ${order.tableNumber})`, 'Terminal Carte Bancaire');
    setCallTpeSent(true);
    setTimeout(() => setCallTpeSent(false), 4000);
  };

  const toggleFeedbackTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSendFeedback = () => {
    soundFx.playSuccessChime();
    setReviewSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full sm:max-w-lg border rounded-t-[40px] sm:rounded-[40px] max-h-[94vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isDark 
            ? 'bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0c0f17] border-white/10 text-white' 
            : 'bg-gradient-to-b from-[#fdfbf7] via-[#f7f0e5] to-[#f0e4d4] border-white/80 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Navigation tabs */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-white/70'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-500 font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Service & Suivi Live</span>
              </span>
              <span className="text-xs bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-mono font-black">
                {order.id}
              </span>
            </div>
            <h3 className={`text-lg font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Table {order.tableNumber}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Tab Pills */}
            <div className={`flex items-center gap-1 p-1 rounded-full border text-xs font-bold ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === 'tracking'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Suivi
              </button>

              <button
                onClick={() => setActiveTab('payment')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === 'payment'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Addition
              </button>

              {isPaid && (
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeTab === 'feedback'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Avis
                </button>
              )}
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
        </div>

        {/* Dynamic Content based on activeTab */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-5">
          {/* ========================================================= */}
          {/* TAB 1: RADAR & SUIVI EN CUISINE                           */}
          {/* ========================================================= */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              {/* Aggressive Live Status Banner */}
              <div className="p-4 rounded-[28px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/20 text-center space-y-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-slate-950/20 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {order.status === 'served'
                      ? 'Plats servis à table !'
                      : order.status === 'ready'
                      ? 'Prêt au passe · En route vers vous !'
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

              {/* Logical Next Step Card when Served */}
              {isServed && !isPaid && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-[28px] border space-y-3 ${
                    isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                      Suite logique du service
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Vos plats ont été servis ! Souhaitez-vous commander un dessert/café, ou directement régler l'addition ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {onOrderDessert && (
                      <button
                        onClick={onOrderDessert}
                        className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                          isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white/15' : 'bg-white border-amber-300 text-slate-800 hover:bg-amber-100'
                        }`}
                      >
                        <Coffee className="w-4 h-4 text-amber-500" />
                        <span>Commander un dessert</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('payment')}
                      className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Régler l'addition</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Order Recap list */}
              <div className={`p-4 rounded-[28px] border space-y-2.5 ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Détail des plats</span>
                  <span className="font-mono">{formatTime(order.createdAt)}</span>
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
                    {formatCurrency(order.totalTTC, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: RÈGLEMENT DE L'ADDITION (PAYMENT FLOW)              */}
          {/* ========================================================= */}
          {activeTab === 'payment' && (
            <div className="space-y-5">
              {/* Status Notice */}
              <div className={`p-4 rounded-[28px] border flex items-center justify-between ${
                isPaid
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-500">
                    Addition Table {order.tableNumber}
                  </div>
                  <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(totalWithTip, settings.currency)}
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-black ${
                  isPaid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {isPaid ? 'Payée ✓' : 'À régler'}
                </div>
              </div>

              {!isPaid ? (
                <>
                  {/* Western Tip Selector (Pourboire brigade & salle) */}
                  <div className={`p-4 rounded-[28px] border space-y-3 ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Pourboire service brigade (Optionnel)
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-500">
                        +{formatCurrency(tipVal, settings.currency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[0, 5, 10, 15].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setIsCustomTip(false);
                            setSelectedTipPercent(pct);
                          }}
                          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all ${
                            !isCustomTip && selectedTipPercent === pct
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                              : isDark
                              ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pct === 0 ? 'Sans pourboire' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split Bill Option (Partage de l'addition entre amis) */}
                  <div className={`p-4 rounded-[28px] border space-y-2.5 ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider">
                        <Split className="w-3.5 h-3.5 text-amber-500" />
                        <span>Partager la note ({splitCount} pers.)</span>
                      </span>
                      <span className="font-mono text-amber-500 font-extrabold text-sm">
                        {formatCurrency(splitAmount, settings.currency)} / pers.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSplitCount(num)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono-numbers transition-all ${
                            splitCount === num
                              ? 'bg-[#14171d] text-amber-400 font-black shadow-sm ring-2 ring-amber-400'
                              : isDark
                              ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {num}p
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      disabled={paymentProcessing}
                      onClick={() => handlePayNow('apple_pay')}
                      className="w-full py-4 px-6 rounded-full bg-slate-950 hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 border border-white/20"
                    >
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>{paymentProcessing ? 'Validation en cours...' : `Payer en ligne · ${formatCurrency(splitAmount, settings.currency)}`}</span>
                    </button>

                    <button
                      onClick={handleCallTpe}
                      className={`w-full py-3.5 px-6 rounded-full border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        callTpeSent
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : isDark
                          ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <BellRing className="w-4 h-4 text-amber-500" />
                      <span>{callTpeSent ? 'Serveur appelé avec terminal TPE !' : "Demander l'addition au serveur (TPE / Espèces)"}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h4 className="text-xl font-black">Addition réglée avec succès !</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Nous vous remercions pour votre confiance. Vous pouvez maintenant donner votre avis ou télécharger votre justificatif de paiement.
                  </p>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="py-3 px-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-md"
                  >
                    <span>Donner mon avis sur le repas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: EXPÉRIENCE CLIENT & AVIS GOURMAND (FEEDBACK)        */}
          {/* ========================================================= */}
          {activeTab === 'feedback' && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <span className="text-xs uppercase tracking-widest text-amber-500 font-black">
                  Expérience Gastronomique
                </span>
                <h4 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Avez-vous apprécié votre repas ?
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Votre retour aide directement la brigade de {settings.name} à parfaire ses créations.
                </p>
              </div>

              {/* 5-Star Rating */}
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map(star => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        soundFx.playTactileClick();
                        setRating(star);
                      }}
                      className="p-1 transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          filled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                            : isDark ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-center text-xs font-bold text-amber-500">
                {rating === 5 && '⭐️ Exceptionnel ! Une expérience inoubliable.'}
                {rating === 4 && '⭐️ Très bon repas, bravo à la brigade !'}
                {rating === 3 && '⭐️ Bon moment à table.'}
                {rating === 2 && '⭐️ Passable, des points à améliorer.'}
                {rating === 1 && '⭐️ Décevant par rapport aux attentes.'}
              </div>

              {/* Compliments Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ce que vous avez particulièrement aimé :
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Cuisine raffinée',
                    'Cuisson parfaite',
                    'Service attentionné',
                    'Rapidité',
                    'Cadre élégant',
                    'Belle sélection vins',
                  ].map(tag => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFeedbackTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          active
                            ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                            : isDark
                            ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {tag} {active && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Chef Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Un mot personnel pour le chef (Optionnel) :
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Ex: La cuisson du filet mignon était remarquable..."
                  className={`w-full p-3 rounded-2xl border text-xs placeholder-slate-400 focus:outline-none transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-400' : 'bg-white border-slate-200 text-slate-900 focus:border-slate-800'
                  }`}
                />
              </div>

              {/* Actions & Receipt Download */}
              <div className="space-y-2.5 pt-1">
                {!reviewSent ? (
                  <button
                    onClick={handleSendFeedback}
                    className="w-full py-3.5 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Heart className="w-4 h-4 fill-slate-950" />
                    <span>Envoyer mon avis à la brigade</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-center text-xs font-bold">
                    Merci infiniment pour vos encouragements ! Le chef transmet à l'équipe.
                  </div>
                )}

                <button
                  onClick={() => downloadOrderReceipt(order, settings)}
                  className={`w-full py-3 px-6 rounded-full border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isDark ? 'bg-white/10 border-white/15 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Télécharger mon reçu / Facture avec TVA</span>
                </button>

                {onResetTable && (
                  <button
                    onClick={onResetTable}
                    className="w-full py-2.5 px-4 text-center text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Libérer la Table {order.tableNumber} / Nouveau service</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Modal Bottom Bar */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#10131d] border-white/10' : 'bg-white/90 border-slate-200'
        }`}>
          <button
            onClick={() => {
              onClose();
              onOpenWaiterCall();
            }}
            className={`py-2.5 px-4 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-amber-500" />
            <span>Appeler serveur</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-sm"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
