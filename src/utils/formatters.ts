import { CurrencyType, TVABreakdown, CartItem } from '../types/restaurant';

export function formatCurrency(amount: number, currency: CurrencyType = 'EUR'): string {
  const symbols: Record<CurrencyType, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CHF: 'CHF',
  };

  const formatted = amount.toFixed(2);
  const symbol = symbols[currency] || '€';

  if (currency === 'USD' || currency === 'GBP') {
    return `${symbol}${formatted}`;
  }
  return `${formatted} ${symbol}`;
}

export function calculateTVABreakdown(items: CartItem[]): {
  totalHT: number;
  totalTTC: number;
  tvaDetails: TVABreakdown[];
} {
  const rateGroups: Record<number, number> = {};

  items.forEach(item => {
    const rate = item.tvaRate;
    rateGroups[rate] = (rateGroups[rate] || 0) + item.itemTotal;
  });

  let totalHT = 0;
  let totalTTC = 0;
  const tvaDetails: TVABreakdown[] = [];

  Object.entries(rateGroups).forEach(([rateStr, groupTTC]) => {
    const rate = parseFloat(rateStr);
    const baseHT = groupTTC / (1 + rate);
    const tvaAmount = groupTTC - baseHT;

    totalHT += baseHT;
    totalTTC += groupTTC;

    let rateLabel = `${(rate * 100).toFixed(1)}%`;
    if (rate === 0.055) rateLabel = '5,5% (Alimentaire Réduit)';
    else if (rate === 0.10) rateLabel = '10,0% (Restauration Sur Place)';
    else if (rate === 0.20) rateLabel = '20,0% (Boissons Alcoolisées)';

    tvaDetails.push({
      rate,
      rateLabel,
      baseHT: Math.round(baseHT * 100) / 100,
      tvaAmount: Math.round(tvaAmount * 100) / 100,
      totalTTC: Math.round(groupTTC * 100) / 100,
    });
  });

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
    tvaDetails,
  };
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

export function getElapsedMinutes(isoString: string): number {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  } catch {
    return 0;
  }
}
