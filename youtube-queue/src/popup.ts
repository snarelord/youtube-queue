import { get } from "http";

const addButton = document.getElementById("add") as HTMLButtonElement;
const clearButton = document.getElementById("clear") as HTMLButtonElement;
const queueList = document.getElementById("queue") as HTMLUListElement;
const skipButton = document.getElementById("skip") as HTMLButtonElement;
const playButton = document.getElementById("playButton") as HTMLButtonElement;
const pauseButton = document.getElementById("pauseButton") as HTMLButtonElement;

addButton.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  if (!url?.includes("youtube.com/watch")) return;

  chrome.storage.local.get(["queue"], async (data) => {
    const queue: { url: string; title: string }[] = data.queue || [];
    if (queue.some((item) => item.url === url)) return;
    const title = await getYouTubeTitle(url);
    const newItem = { url, title };
    const updatedQueue = [...queue, newItem];
    chrome.storage.local.set({ queue: updatedQueue }, () => renderQueue(updatedQueue));
  });
};

clearButton?.addEventListener("click", () => {
  chrome.storage.local.set({ queue: [] }, () => renderQueue([]));
});

function renderQueue(queue: { url: string; title: string }[]) {
  queueList.innerHTML = "";

  queue.forEach(({ url, title }) => {
    const li = document.createElement("li");

    const titleEl = document.createElement("strong");
    titleEl.textContent = title || "Untitled Video";
    li.appendChild(titleEl);

    li.appendChild(document.createElement("br"));

    const link = document.createElement("a");
    link.href = url;
    link.textContent = url;
    link.target = "_blank";
    li.appendChild(link);

    queueList.appendChild(li);
  });
}

skipButton?.addEventListener("click", async () => {
  chrome.storage.local.get(["queue"], async (data) => {
    const queue: { url: string; title: string }[] = data.queue || [];
    if (queue.length <= 0) return;

    const [, ...rest] = queue;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id && rest[0]?.url) {
        chrome.tabs.update(activeTab.id, { url: rest[0].url }, () => {
          chrome.storage.local.set({ queue: rest }, () => {
            renderQueue(rest);
          });
        });
      }
    });
  });
});

playButton?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    chrome.tabs.sendMessage(tabId, { action: "playVideo" });
  });
});

pauseButton?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    chrome.tabs.sendMessage(tabId, { action: "pauseVideo" });
  });
});

const getYouTubeTitle = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelector("title")?.innerText || "";
    return title.replace(" - YouTube", "");
  } catch (err) {
    return "Unknown Title";
  }
};

// fix queue issue not showing when extension remains open
chrome.storage.local.get(["queue"], async (data) => {
  const queue: { url: string; title: string }[] = data.queue || [];
  renderQueue(queue);
});
