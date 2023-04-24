document.getElementById("toggleSidebar").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "toggleSidebar" });
  });
});

document.getElementById("toggleVisualChanges").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "toggleVisualChanges" });
  });
});
