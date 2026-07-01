// js/state.js

const LOCAL_STORAGE_KEY = 'taxShieldAppState';

function loadStateFromLocalStorage() {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return undefined; // No state in localStorage
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error("Error loading state from local storage:", error);
        return undefined;
    }
}

function saveStateToLocalStorage(state) {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (error) {
        console.error("Error saving state to local storage:", error);
    }
}

// Initialize runtimeState by loading from localStorage, or use defaults
export let runtimeState = loadStateFromLocalStorage() || {
    calculatedTxCount: 0,
    calculatedNetGains: 0,
    calculatedExemptionUsed: 0,
    finalProcessedLedger: []
};

export let stagedFilesMetadata = loadStateFromLocalStorage()?.stagedFilesMetadata || [];

export function updateRuntimeState(newState) {
    runtimeState = { ...runtimeState, ...newState };
    saveStateToLocalStorage({ runtimeState, stagedFilesMetadata });
}

export function updateStagedFilesMetadata(newMetadata) {
    stagedFilesMetadata = newMetadata;
    saveStateToLocalStorage({ runtimeState, stagedFilesMetadata });
}

export function resetRuntimeState() {
    runtimeState = {
        calculatedTxCount: 0,
        calculatedNetGains: 0,
        calculatedExemptionUsed: 0,
        finalProcessedLedger: []
    };
    stagedFilesMetadata = [];
    saveStateToLocalStorage({ runtimeState, stagedFilesMetadata });
}
