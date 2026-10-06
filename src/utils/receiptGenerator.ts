import { Order, RestaurantSettings } from '../types/restaurant';
import { formatCurrency, formatDate, formatTime } from './formatters';

export function generateInvoiceHtml(order: Order, settings: RestaurantSettings): string {
  const isThermal = false;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture / Reçu - ${order.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #f8fafc;
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .subtitle {
      font-size: 13px;
      color: #d97706;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .legal {
      font-size: 11px;
      color: #64748b;
      margin-top: 8px;
      line-height: 1.5;
    }
    .info-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 11px;
      color: #475569;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .total-card {
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 12px;
      margin-top: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      border-top: 2px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 12px;
      color: #64748b;
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border-radius: 0; padding: 10px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 12px 24px; font-size: 14px; font-weight: bold; background: #d97706; color: white; border: none; border-radius: 999px; cursor: pointer; box-shadow: 0 4px 12px rgba(217,119,6,0.3);">
      🖨️ Imprimer ou Enregistrer en PDF
    </button>
  </div>
  <div class="container">
    <div class="header">
      <div class="title">${settings.name}</div>
      <div class="subtitle">${settings.subtitle}</div>
      <div class="legal">
        ${settings.address} - ${settings.postalCode} ${settings.city}<br>
        SIRET : ${settings.siret} · N° TVA : ${settings.vatNumber}<br>
        Téléphone : ${settings.phone}
      </div>
    </div>

    <div class="info-grid">
      <div>
        <strong>Bon / Facture N° :</strong> ${order.id}<br>
        <strong>Table :</strong> ${order.tableNumber}<br>
        ${order.customerName ? `<strong>Client :</strong> ${order.customerName}` : ''}
      </div>
      <div style="text-align: right;">
        <strong>Date :</strong> ${formatDate(order.createdAt)}<br>
        <strong>Heure :</strong> ${formatTime(order.createdAt)}<br>
        <strong>Statut :</strong> <span style="color: #16a34a; font-weight: bold;">RÉGLÉ (PAYÉ)</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Désignation</th>
          <th style="text-align: center;">Qté</th>
          <th style="text-align: right;">Prix Unit.</th>
          <th style="text-align: right;">Total TTC</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.cookingPreference ? `<div style="font-size: 11px; color: #d97706;">Cuisson : ${item.cookingPreference}</div>` : ''}
              ${item.selectedExtras?.length ? `<div style="font-size: 11px; color: #64748b;">+ ${item.selectedExtras.map(e => e.name).join(', ')}</div>` : ''}
            </td>
            <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.basePrice, settings.currency)}</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(item.itemTotal, settings.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-card">
      <div class="total-row">
        <span>Sous-total HT :</span>
        <span>${formatCurrency(order.totalHT, settings.currency)}</span>
      </div>
      ${order.tvaDetails.map(t => `
        <div class="total-row" style="color: #64748b; font-size: 12px;">
          <span>TVA ${(t.rate * 100).toFixed(1)}% (Base ${formatCurrency(t.baseHT, settings.currency)}) :</span>
          <span>${formatCurrency(t.tvaAmount, settings.currency)}</span>
        </div>
      `).join('')}
      ${order.tipAmount > 0 ? `
        <div class="total-row" style="color: #0284c7; font-weight: 600;">
          <span>Pourboire brigade & service :</span>
          <span>${formatCurrency(order.tipAmount, settings.currency)}</span>
        </div>
      ` : ''}
      <div class="grand-total">
        <span>NET PAYÉ TTC :</span>
        <span>${formatCurrency(order.totalTTC + (order.tipAmount || 0), settings.currency)}</span>
      </div>
    </div>

    <div class="footer">
      <div>Règlement : ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CARTE BANCAIRE / SANS CONTACT'}</div>
      <div style="font-weight: 800; margin-top: 6px; color: #0f172a;">Nous vous remercions chaleureusement pour votre visite chez ${settings.name} !</div>
      <div style="margin-top: 4px;">Justificatif certifié et dématérialisé conforme à la législation en vigueur</div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadOrderReceipt(order: Order, settings: RestaurantSettings) {
  const html = generateInvoiceHtml(order, settings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Recu-${settings.name.replace(/\s+/g, '_')}-${order.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
