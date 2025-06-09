function checkIfVideoEnded() {
  const video = document.querySelector("video");
  if (!video) return;
  console.log("Video element found:", video);

  video.addEventListener("ended", () => {
    chrome.storage.local.get(["queue"], (data) => {
      const queue: { url: string; title: string }[] = data.queue || [];
      const [current, ...rest] = queue;
      console.log("Queue:", queue);

      if (rest.length > 0) {
        chrome.storage.local.set({ queue: rest }, () => {
          window.location.href = rest[0].url;
        });
      } else {
        chrome.storage.local.set({ queue: [] });
        alert("Queue finished!");
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTitle") {
    const title = document.title.replace(" - YouTube", "");
    sendResponse({ title });
  }
  return true;
});

window.addEventListener("load", () => {
  setTimeout(checkIfVideoEnded, 1000);
});
