import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { RestaurantSettings, CurrencyType } from '../../types/restaurant';
import { X, Building2, Save, Check } from 'lucide-react';

interface RestaurantSettingsModalProps {
  onClose: () => void;
}

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useRestaurant();

  const [form, setForm] = useState<RestaurantSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const currencies: { code: CurrencyType; symbol: string; label: string }[] = [
    { code: 'EUR', symbol: '€', label: 'Euro (€)' },
    { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
    { code: 'GBP', symbol: '£', label: 'Livre Sterling (£)' },
    { code: 'CHF', symbol: 'CHF', label: 'Franc Suisse (CHF)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-xl bg-[#14171e] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Paramètres Établissement (Modèle Blanc)</h3>
              <p className="text-xs text-slate-400">Personnalisez l'identité, la fiscalité et les mentions légales</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Nom du restaurant</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white mt-1.5 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300">Slogan / Sous-titre</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white mt-1.5 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300">Adresse postale</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white mt-1 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Code postal & Ville</label>
              <input
                type="text"
                value={`${form.postalCode} ${form.city}`}
                onChange={e => {
                  const parts = e.target.value.split(' ');
                  setForm({ ...form, postalCode: parts[0] || '', city: parts.slice(1).join(' ') || '' });
                }}
                className="w-full px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white mt-1 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Numéro SIRET</label>
              <input
                type="text"
                value={form.siret}
                onChange={e => setForm({ ...form, siret: e.target.value })}
                className="w-full px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white mt-1 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300">N° TVA Intracommunautaire</label>
              <input
                type="text"
                value={form.vatNumber}
                onChange={e => setForm({ ...form, vatNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white mt-1 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300">Devise monétaire</label>
              <select
                value={form.currency}
                onChange={e => {
                  const cur = currencies.find(c => c.code === e.target.value);
                  if (cur) {
                    setForm({ ...form, currency: cur.code, currencySymbol: cur.symbol });
                  }
                }}
                className="w-full px-3.5 py-2 rounded-2xl bg-[#1c202a] border border-white/10 text-white mt-1 focus:border-amber-500 focus:outline-none"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300">Nombre de tables</label>
              <input
                type="number"
                min="1"
                max="60"
                value={form.tablesCount}
                onChange={e => setForm({ ...form, tablesCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white mt-1 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300">Code PIN Brigade / POS</label>
              <input
                type="password"
                maxLength={6}
                value={form.pinCode}
                onChange={e => setForm({ ...form, pinCode: e.target.value })}
                className="w-full px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white mt-1 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
