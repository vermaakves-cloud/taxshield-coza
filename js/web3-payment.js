// js/web3-payment.js
import { CONFIG } from './config.js';
import { triggerToastNotification } from './notifications.js';
import { toggleUIVisibility } from './ui-renderer.js';

const confirmBtn = document.getElementById('modal-confirm-btn');

async function connectRealWallet() {
    if (!window.ethereum) {
        throw new Error("No Web3 provider wallet detected. Please launch via Trust Wallet on your phone, or install a compatible browser extension.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return { provider, signer, account: accounts[0] };
}

async function ensureBaseNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.baseChainIdHex }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: CONFIG.baseChainIdHex,
                    chainName: 'Base Mainnet',
                    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://mainnet.base.org'],
                    blockExplorerUrls: ['https://basescan.org']
                }],
            });
        } else {
            throw switchError;
        }
    }
}

export async function executeOnChainPayment() {
    try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Awaiting Connection...
        `;

        const { signer } = await connectRealWallet();
        
        confirmBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Routing to Base Chain...
        `;
        
        await ensureBaseNetwork();

        confirmBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Awaiting Signature...
        `;

        const minERC20ABI = [
            "function transfer(address to, uint256 value) public returns (bool)"
        ];

        const usdcContract = new ethers.Contract(CONFIG.usdcContractAddress, minERC20ABI, signer);
        
        const tx = await usdcContract.transfer(CONFIG.merchantWallet, CONFIG.productUSDCPrice);
        
        confirmBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirming Block...
        `;

        const receipt = await tx.wait();

        if (receipt.status === 1) {
            executePaymentSuccessState();
        } else {
            throw new Error("Blockchain verification failed. Reverted transaction.");
        }

    } catch (err) {
        let errorMessage = `Payment transaction rejected: ${err.message}`;
        if (CONFIG.isDevSandbox) {
            errorMessage += `\n\n💡 DEV SANDBOX: Since you are checking this locally, you can easily bypass the Web3 checkout by running 'executePaymentProcess()' in your browser console.`;
        }
        triggerToastNotification("Web3 Handshake Failed", errorMessage);
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Confirm Web3 Transfer";
    }
}

export function executePaymentSuccessState() {
    toggleUIVisibility('wallet-modal-overlay', false);
    document.getElementById('dynamic-trades-rows').classList.remove('blur-preview');
    toggleUIVisibility('paywall-overlay', false);
    toggleUIVisibility('unlocked-dashboard', true);
    triggerToastNotification("Payment Received", "Your cryptographic ledger payment has successfully cleared. Scroll down to download your SARS Annexure B.");
}

// Developer/Sandbox console command executor
window.executePaymentProcess = function() {
    executePaymentSuccessState();
};

// Placeholder for Yoco SDK ZAR checkout track
// This functionality was not present in the original index.html
// and would require integration with the Yoco SDK.
export function initializeYocoPayment() {
    console.warn("Yoco SDK integration not yet implemented. This is a placeholder function.");
    // Example: YocoSDK.init({ publicKey: 'YOUR_YOCO_PUBLIC_KEY' });
    // Example: YocoSDK.showCheckout({ amountInCents: 35000, currency: 'ZAR', ... });
}