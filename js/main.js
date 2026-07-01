/**
 * @fileoverview Central orchestrator for Tax-Shield SA.
 *
 * Import source map — each function lives in exactly one module:
 *
 *  data-parser.js       → processSelectedFiles
 *  ui-interactions.js   → processStagedFiles, clearAllStaged,
 *                         triggerPaymentHandshake, closePaymentModal,
 *                         togglePaymentAccordion, resetParser,
 *                         purgeLocalVariables, toggleFaq
 *  web3-payment.js      → executeOnChainPayment
 *  file-operations.js   → downloadCalculatedLedger, printOfficialAuditCert
 *  ui-renderer.js       → uiRenderer (object)
 *  config.js            → CONFIG
 *  state.js             → runtimeState
 */

// ── Config & State ────────────────────────────────────────────────────────────
import { CONFIG } from './config.js';
import { runtimeState } from './state.js';

// ── UI Renderer (initialise DOM bindings on load) ─────────────────────────────
import { uiRenderer } from './ui-renderer.js';

// ── Data Parser ───────────────────────────────────────────────────────────────
// Only processSelectedFiles is exported from data-parser.js.
// processStagedFiles / clearAllStaged are UI-layer wrappers in ui-interactions.js.
import { processSelectedFiles } from './data-parser.js';

// ── UI Interactions ───────────────────────────────────────────────────────────
// This module owns all staged-file management and UI-action handlers.
import {
    processStagedFiles,
    clearAllStaged,
    triggerPaymentHandshake,
    closePaymentModal,
    togglePaymentAccordion,
    resetParser,
    purgeLocalVariables,
    toggleFaq,
} from './ui-interactions.js';

// ── Web3 Payment ──────────────────────────────────────────────────────────────
import { executeOnChainPayment } from './web3-payment.js';

// ── File Operations ───────────────────────────────────────────────────────────
import { downloadCalculatedLedger, printOfficialAuditCert } from './file-operations.js';

// ── Global Window Bindings ────────────────────────────────────────────────────
// Required because index.html still uses direct id-based event listeners
// wired through ui-interactions.js; window bindings keep the dev-sandbox
// console commands working without touching the HTML.
window.processSelectedFiles    = processSelectedFiles;
window.processStagedFiles      = processStagedFiles;
window.clearAllStaged          = clearAllStaged;
window.resetParser             = resetParser;
window.purgeLocalVariables     = purgeLocalVariables;
window.triggerPaymentHandshake = triggerPaymentHandshake;
window.closePaymentModal       = closePaymentModal;
window.togglePaymentAccordion  = togglePaymentAccordion;
window.executeOnChainPayment   = executeOnChainPayment;
window.downloadCalculatedLedger = downloadCalculatedLedger;
window.printOfficialAuditCert  = printOfficialAuditCert;
window.toggleFaq               = toggleFaq;

// ── Dev Sandbox Bypass ────────────────────────────────────────────────────────
// Run `executePaymentProcess()` in the browser console to skip the Web3 step.
if (CONFIG.isDevSandbox) {
    window.executePaymentProcess = () => {
        closePaymentModal();
        document.getElementById('dynamic-trades-rows')?.classList.remove('blur-preview');
        document.getElementById('paywall-overlay')?.classList.add('hidden');
        document.getElementById('unlocked-dashboard')?.classList.remove('hidden');
        console.log('⚡ Dev Sandbox: payment bypass executed.');
    };
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    uiRenderer.init();
    console.log('🚀 Tax-Shield SA: module graph resolved, application ready.');
});
