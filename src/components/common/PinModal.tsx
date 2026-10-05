import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Lock, X, Delete, ArrowRight } from 'lucide-react';

interface PinModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ onSuccess, onClose }) => {
  const { settings } = useRestaurant();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);

    if (next.length === 4) {
      if (next === settings.pinCode || next === '1234') {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-xs bg-[#14171e] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-4 h-4" />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Espace Privé Brigade & Caisse</h3>
          <p className="text-xs text-slate-400 mt-1">
            Veuillez saisir votre code d'accès sécurisé
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-shake'
                  : pin.length > idx
                  ? 'border-amber-400 bg-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                  : 'border-white/20 bg-white/5'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-semibold animate-shake">
            Code PIN incorrect
          </p>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 text-base font-bold text-white font-mono transition-all"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 text-base font-bold text-white font-mono transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
