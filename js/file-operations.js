// js/file-operations.js
import { runtimeState } from './state.js';
import { triggerToastNotification } from './notifications.js';

export function downloadCalculatedLedger() {
    let csvContent = "Timestamp,Asset Class,Activity Type,ZAR Spot Valuation,Net Capital Position,Compliance Note\n";
    
    runtimeState.finalProcessedLedger.forEach(item => {
        csvContent += `\"${item.date}\",\"${item.asset}\",\"${item.type}\",${item.zarValuation.toFixed(2)},${item.gain.toFixed(2)},\"${item.notes}\"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const dataUrl = URL.createObjectURL(blob);
    
    const temporaryLink = document.createElement("a");
    temporaryLink.setAttribute("href", dataUrl);
    temporaryLink.setAttribute("download", "sars_crypto_compliance_ledger.csv");
    document.body.appendChild(temporaryLink);
    
    temporaryLink.click();
    document.body.removeChild(temporaryLink);
    triggerToastNotification("Download Initialized", "Your ready-to-print CSV has been successfully compiled and downloaded.");
}

export function printOfficialAuditCert() {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date().toLocaleDateString('en-ZA');
    
    const rowsHTML = runtimeState.finalProcessedLedger.map(item => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">
            <td style="padding: 10px; color: #334155;">${item.date}</td>
            <td style="padding: 10px; color: #334155; font-weight: bold;">${item.asset} / ZAR</td>
            <td style="padding: 10px; color: #334155;">${item.type}</td>
            <td style="padding: 10px; text-align: right; color: #334155;">R${item.zarValuation.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: ${item.gain > 0 ? '#10b981' : '#64748b'}">R${item.gain.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SARS Audit Compliance Certificate</title>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }
                .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                .logo { font-size: 22px; font-weight: 800; tracking: -0.05em; }
                .logo span { color: #10b981; }
                .badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
                .grid-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
                .card-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
                .card-val { font-size: 20px; font-weight: 800; color: #0f172a; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 700; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">TAX-SHIELD <span>SA</span></div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Institutional Crypto Tax Audit Simulator</div>
                </div>
                <span class="badge">SARS ANNEXURE B COMPLIANT</span>
            </div>

            <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">Compliance Reconstruction & Audit Trail</h2>
                <p style="font-size: 12px; color: #64748b; margin: 0;">Reconstructed on ${dateStr} | Source Framework: VALR/Luno Ledger</p>
            </div>

            <div class="grid-cards">
                <div class="card">
                    <div class="card-title">Trades Evaluated</div>
                    <div class="card-val">${runtimeState.calculatedTxCount} Trades</div>
                </div>
                <div class="card">
                    <div class="card-title">Net Capital Gain / Loss</div>
                    <div class="card-val">R${runtimeState.calculatedNetGains.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="card">
                    <div class="card-title">SARS Exemption Used</div>
                    <div class="card-val">R${runtimeState.calculatedExemptionUsed.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Asset Pair</th>
                        <th>Transaction Type</th>
                        <th style="text-align: right;">ZAR Spot Value</th>
                        <th style="text-align: right;">Net Capital Gain</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>

            <div style="margin-top: 40px; border-t: 1px dashed #cbd5e1; padding-top: 20px; text-align: center; font-size: 10px; color: #94a3b8;">
                Secure client-side cryptographic ledger compilation. Generated via sarstaxcheck.online.
            </div>

            <script>
                window.onload = function() { window.print(); }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}