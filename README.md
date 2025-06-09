# 📺 YouTube Queue Extension

Add YouTube videos to a queue and play them one after the other. No Premium required.

This Chrome extension brings back the classic "queue" functionality by letting you:

- ➕ **Add videos to a queue** from the current tab or by right clicking on YouTube links
- ▶️ **Automatically skip** to the next video when the current one ends
- ⏭️ **Manually skip** using a skip button
- 🧹 **Clear the queue** with one click
- 📝 **See each video’s title and link** in the popup

---

## 🔧 Features

- Add the currently open YouTube video using the "Add to Queue" button
- Right click any YouTube link and choose "Add to YouTube Queue"
- Autoplay next video when the current one finishes
- Manage your queue in the popup (view, skip, clear)
- Works without YouTube Premium

---

## 🧠 How It Works

- When a video ends, a content script checks if there’s another video in the queue.
- If there is, it redirects to the next video automatically.
- When adding videos via right click, a background tab opens briefly to fetch the title from the page DOM, then closes.

---

## 🧪 Tech Stack

- TypeScript
- Vite (for bundling)
- Chrome Extensions API
- Plain HTML (popup UI)
- DOM manipulation + storage via `chrome.storage.local`

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/snarelord/youtube-queue.git
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Build the extension**
   ```bash
   npm run build
   ```
4. **Load into Chrome**

- Open chrome://extensions

- Enable Developer mode

- Click Load unpacked and select the dist/ folder
