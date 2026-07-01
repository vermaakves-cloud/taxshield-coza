// Temporary UI Renderer Stub to satisfy ES Module Imports
export const uiRenderer = {
    renderStagedFiles: () => console.log("UI Renderer initialized"),
    updateStatus: (msg) => console.log("Status update:", msg),
    clearQueue: () => console.log("Queue cleared")
};

// Handle default export variations just in case
export default uiRenderer;
console.log("📁 js/ui-renderer.js placeholder loaded successfully.");
