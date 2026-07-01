// js/ui-interactions.js
import { processSelectedFiles } from './data-parser.js';
import { executeOnChainPayment, executePaymentSuccessState } from './web3-payment.js';
import { downloadCalculatedLedger, printOfficialAuditCert } from './file-operations.js';
import { triggerToastNotification, closeToast } from './notifications.js';
import { resetRuntimeState, stagedFilesMetadata, updateStagedFilesMetadata } from './state.js';
import { toggleUIVisibility } from './ui-renderer.js';

// Drag and Drop Zone Interactivity
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInputTrigger = document.getElementById('file-input-trigger');
const stagedFilesContainer = document.getElementById('staged-files-container');
const stagedFilesList = document.getElementById('staged-files-list');
const stagedCountBadge = document.getElementById('staged-count-badge');

// Initialize stagedFiles from localStorage via stagedFilesMetadata
let stagedFiles = [];
if (stagedFilesMetadata && stagedFilesMetadata.length > 0) {
    stagedFiles = stagedFilesMetadata.map(meta => new File([], meta.name, { type: meta.type, lastModified: meta.lastModified }));
    renderStagedFiles();
}


['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-emerald-500', 'bg-slate-800/80');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-emerald-500', 'bg-slate-800/80');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        addFilesToStaging(files);
    }
});

fileInput.addEventListener('change', (e) => {
    addFilesToStaging(e.target.files);
});

fileInputTrigger.addEventListener('click', () => {
    fileInput.click();
});

function addFilesToStaging(fileList) {
    Array.from(fileList).forEach(file => {
        stagedFiles.push(file);
    });
    updateStagedFilesMetadata(stagedFiles.map(file => ({ name: file.name, type: file.type, lastModified: file.lastModified })));
    renderStagedFiles();
}

function renderStagedFiles() {
    stagedFilesList.innerHTML = '';
    if (stagedFiles.length > 0) {
        stagedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = "flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-300";
            fileItem.innerHTML = `
                <span class="truncate">${file.name}</span>
                <button data-index="${index}" class="remove-staged-file-btn text-slate-500 hover:text-red-400">&times;</button>
            `;
            stagedFilesList.appendChild(fileItem);
        });
        stagedFilesContainer.classList.remove('hidden');
    } else {
        stagedFilesContainer.classList.add('hidden');
    }
    stagedCountBadge.innerText = `${stagedFiles.length} Files Staged`;

    document.querySelectorAll('.remove-staged-file-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const indexToRemove = parseInt(e.target.dataset.index);
            removeStagedFile(indexToRemove);
        });
    });
}

function removeStagedFile(index) {
    stagedFiles.splice(index, 1);
    updateStagedFilesMetadata(stagedFiles.map(file => ({ name: file.name, type: file.type, lastModified: file.lastModified })));
    renderStagedFiles();
}

document.getElementById('clear-all-staged-btn').addEventListener('click', clearAllStaged);

export function clearAllStaged() {
    stagedFiles = [];
    fileInput.value = '';
    updateStagedFilesMetadata([]);
    renderStagedFiles();
}

document.getElementById('process-staged-files-btn').addEventListener('click', processStagedFiles);

export function processStagedFiles() {
    if (stagedFiles.length > 0) {
        processSelectedFiles(stagedFiles);
    } else {
        triggerToastNotification("No Files", "Please drop or select CSV files before processing.");
    }
}

// Payment & UI State Functions
document.getElementById('pay-btn').addEventListener('click', triggerPaymentHandshake);

export function triggerPaymentHandshake() {
    toggleUIVisibility('wallet-modal-overlay', true);
}

document.getElementById('close-payment-modal-btn').addEventListener('click', closePaymentModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closePaymentModal);

export function closePaymentModal() {
    toggleUIVisibility('wallet-modal-overlay', false);
    const confirmBtn = document.getElementById('modal-confirm-btn');
    confirmBtn.disabled = false;
    confirmBtn.innerText = "Confirm Web3 Transfer";
}

document.getElementById('modal-confirm-btn').addEventListener('click', executeOnChainPayment);

document.getElementById('reset-parser-btn').addEventListener('click', resetParser);

export function resetParser() {
    fileInput.value = "";
    toggleUIVisibility('state-results', false);
    toggleUIVisibility('state-upload', true);
    
    // Lock previews
    document.getElementById('dynamic-trades-rows').classList.add('blur-preview');
    toggleUIVisibility('paywall-overlay', true);
    toggleUIVisibility('unlocked-dashboard', false);
    resetRuntimeState();
}

document.getElementById('payment-accordion-toggle-btn').addEventListener('click', togglePaymentAccordion);

export function togglePaymentAccordion() {
    const accordion = document.getElementById('payment-accordion');
    accordion.classList.toggle('hidden');
}

document.getElementById('purge-variables-btn').addEventListener('click', purgeLocalVariables);

export function purgeLocalVariables() {
    resetRuntimeState();
    resetParser(); // Resets the UI as well
    triggerToastNotification("Memory Cleaned", "All calculated tax parameters and local CSV properties have been completely wiped from your browser memory thread.");
}

// FAQ Toggles
document.getElementById('faq-scroll-btn').addEventListener('click', () => {
    document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('faq-toggle-1').addEventListener('click', () => toggleFaq(1));
document.getElementById('faq-toggle-2').addEventListener('click', () => toggleFaq(2));
document.getElementById('faq-toggle-3').addEventListener('click', () => toggleFaq(3));
document.getElementById('faq-toggle-4').addEventListener('click', () => toggleFaq(4));

export function toggleFaq(num) {
    const ans = document.getElementById(`faq-answer-${num}`);
    const arrow = document.getElementById(`faq-arrow-${num}`);
    
    ans.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
}

// Download/Print actions
document.getElementById('download-ledger-btn').addEventListener('click', downloadCalculatedLedger);
document.getElementById('print-audit-cert-btn').addEventListener('click', printOfficialAuditCert);

// Toast close button
document.getElementById('toast-close-btn').addEventListener('click', closeToast);
