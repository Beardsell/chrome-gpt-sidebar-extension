chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['contentScript.js'],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getStoredValue") {
    const { key, defaultValue } = request;
    chrome.storage.sync.get([key], (result) => {
      const value = result.hasOwnProperty(key) ? result[key] : defaultValue;
      sendResponse({ value });
    });
    return true;
  } else if (request.type === "setStoredValue") {
    const { key, value } = request;
    chrome.storage.sync.set({ [key]: value }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
