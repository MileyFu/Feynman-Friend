// Keep the session active throughout the conversation
let feynmanSession = null;

// --- NEW HELPER FUNCTIONS to handle API changes ---

async function isAiAvailable() {
  if (globalThis.LanguageModel) {
    // This is the API specified in the 2025 challenge documentation
    return await LanguageModel.availability();
  } else {
    // If LanguageModel doesn't exist, it's unavailable.
    return 'unavailable';
  }
}

async function createAiSession(options) {
  if (globalThis.LanguageModel) {
    // This is the API specified in the 2025 challenge documentation
    return await LanguageModel.create(options);
  } else {
    throw new Error("AI API (LanguageModel) not available.");
  }
}

// --- END NEW HELPER FUNCTIONS ---


function createFloatingWindow() {
  // Remove any existing window to prevent duplicates
  const existingContainer = document.getElementById("feynman-friend-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  const container = document.createElement("div");
  container.id = "feynman-friend-container";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.width = "400px";
  container.style.maxHeight = "500px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.background = "rgba(32, 33, 36, 0.95)";
  container.style.color = "white";
  container.style.borderRadius = "10px";
  container.style.fontFamily = "sans-serif";
  container.style.boxShadow = "0 4px 18px rgba(0,0,0,0.4)";
  container.style.zIndex = "999999";

  // Header
  const header = document.createElement("div");
  header.style.padding = "12px 16px";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.borderBottom = "1px solid #555";
  header.innerHTML = `<b>🧑‍🎓 Feynman Friend</b>`;
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✖";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.color = "#aaa";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "16px";
  closeBtn.onclick = () => {
    if (feynmanSession) feynmanSession.destroy();
    container.remove();
  };
  header.appendChild(closeBtn);
  container.appendChild(header);

  // Chat History Area
  const chatHistory = document.createElement("div");
  chatHistory.id = "feynman-chat-history";
  chatHistory.style.flexGrow = "1";
  chatHistory.style.padding = "12px 16px";
  chatHistory.style.overflowY = "auto";
  chatHistory.style.display = "flex";
  chatHistory.style.flexDirection = "column";
  chatHistory.style.gap = "12px";
  container.appendChild(chatHistory);

  // Input Form
  const form = document.createElement("form");
  form.style.display = "flex";
  form.style.padding = "10px 16px";
  form.style.borderTop = "1px solid #555";
  const input = document.createElement("textarea");
  input.placeholder = "Explain the concept here...";
  input.disabled = true;
  input.style.flexGrow = "1";
  input.style.background = "#444";
  input.style.color = "white";
  input.style.border = "1px solid #666";
  input.style.borderRadius = "5px";
  input.style.padding = "8px";
  input.style.resize = "none";
  input.rows = 2;
  const button = document.createElement("button");
  button.textContent = "Send";
  button.disabled