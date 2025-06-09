function checkIfVideoEnded() {
  const video = document.querySelector("video");

  if (!video) return;
  console.log("Video element found:", video);
  video.addEventListener("ended", () => {
    chrome.storage.local.get(["queue"], (data) => {
      const queue: string[] = data.queue || [];
      const [current, ...rest] = queue;
      console.log(queue);
      if (rest.length > 0) {
        chrome.storage.local.set({ queue: rest }, () => {
          window.location.href = rest[0];
        });
      } else {
        chrome.storage.local.set({ queue: [] });
        alert("Queue finished!");
      }
    });

    if (!chrome.storage.local) {
      console.error(" -- - -- - - -Chrome storage is not available.");
      return;
    }
  });
}

window.addEventListener("load", () => {
  setTimeout(checkIfVideoEnded, 1000);
});
