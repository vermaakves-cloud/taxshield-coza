/**
 * @fileoverview Central orchestrator for Tax-Shield SA.
 * Implements Global Scope Binding to bridge Native ES Modules with inline HTML events.
 */

// Import Configurations and State
import { CONFIG } from './config.js';
import { runtimeState } from './state.js';

// Import Core Modules
import { uiRenderer } from './ui-renderer.js';
import { processSelectedFiles, processStagedFiles, clearAllStaged } from './data-parser.js';
import { triggerPaymentHandshake, closePaymentModal, togglePaymentAccordion, executeOnChainPayment } from './web3-payment.js';
import { downloadCalculatedLedger, printOfficialAuditCert } from './file-operations.js';
import { purgeLocalVariables, resetParser, toggleFaq } from './ui-interactions.js';

// EXPOSE TO GLOBAL WINDOW SCOPE (Crucial for inline HTML onclick/onchange triggers)
window.processSelectedFiles = processSelectedFiles;
window.processStagedFiles = processStagedFiles;
window.clearAllStaged = clearAllStaged;
window.resetParser = resetParser;
window.purgeLocalVariables = purgeLocalVariables;
window.triggerPaymentHandshake = triggerPaymentHandshake;
window.closePaymentModal = closePaymentModal;
window.togglePaymentAccordion = togglePaymentAccordion;
window.executeOnChainPayment = executeOnChainPayment;
window.downloadCalculatedLedger = downloadCalculatedLedger;
window.printOfficialAuditCert = printOfficialAuditCert;
window.toggleFaq = toggleFaq;

// Optional: Dev Sandbox Bypass Command
if (CONFIG.isDevSandbox) {
    window.executePaymentProcess = () => {
        closePaymentModal();
        document.getElementById('dynamic-trades-rows').classList.remove('blur-preview');
        document.getElementById('paywall-overlay').classList.add('hidden');
        document.getElementById('unlocked-dashboard').classList.remove('hidden');
        console.log("⚡ Dev Sandbox payment bypass executed successfully.");
    };
}

// Initialize Application when DOM is fully prepared
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Tax-Shield SA: Modular framework and global bindings initialized successfully.");
});
