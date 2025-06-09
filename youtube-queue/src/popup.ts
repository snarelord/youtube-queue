import { get } from "http";

const addButton = document.getElementById("add") as HTMLButtonElement;
const clearButton = document.getElementById("clear") as HTMLButtonElement;
const queueList = document.getElementById("queue") as HTMLUListElement;
const skipButton = document.getElementById("skip") as HTMLButtonElement;

addButton?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url || "";
    if (url.includes("youtube.com/watch")) {
      chrome.storage.local.get(["queue"], (data) => {
        const queue: string[] = data.queue || [];
        if (!queue.includes(url)) {
          chrome.storage.local.set({ queue: [...queue, url] }, async () => {
            await renderQueue([...queue, url]);
          });
        }
      });
    }
  });
});

clearButton?.addEventListener("click", () => {
  chrome.storage.local.set({ queue: [] }, async () => {
    await renderQueue([]);
  });
});

async function renderQueue(queue: string[]) {
  queueList.innerHTML = "";

  for (const url of queue) {
    const title = await getYouTubeTitle(url);
    const li = document.createElement("li");
    const titleEl = document.createElement("strong");
    titleEl.textContent = title;
    li.appendChild(titleEl);
    li.appendChild(document.createElement("br"));
    const link = document.createElement("a");
    link.href = url;
    link.textContent = url;
    link.target = "_blank";
    li.appendChild(link);
    queueList.appendChild(li);
  }
}

skipButton?.addEventListener("click", () => {
  chrome.storage.local.get(["queue"], (data) => {
    const queue: string[] = data.queue || [];
    if (queue.length <= 1) {
      alert("No next video in queue!");
      return;
    }
    const [, ...rest] = queue;
    chrome.storage.local.set({ queue: rest }, async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.update(tabs[0].id, { url: rest[0] });
        }
      });
      await renderQueue(rest);
    });
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

// Render queue when popup opens
chrome.storage.local.get(["queue"], async (data) => {
  const queue: string[] = data.queue || [];
  await renderQueue(queue);
});
