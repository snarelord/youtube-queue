chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Queue Extension installed");
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToQueue",
    title: "➕ Add to YouTube Queue",
    contexts: ["link"],
    targetUrlPatterns: ["*://www.youtube.com/watch*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToQueue" && info.linkUrl) {
    chrome.storage.local.get(["queue"], (data) => {
      const queue: string[] = data.queue || [];
      if (!queue.includes(info.linkUrl!)) {
        const updatedQueue = [...queue, info.linkUrl!];
        chrome.storage.local.set({ queue: updatedQueue }, () => {
          console.log(`Added to queue: ${info.linkUrl}`);
        });
      }
    });
  }
});
