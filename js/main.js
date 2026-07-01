// js/main.js
// This file will import all necessary modules and set up initial event listeners
// or call initialization functions.
import * as UIInteractions from './ui-interactions.js';
import { CONFIG } from './config.js';
import { executePaymentSuccessState } from './web3-payment.js';
import { renderStagedFiles } from './ui-interactions.js'; // Import to render staged files on load

// Expose executePaymentProcess globally for dev sandbox if CONFIG.isDevSandbox is true
if (CONFIG.isDevSandbox) {
    window.executePaymentProcess = executePaymentSuccessState;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial rendering of staged files from localStorage on page load
    renderStagedFiles();
});
