chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "feynman-friend-explain",
    title: "Explain this to Feynman Friend",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "feynman-friend-explain" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        window.postMessage({ type: "START_FEYNMAN_SESSION", text });
      },
      args: [info.selectionText]
    });
  }
});