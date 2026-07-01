// js/notifications.js

const toast = document.getElementById('toast-notification');
const toastTitle = document.getElementById('toast-title');
const toastMessage = document.getElementById('toast-message');

export function triggerToastNotification(title, msg) {
    toastTitle.innerText = title;
    toastMessage.innerText = msg;
    
    // Apply brand design rules: dark-slate background and amber accent highlights
    toast.classList.remove('bg-slate-900', 'text-slate-100');
    toast.classList.add('bg-slate-950', 'text-amber-200', 'border-amber-800'); // Using slate-950 for #0f172a approximation, amber-200 for text, amber-800 for border

    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    setTimeout(closeToast, 10000);
}

export function closeToast() {
    const toast = document.getElementById('toast-notification');
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('hidden');
        // Reset to default styling or remove brand-specific classes if needed for next notification
        toast.classList.remove('bg-slate-950', 'text-amber-200', 'border-amber-800');
        toast.classList.add('bg-slate-900', 'text-slate-100'); // Revert to original styling for general use
    }, 300);
}