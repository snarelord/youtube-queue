chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-queue",
    title: "Add to YouTube Queue",
    contexts: ["link"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-to-queue" && info.linkUrl?.includes("youtube.com/watch")) {
    const url = info.linkUrl;

    chrome.tabs.create({ url, active: false }, (newTab) => {
      if (!newTab?.id) return;

      setTimeout(() => {
        chrome.tabs.sendMessage(newTab.id!, { action: "getTitle" }, (response) => {
          const title = response?.title || "Unknown Title";
          console.log(`Adding to queue: ${title} (${url})`);
          const newItem = { url, title };

          chrome.storage.local.get(["queue"], (data) => {
            const queue: { url: string; title: string }[] = data.queue || [];
            if (queue.some((item) => item.url === url)) return;

            const updatedQueue = [...queue, newItem];
            chrome.storage.local.set({ queue: updatedQueue }, () => {
              chrome.tabs.remove(newTab.id!);
            });
          });
        });
      }, 2000); // delay to allow YouTube to load
    });
  }
});

async function getYouTubeTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelector("title")?.innerText || "";
    console.log(`Fetched title: ${title}`);
    return title.replace(" - YouTube", "");
  } catch {
    return "Unknown Title";
  }
}
