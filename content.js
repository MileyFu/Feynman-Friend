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
  button.disabled = true;
  button.style.marginLeft = "8px";
  button.style.padding = "8px 12px";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.background = "#8ab4f8";
  button.style.color = "#202124";
  button.style.cursor = "pointer";

  form.appendChild(input);
  form.appendChild(button);
  container.appendChild(form);

  form.addEventListener("submit", handleUserResponse);

  document.body.appendChild(container);

  return { chatHistory, input, button };
}

function appendMessage(chatHistory, role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.style.lineHeight = "1.5";
    const roleStrong = document.createElement('strong');
    roleStrong.textContent = role === 'user' ? 'You: ' : 'Feynman Friend: ';
    messageDiv.appendChild(roleStrong);
    messageDiv.append(text);
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return messageDiv;
}

async function handleUserResponse(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector("textarea");
  const button = form.querySelector("button");
  const chatHistory = document.getElementById("feynman-chat-history");
  
  const userText = input.value.trim();
  if (userText === "" || !feynmanSession) return;

  appendMessage(chatHistory, 'user', userText);
  input.value = "";
  input.disabled = true;
  button.disabled = true;
  
  const aiMessageDiv = appendMessage(chatHistory, 'ai', '...');

  try {
    const stream = feynmanSession.promptStreaming(userText);
    let fullResponse = "";
    for await (const chunk of stream) {
      fullResponse += chunk;
      aiMessageDiv.textContent = `Feynman Friend: ${fullResponse}`;
    }
  } catch(err) {
     aiMessageDiv.textContent = `Feynman Friend: Sorry, an error occurred: ${err.message}`;
  } finally {
    input.disabled = false;
    button.disabled = false;
    input.focus();
  }
}

window.addEventListener("message", async (event) => {
  // *** THIS IS THE TYPO I FIXED ***
  if (event.source !== window || event.data.type !== "START_FEYNMAN_SESSION") {
    return;
  }

  const text = event.data.text;
  const { chatHistory, input, button } = createFloatingWindow();

  try {
    const availability = await isAiAvailable();

    // FIXED CHECK:
    // According to the docs, we can proceed if the status is anything
    // other than 'unavailable'. The create() call will trigger a download
    // if the status is 'downloadable' or 'downloading'.
    if (availability === "unavailable") {
      appendMessage(chatHistory, 'ai', "Sorry, the AI is not available right now. (Status: unavailable). Please check device requirements and Chrome flags.");
      return;
    }

    // Optional: Let the user know if a download is happening
    if (availability === "downloading" || availability === "downloadable") {
        appendMessage(chatHistory, 'ai', "Preparing the AI model. This may take a moment...");
    }

    const systemPrompt = `You are a curious beginner student named Feynman Friend. The user is your teacher. Your goal is to understand what they explain. When they explain something, respond by either confirming you understand in a friendly way (e.g., "Oh, that makes perfect sense now! Thank you.") or by asking ONE simple follow-up question if their explanation is still a bit unclear or uses jargon. Keep your responses short and conversational.`;
    
    // Use the robust createAiSession function
    feynmanSession = await createAiSession({systemPrompt});

    const initialAiMessageDiv = appendMessage(chatHistory, 'ai', "Thinking of a question...");
    
    const firstUserPrompt = `I'm your teacher. Please read this text I've selected and ask me ONE simple question about the most important or confusing concept to help you understand it better.\n\nText: "${text}"`;
    
    const stream = feynmanSession.promptStreaming(firstUserPrompt);
    let fullResponse = "";
    for await (const chunk of stream) {
        fullResponse += chunk;
        initialAiMessageDiv.textContent = `Feynman Friend: ${fullResponse}`;
    }
    
    // Enable the input form now that the first question has been asked
    input.disabled = false;
    button.disabled = false;
    input.focus();

  } catch (err) {
    appendMessage(chatHistory, 'ai', `Oops, an error occurred: ${err.message}`);
  }
});
