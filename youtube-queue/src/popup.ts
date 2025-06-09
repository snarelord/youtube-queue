import { get } from "http";

const addButton = document.getElementById("add") as HTMLButtonElement;
const clearButton = document.getElementById("clear") as HTMLButtonElement;
const queueList = document.getElementById("queue") as HTMLUListElement;
const skipButton = document.getElementById("skip") as HTMLButtonElement;
const playPauseButton = document.getElementById("playPauseButton") as HTMLButtonElement;

document.addEventListener("DOMContentLoaded", () => {
  // check initial video state when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab?.id) {
      chrome.scripting
        .executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            const video = document.querySelector("video");
            return video ? !video.paused : false;
          },
        })
        .then((results) => {
          if (results && results[0]) {
            const isPlaying = results[0].result;
            updatePlayPauseButton(isPlaying ?? false);
          }
        })
        .catch(() => {
          updatePlayPauseButton(false);
        });
    }
  });
});

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
    if (queue.length <= 1) return;

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

playPauseButton?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab?.id) {
      chrome.scripting
        .executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            const video = document.querySelector("video");
            if (video) {
              const wasPaused = video.paused;
              video.paused ? video.play() : video.pause();
              return !wasPaused;
            }
            return false;
          },
        })
        .then((results) => {
          if (results && results[0]) {
            const isPlaying: boolean = results[0].result ?? false;
            updatePlayPauseButton(isPlaying ?? false);
          }
        });
    }
  });
});

function updatePlayPauseButton(isPlaying: boolean) {
  const playPauseButton = document.getElementById("playPauseButton") as HTMLButtonElement;
  const playIcon = document.getElementById("playIcon") as HTMLSpanElement;
  const playPauseText = document.getElementById("playPauseText") as HTMLSpanElement;

  if (isPlaying) {
    playPauseButton.classList.add("playing");
    playIcon.className = "pause-icon";
    playPauseText.textContent = "Paused";
  } else {
    playPauseButton.classList.remove("playing");
    playIcon.className = "play-icon";
    playPauseText.textContent = "Playing";
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  if (activeTab?.id) {
    chrome.scripting
      .executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          const video = document.querySelector("video");
          return video ? !video.paused : false;
        },
      })
      .then((results) => {
        if (results && results[0]) {
          const isPlaying = results[0].result;
          updatePlayPauseButton(isPlaying ?? false);
        }
      });
  }
});

// Render queue when popup opens
chrome.storage.local.get(["queue"], async (data) => {
  const queue: { url: string; title: string }[] = data.queue || [];
  renderQueue(queue);
});
