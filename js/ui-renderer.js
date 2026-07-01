// js/ui-renderer.js
/**
 * @fileoverview Central UI rendering and DOM manipulation module for Tax-Shield SA.
 *
 * Exports consumed by the module graph:
 *  - renderCalculatedResults()   ← data-parser.js
 *  - updateProcessingStep(msg)   ← data-parser.js
 *  - updateProgressBar(percent)  ← data-parser.js
 *  - toggleUIVisibility(id,show) ← ui-interactions.js, web3-payment.js
 *  - uiRenderer (object)         ← main.js
 *
 * All DOM manipulation for application state is centralised here so that
 * no other module needs to touch the DOM directly for state transitions.
 */

import { runtimeState } from './state.js';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Generic element show / hide by ID
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show or hide any element by its DOM id.
 * @param {string} elementId
 * @param {boolean} show  — true = remove 'hidden', false = add 'hidden'
 */
export function toggleUIVisibility(elementId, show) {
    const el = document.getElementById(elementId);
    if (!el) {
        console.warn(`toggleUIVisibility: element #${elementId} not found.`);
        return;
    }
    if (show) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESSING STATE: step label + progress bar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the animated processing-step label during CSV analysis.
 * @param {string} message
 */
export function updateProcessingStep(message) {
    const el = document.getElementById('processing-step');
    if (el) el.textContent = message;
}

/**
 * Update the amber progress bar width.
 * @param {string|number} percent — accepts '75%' or 75
 */
export function updateProgressBar(percent) {
    const el = document.getElementById('progress-bar');
    if (!el) return;
    el.style.width = typeof percent === 'number' ? `${percent}%` : percent;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS DASHBOARD: render calculated ledger into the UI
// ─────────────────────────────────────────────────────────────────────────────

// SARS individual annual CGT exclusion (2024/2025 tax year)
const SARS_CGT_ANNUAL_EXCLUSION = 40000;

/**
 * Read the current runtimeState and render all results panels,
 * then transition the application to the locked paywall view.
 * Called by data-parser.js after the FIFO loop completes.
 */
export function renderCalculatedResults() {
    const netGain     = runtimeState.calculatedNetGains  || 0;
    const txCount     = runtimeState.calculatedTxCount   || 0;
    const ledger      = runtimeState.finalProcessedLedger || [];

    // ── How much of the annual exclusion has been consumed ──────────────────
    const exclusionUsed = Math.min(Math.max(netGain, 0), SARS_CGT_ANNUAL_EXCLUSION);

    // ── Summary stat cards ──────────────────────────────────────────────────
    const fmt = (n) => `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const txCountEl   = document.getElementById('calc-tx-count');
    const netGainEl   = document.getElementById('calc-net-gain');
    const exemptionEl = document.getElementById('calc-exemption');

    if (txCountEl)   txCountEl.textContent   = `${txCount} Trades`;
    if (netGainEl)   netGainEl.textContent   = fmt(netGain);
    if (exemptionEl) exemptionEl.textContent = fmt(exclusionUsed);

    // ── Trade rows (disposal events only shown in the blurred preview) ──────
    const tradesContainer = document.getElementById('dynamic-trades-rows');
    if (tradesContainer) {
        tradesContainer.innerHTML = '';

        const disposals = ledger.filter(e => e.type === 'Disposal Event');

        if (disposals.length === 0) {
            // Render sample placeholder rows so the blur paywall still looks meaningful
            const sampleRows = [
                { date: '2024-03-15', asset: 'BTC', zarValuation: 185420.00, gain: 42380.00, type: 'Disposal Event' },
                { date: '2024-06-22', asset: 'ETH', zarValuation:  52180.50, gain:  9640.00, type: 'Disposal Event' },
                { date: '2024-09-10', asset: 'SOL', zarValuation:  18960.00, gain:  3120.00, type: 'Disposal Event' },
                { date: '2024-11-04', asset: 'BTC', zarValuation: 310200.00, gain: 57310.00, type: 'Disposal Event' },
            ];
            sampleRows.forEach(entry => _appendTradeRow(tradesContainer, entry));
        } else {
            disposals.forEach(entry => _appendTradeRow(tradesContainer, entry));
        }
    }

    // ── Audit risk contextual banner ─────────────────────────────────────────
    _renderAuditRiskBanner(netGain, SARS_CGT_ANNUAL_EXCLUSION);

    // ── State transitions ────────────────────────────────────────────────────
    toggleUIVisibility('state-upload',     false);
    toggleUIVisibility('state-processing', false);
    toggleUIVisibility('state-results',    true);

    // Lock behind paywall; blur the data table rows
    toggleUIVisibility('paywall-overlay',    true);
    toggleUIVisibility('unlocked-dashboard', false);

    const rows = document.getElementById('dynamic-trades-rows');
    if (rows) rows.classList.add('blur-preview');

    // Complete the progress bar animation
    updateProgressBar('100%');
}

/** Append a single trade row into the container element */
function _appendTradeRow(container, entry) {
    const fmt = (n) => `R${(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const gainPositive = (entry.gain || 0) >= 0;

    const row = document.createElement('div');
    row.className = 'flex justify-between text-[11px] md:text-xs font-mono text-slate-300';
    row.innerHTML = `
        <span class="w-1/4 truncate">${entry.date || '—'}</span>
        <span class="w-1/4">${entry.asset || '—'}</span>
        <span class="w-1/4 text-right">${fmt(entry.zarValuation)}</span>
        <span class="w-1/4 text-right ${gainPositive ? 'text-red-400' : 'text-green-400'}">${entry.type || '—'}</span>
    `;
    container.appendChild(row);
}

/** Render the colour-coded audit risk banner above the data table */
function _renderAuditRiskBanner(netGain, exclusionLimit) {
    const banner = document.getElementById('audit-risk-banner');
    if (!banner) return;

    const fmt = (n) => `R${Math.abs(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

    let bgColor, borderColor, textColor, icon, message;

    if (netGain > exclusionLimit) {
        bgColor = 'bg-red-900/20'; borderColor = 'border-red-700'; textColor = 'text-red-200';
        icon    = `<svg class="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
        message = `<strong class="text-red-400">High Audit Risk:</strong> Your net capital gains of ${fmt(netGain)} exceed the ${fmt(exclusionLimit)} SARS annual CGT exclusion. A detailed Annexure B declaration is legally required. Failure to disclose may result in understatement penalties of up to 200%.`;
    } else if (netGain > 0) {
        bgColor = 'bg-amber-900/20'; borderColor = 'border-amber-700'; textColor = 'text-amber-200';
        icon    = `<svg class="h-5 w-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        message = `<strong class="text-amber-400">Low Audit Risk:</strong> Your net gains of ${fmt(netGain)} fall within the ${fmt(exclusionLimit)} annual exclusion — no CGT is currently payable. However, SARS still requires you to declare these transactions on your ITR12 Annexure B.`;
    } else if (netGain < 0) {
        bgColor = 'bg-green-900/20'; borderColor = 'border-green-700'; textColor = 'text-green-200';
        icon    = `<svg class="h-5 w-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        message = `<strong class="text-green-400">Capital Loss Recorded:</strong> A net capital loss of ${fmt(netGain)} has been identified. Under Section 20 of the Income Tax Act, this assessed loss can be carried forward to offset future capital gains — a valuable tax-optimisation outcome.`;
    } else {
        bgColor = 'bg-slate-800/20'; borderColor = 'border-slate-700'; textColor = 'text-slate-300';
        icon    = `<svg class="h-5 w-5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        message = `<strong class="text-slate-400">Neutral Position:</strong> Your net capital position is R0.00. No CGT implications exist for this assessment period.`;
    }

    banner.className = `flex items-start gap-3 rounded-lg p-4 border text-xs leading-relaxed ${bgColor} ${borderColor} ${textColor}`;
    banner.innerHTML = `${icon}<div>${message}</div>`;
    banner.classList.remove('hidden');
}

// ─────────────────────────────────────────────────────────────────────────────
// uiRenderer OBJECT  (imported as { uiRenderer } by main.js)
// ─────────────────────────────────────────────────────────────────────────────

export const uiRenderer = {
    /**
     * Wire up any UI elements that are purely renderer-owned.
     * Call once from main.js on DOMContentLoaded.
     */
    init() {
        // The toast close button — notifications.js handles triggerToastNotification,
        // but the ✕ button binding lives here to keep it renderer-owned.
        document.getElementById('toast-close-btn')?.addEventListener('click', () => {
            const toast = document.getElementById('toast-notification');
            if (!toast) return;
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.classList.add('hidden'), 300);
        });

        console.log('🎨 Tax-Shield SA UI Renderer: ready.');
    },

    // Expose helpers on the object so main.js can call them if needed
    toggleUIVisibility,
    renderCalculatedResults,
    updateProcessingStep,
    updateProgressBar,
};

export default uiRenderer;

console.log('📁 js/ui-renderer.js loaded successfully.');
