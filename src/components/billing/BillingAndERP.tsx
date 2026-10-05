import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order } from '../../types/restaurant';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { motion } from 'motion/react';
import {
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  User,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Download,
} from 'lucide-react';

interface BillingAndERPProps {
  initialOrderId?: string;
  onOpenSettings: () => void;
}

export const BillingAndERP: React.FC<BillingAndERPProps> = ({
  initialOrderId,
}) => {
  const {
    settings,
    orders,
    menu,
    toggleItemAvailability,
    updateItemStock,
    markOrderPaid,
    theme,
  } = useRestaurant();

  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'invoices' | 'accounting' | 'stocks'>('invoices');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    if (initialOrderId) {
      return orders.find(o => o.id === initialOrderId) || orders[0] || null;
    }
    return orders[0] || null;
  });

  const [invoiceFormat, setInvoiceFormat] = useState<'thermal' | 'a4'>('thermal');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const [clientName, setClientName] = useState<string>('Mme / M. Le Client');
  const [clientCompany, setClientCompany] = useState<string>('Société / Note de frais');
  const [clientAddress, setClientAddress] = useState<string>('Paris, France');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalTTC : 0), 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const totalTips = orders.reduce((sum, o) => sum + (o.tipAmount || 0), 0);
  const totalCovers = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  const peakHours = [
    { hour: '12h - 13h', volume: 68 },
    { hour: '13h - 14h', volume: 92 },
    { hour: '14h - 15h', volume: 45 },
    { hour: '19h - 20h', volume: 85 },
    { hour: '20h - 21h', volume: 100 },
    { hour: '21h - 22h', volume: 74 },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!selectedOrder) return;
    const isThermal = invoiceFormat === 'thermal';
    const filename = `${isThermal ? 'Ticket' : 'Facture'}-${selectedOrder.id}.html`;

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${isThermal ? 'Ticket' : 'Facture'} ${selectedOrder.id} - ${settings.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1a1a1a;
      background: #f8fafc;
    }
    .container {
      max-width: ${isThermal ? '340px' : '720px'};
      margin: 0 auto;
      background: white;
      padding: ${isThermal ? '20px' : '40px'};
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      font-family: ${isThermal ? 'monospace' : 'inherit'};
    }
    .header { text-align: ${isThermal ? 'center' : 'left'}; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 16px; }
    .title { font-size: ${isThermal ? '18px' : '24px'}; font-weight: bold; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 13px; }
    .table-info { display: flex; justify-content: space-between; font-size: 12px; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { text-align: left; padding: 8px 4px; border-bottom: 2px solid #334155; }
    td { padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
    .total-section { margin-top: 16px; border-top: 2px solid #0f172a; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #94a3b8; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border-radius: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 16px;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; font-weight: bold; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer;">
      🖨️ Imprimer ou Enregistrer en PDF
    </button>
  </div>
  <div class="container">
    <div class="header">
      <div class="title">${settings.name}</div>
      <div class="subtitle">${settings.subtitle}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
        ${settings.address} - ${settings.postalCode} ${settings.city}<br>
        SIRET : ${settings.siret} · TVA Intra : ${settings.vatNumber}
      </div>
    </div>
    <div class="table-info">
      <div>
        <strong>Bon / Facture N° :</strong> ${selectedOrder.id}<br>
        <strong>Table :</strong> ${selectedOrder.tableNumber}
        ${!isThermal && clientCompany ? `<br><strong>Client :</strong> ${clientName} (${clientCompany})` : ''}
      </div>
      <div style="text-align: right;">
        <strong>Date :</strong> ${formatDate(selectedOrder.createdAt)}<br>
        <strong>Heure :</strong> ${formatTime(selectedOrder.createdAt)}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Article</th>
          <th style="text-align: center;">Qté</th>
          <th style="text-align: right;">Prix</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${selectedOrder.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.basePrice, settings.currency)}</td>
            <td style="text-align: right;">${formatCurrency(item.itemTotal, settings.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="total-section">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span>Sous-total HT :</span>
        <span>${formatCurrency(selectedOrder.totalHT, settings.currency)}</span>
      </div>
      ${selectedOrder.tvaDetails.map(t => `
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 2px;">
          <span>TVA ${(t.rate * 100).toFixed(1)}% :</span>
          <span>${formatCurrency(t.tvaAmount, settings.currency)}</span>
        </div>
      `).join('')}
      ${selectedOrder.tipAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #0284c7; margin-bottom: 4px;">
          <span>Pourboire service :</span>
          <span>${formatCurrency(selectedOrder.tipAmount, settings.currency)}</span>
        </div>
      ` : ''}
      <div class="total-row" style="margin-top: 8px;">
        <span>Total TTC :</span>
        <span>${formatCurrency(selectedOrder.totalTTC + selectedOrder.tipAmount, settings.currency)}</span>
      </div>
    </div>
    <div class="footer">
      <div>Mode de règlement : ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CARTE BANCAIRE'}</div>
      <div style="font-weight: bold; margin-top: 4px;">Merci pour votre confiance & à bientôt !</div>
      <div style="margin-top: 2px;">Document certifié conforme aux normes fiscales</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

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
              Facturation, ERP & Comptabilité
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
              Conforme TVA
            </span>
          </div>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Génération de notes de frais, tickets thermiques 80mm, analyse des ventes et stock 86.
          </p>
        </div>

        {/* Tab switchers */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border shadow-sm ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Facturation & Tickets
          </button>

          <button
            onClick={() => setActiveTab('accounting')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'accounting'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Tableau de Bord
          </button>

          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'stocks'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Stocks & Ruptures (86)
          </button>
        </div>
      </div>

      {/* TAB 1: INVOICES & THERMAL TICKETS */}
      {activeTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Orders list (Cols 1-4) */}
          <div className={`lg:col-span-4 p-5 rounded-[32px] border shadow-lg space-y-3 ${
            isDark ? 'bg-[#121622]/90 border-white/10 text-white' : 'bg-white/85 border-white text-slate-800'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isDark ? 'border-white/10' : 'border-slate-100'
            }`}>
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Bons & Factures Récents</h3>
              <span className="text-xs text-slate-400 font-mono font-bold">{orders.length} factures</span>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto no-scrollbar">
              {orders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : isDark
                        ? 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm font-mono">{order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isSelected 
                              ? 'bg-slate-950 text-white' 
                              : isDark 
                              ? 'bg-white/10 text-slate-200' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            T{order.tableNumber}
                          </span>
                        </div>
                        <div className={`text-[11px] mt-1 ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                          {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-black text-sm ${isSelected ? 'text-slate-950' : isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                          {formatCurrency(order.totalTTC + order.tipAmount, settings.currency)}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid' 
                            ? isSelected ? 'text-slate-950' : 'text-emerald-400' 
                            : isSelected ? 'text-slate-950' : 'text-amber-500'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Réglé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice Document Preview (Cols 5-12) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-[28px] border shadow-md flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? 'bg-[#121622]/90 border-white/10' : 'bg-white/85 border-white'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Format :</span>
                    <button
                      onClick={() => setInvoiceFormat('thermal')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        invoiceFormat === 'thermal'
                          ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                          : isDark
                          ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Ticket Thermique (80mm)
                    </button>
                    <button
                      onClick={() => setInvoiceFormat('a4')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        invoiceFormat === 'a4'
                          ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                          : isDark
                          ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Facture A4
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedOrder.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => markOrderPaid(selectedOrder.id, 'card')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Encaisser</span>
                      </button>
                    )}

                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-white/10"
                      title="Lancer l'impression directe"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Imprimer</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                      title="Télécharger la facture ou le ticket au format fichier prêt à imprimer"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{downloadSuccess ? 'Téléchargé ✓' : 'Télécharger'}</span>
                    </button>
                  </div>
                </div>

                {invoiceFormat === 'a4' && (
                  <div className={`p-4 rounded-[28px] border shadow-md space-y-3 text-xs ${
                    isDark ? 'bg-[#121622]/90 border-white/10 text-white' : 'bg-white/85 border-white text-slate-900'
                  }`}>
                    <div className="font-bold flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400" />
                      <span>Destinataire de la Facture / Note de Frais</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Nom</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl border mt-1 ${
                            isDark 
                              ? 'bg-white/5 border-white/10 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Société</label>
                        <input
                          type="text"
                          value={clientCompany}
                          onChange={e => setClientCompany(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl border mt-1 ${
                            isDark 
                              ? 'bg-white/5 border-white/10 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Adresse</label>
                        <input
                          type="text"
                          value={clientAddress}
                          onChange={e => setClientAddress(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl border mt-1 ${
                            isDark 
                              ? 'bg-white/5 border-white/10 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Printable Document Canvas */}
                <div className={`flex justify-center p-4 sm:p-8 rounded-[36px] border shadow-inner ${
                  isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  {invoiceFormat === 'thermal' ? (
                    <div className="printable-area w-full max-w-[340px] bg-white text-slate-900 font-mono p-6 rounded-2xl shadow-2xl text-[12px] space-y-4 border border-slate-200">
                      <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-300">
                        <div className="text-lg font-black tracking-tight">{settings.name}</div>
                        <div className="text-[11px] text-slate-600">{settings.subtitle}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {settings.address} - {settings.postalCode} {settings.city}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          SIRET : {settings.siret}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          N° TVA : {settings.vatNumber}
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-700">
                        <div>
                          <div>BON N° : {selectedOrder.id}</div>
                          <div>TABLE : {selectedOrder.tableNumber}</div>
                        </div>
                        <div className="text-right">
                          <div>DATE : {formatDate(selectedOrder.createdAt)}</div>
                          <div>HEURE : {formatTime(selectedOrder.createdAt)}</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 py-2 border-t border-b border-dashed border-slate-300">
                        <div className="flex justify-between font-bold text-[11px]">
                          <span>ARTICLE</span>
                          <span>TOTAL</span>
                        </div>
                        {selectedOrder.items.map(item => (
                          <div key={item.id} className="flex justify-between text-[11px]">
                            <div className="truncate max-w-[190px]">
                              {item.quantity}x {item.name}
                            </div>
                            <span className="font-bold">
                              {formatCurrency(item.itemTotal, settings.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>SOUS-TOTAL HT</span>
                          <span>{formatCurrency(selectedOrder.totalHT, settings.currency)}</span>
                        </div>

                        {selectedOrder.tvaDetails.map(t => (
                          <div key={t.rate} className="flex justify-between text-[10px] text-slate-500">
                            <span>TVA {(t.rate * 100).toFixed(1)}% (Base {formatCurrency(t.baseHT, settings.currency)})</span>
                            <span>{formatCurrency(t.tvaAmount, settings.currency)}</span>
                          </div>
                        ))}

                        {selectedOrder.tipAmount > 0 && (
                          <div className="flex justify-between font-medium text-slate-700">
                            <span>POURBOIRE SERVICE</span>
                            <span>{formatCurrency(selectedOrder.tipAmount, settings.currency)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-base font-black pt-2 border-t-2 border-slate-900">
                          <span>TOTAL TTC</span>
                          <span>{formatCurrency(selectedOrder.totalTTC + selectedOrder.tipAmount, settings.currency)}</span>
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-slate-600 pt-3 border-t border-dashed border-slate-300 space-y-1">
                        <div>MODE : {selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CARTE BANCAIRE'}</div>
                        <div>STATUT : {selectedOrder.paymentStatus === 'paid' ? 'ACQUITTÉ ✓' : 'EN ATTENTE'}</div>
                        <div className="pt-2 font-bold text-slate-800">MERCI DE VOTRE VISITE !</div>
                        <div className="text-[9px] text-slate-400">Logiciel de caisse certifié NF525</div>
                      </div>
                    </div>
                  ) : (
                    <div className="printable-area w-full max-w-[650px] bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl space-y-8 text-xs font-sans border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-black text-slate-900 tracking-tight">
                            {settings.name}
                          </div>
                          <div className="text-slate-600 font-medium">{settings.subtitle}</div>
                          <div className="text-slate-500 mt-2 space-y-0.5 text-[11px]">
                            <div>{settings.address}</div>
                            <div>{settings.postalCode} {settings.city}, {settings.country}</div>
                            <div>Tél : {settings.phone} · {settings.email}</div>
                            <div className="font-mono pt-1">SIRET : {settings.siret}</div>
                            <div className="font-mono">TVA intra. : {settings.vatNumber}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold uppercase tracking-wider text-slate-900">
                            FACTURE
                          </div>
                          <div className="text-slate-500 font-mono mt-1">
                            N° {selectedOrder.id}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-1">
                            Date : {formatDate(selectedOrder.createdAt)}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Table de service : {selectedOrder.tableNumber}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Facturé à :
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-1">{clientName}</div>
                        <div className="text-slate-600 font-medium">{clientCompany}</div>
                        <div className="text-slate-500 text-[11px]">{clientAddress}</div>
                      </div>

                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase text-slate-700">
                            <th className="py-2">Désignation</th>
                            <th className="py-2 text-center">Qté</th>
                            <th className="py-2 text-right">Prix Unit. HT</th>
                            <th className="py-2 text-right">Taux TVA</th>
                            <th className="py-2 text-right">Total TTC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedOrder.items.map(item => {
                            const unitHT = item.basePrice / (1 + item.tvaRate);
                            return (
                              <tr key={item.id} className="text-slate-800">
                                <td className="py-2.5">
                                  <div className="font-semibold">{item.name}</div>
                                  {item.cookingPreference && (
                                    <div className="text-[10px] text-slate-500">Cuisson : {item.cookingPreference}</div>
                                  )}
                                </td>
                                <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                                <td className="py-2.5 text-right font-mono">{formatCurrency(unitHT, settings.currency)}</td>
                                <td className="py-2.5 text-right font-mono">{(item.tvaRate * 100).toFixed(1)}%</td>
                                <td className="py-2.5 text-right font-mono font-bold">
                                  {formatCurrency(item.itemTotal, settings.currency)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="flex justify-end pt-4">
                        <div className="w-72 space-y-2">
                          <div className="flex justify-between text-slate-600">
                            <span>Total HT :</span>
                            <span className="font-mono">{formatCurrency(selectedOrder.totalHT, settings.currency)}</span>
                          </div>

                          {selectedOrder.tvaDetails.map(t => (
                            <div key={t.rate} className="flex justify-between text-[11px] text-slate-500">
                              <span>TVA {t.rateLabel} :</span>
                              <span className="font-mono">{formatCurrency(t.tvaAmount, settings.currency)}</span>
                            </div>
                          ))}

                          {selectedOrder.tipAmount > 0 && (
                            <div className="flex justify-between text-slate-700">
                              <span>Pourboires service :</span>
                              <span className="font-mono">{formatCurrency(selectedOrder.tipAmount, settings.currency)}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                            <span>Net à payer TTC :</span>
                            <span className="font-mono">
                              {formatCurrency(selectedOrder.totalTTC + selectedOrder.tipAmount, settings.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
                        <div>Facture acquittée par carte bancaire / sans contact · Règlement à réception</div>
                        <div className="font-bold text-slate-700">Merci de votre confiance et de votre fidélité.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400 text-xs font-medium">
                Sélectionnez une commande à gauche pour éditer son document fiscal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL ACCOUNTING DASHBOARD */}
      {activeTab === 'accounting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-[28px] bg-white/85 border border-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Chiffre d'Affaires</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers">
                {formatCurrency(totalRevenue, settings.currency)}
              </div>
              <div className="text-[11px] text-emerald-700 font-bold">
                +14.8% vs service d'hier
              </div>
            </div>

            <div className="p-5 rounded-[28px] bg-white/85 border border-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Panier Moyen</span>
                <TrendingUp className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers">
                {formatCurrency(averageTicket, settings.currency)}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Sur {paidOrders.length} tables encaissées
              </div>
            </div>

            <div className="p-5 rounded-[28px] bg-white/85 border border-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Plats Servis</span>
                <Package className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers">
                {totalCovers}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Flux continu
              </div>
            </div>

            <div className="p-5 rounded-[28px] bg-white/85 border border-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Pourboires Collectés</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers">
                {formatCurrency(totalTips, settings.currency)}
              </div>
              <div className="text-[11px] text-purple-800 font-bold">
                À redistribuer à la brigade
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-[32px] bg-white/85 border border-white shadow-md space-y-5">
              <div>
                <h3 className="font-black text-slate-900 text-base">Affluence & Heures de Pointe</h3>
                <p className="text-xs text-slate-500">Distribution du volume de commandes sur le service</p>
              </div>

              <div className="space-y-3 pt-2">
                {peakHours.map(ph => (
                  <div key={ph.hour} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span className="font-bold">{ph.hour}</span>
                      <span className="font-mono text-slate-900 font-black">{ph.volume}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#14171d] rounded-full transition-all duration-1000"
                        style={{ width: `${ph.volume}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-[32px] bg-white/85 border border-white shadow-md space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Palmarès des Ventes (Best-Sellers)</h3>
                <p className="text-xs text-slate-500">Plats générant le plus de rotation</p>
              </div>

              <div className="space-y-3">
                {menu.slice(0, 5).map((dish, i) => (
                  <div
                    key={dish.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-sm text-amber-800 font-mono">
                        #{i + 1}
                      </span>
                      <img
                        src={dish.image}
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover shadow-xs shrink-0"
                      />
                      <div>
                        <div className="text-xs font-black text-slate-900">{dish.name}</div>
                        <div className="text-[10px] text-slate-500">{dish.category}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-slate-900">
                        {formatCurrency(dish.price, settings.currency)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Stock : {dish.stockQuantity} portions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCKS & 86 LIST */}
      {activeTab === 'stocks' && (
        <div className="p-6 rounded-[32px] bg-white/85 border border-white shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Gestion des Stocks & Ruptures (« 86 List »)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Désactivez immédiatement un produit pour qu'il n'apparaisse plus commandable sur les smartphones des clients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map(item => {
              const is86 = !item.isAvailable;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-[28px] border transition-all space-y-3 ${
                    is86
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 truncate leading-snug">
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-slate-900 font-mono font-black">
                        {formatCurrency(item.price, settings.currency)}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-700 font-medium">Portions restantes :</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemStock(item.id, item.stockQuantity - 1)}
                        className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:text-black"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-slate-900 text-sm w-7 text-center">
                        {item.stockQuantity}
                      </span>
                      <button
                        onClick={() => updateItemStock(item.id, item.stockQuantity + 1)}
                        className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:text-black"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      is86
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                    }`}
                  >
                    {is86 ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-white" />
                        <span>En Rupture (86) · Réactiver</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Disponible au Menu · Basculer en 86</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
