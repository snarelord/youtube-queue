function checkIfVideoEnded() {
  const waitForVideo = setInterval(() => {
    const video = document.querySelector("video") as HTMLVideoElement | null;
    if (video) {
      console.log("Video element found");
      clearInterval(waitForVideo);

      video.addEventListener("ended", () => {
        console.log("Video ended. Moving to next in queue...");

        chrome.storage.local.get(["queue"], (data) => {
          const queue: { url: string; title: string }[] = data.queue || [];
          const [current, ...rest] = queue;

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
  }, 1000);
}

window.addEventListener("DOMContentLoaded", checkIfVideoEnded);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTitle") {
    const title = document.title.replace(" - YouTube", "");
    sendResponse({ title });
  }
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const video = document.querySelector("video");
  if (!video) return;
  switch (message.action) {
    case "playVideo":
      video.play();
      break;

    case "pauseVideo":
      video.pause();
      break;
  }
  return true;
});

window.addEventListener("load", () => {
  setTimeout(checkIfVideoEnded, 1000);
});
