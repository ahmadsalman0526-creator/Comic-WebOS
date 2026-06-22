# 🌌 Cosmic WebOS

Welcome to Cosmic WebOS! This is a custom, space-themed virtual desktop environment that I built from scratch for the **Hack Club Stardance** challenge. Instead of following the classic retro or basic computer styles in the guide, I wanted to create something modern, clean, and completely my own.

---

## 🛠️ Project Credits & Collaboration Breakdown

I wanted to be 100% transparent about how this project came together. I designed and built the entire core interface by myself, and used an AI assistant to help me troubleshoot and write some of the advanced background JavaScript logic.

### 🧑‍💻 What I Did (The Developer)
* **UI/UX & Design:** I entirely designed the "Cosmic Space" aesthetic. I picked the dark nebula color scheme, created the custom frosted-glass (glassmorphism) layout, and positioned all the desktop elements.
* **HTML Structure:** I wrote the full HTML skeleton for the desktop environment, the pop-up start menu, the taskbar, and all four individual application windows.
* **CSS Styling:** I built the entire stylesheet from scratch, including custom CSS variables, layout grids, text shadows, responsive button states, and the background theme-swapping logic.
* **Feature Concept:** I came up with the idea for the **Central Smart Search Hub** as my unique custom feature to keep the desktop looking clean and futuristic.
* **Bug Squashing:** I caught some annoying display bugs during testing, including a character encoding glitch that was breaking my emojis, and fixed it by configuring the proper head meta tags.

### 🤖 What the AI Did (My Coding Assistant)
* **Window Dragging Math:** While I designed the windows, the AI helped me write the JavaScript mouse coordinate math (`clientX` / `clientY`) so the windows glide smoothly across the screen when you drag them.
* **Iframe Security Patch:** When my Web Browser app kept hitting a wall loading external sites due to security blocks, the AI suggested and helped write a custom `srcdoc` sandbox wrapper to keep the app working cleanly.
* **JS Code Cleanup:** The AI helped me organize my separate script ideas into a unified, object-oriented JavaScript system so everything runs fast and doesn't lag.

---

## 🚀 Cool Features to Try

* **Central Command Hub:** Try typing commands right into the main search bar! If you type `open calc`, it boots the calculator. If you type `stardance` or `hackclub`, it will securely load those custom portals right inside the web browser app.
* **Full Window Management:** You can drag windows around, minimize them to the taskbar, close them, or click them to bring them to the front.
* **Auto-Saving Notes:** Anything you type into the Notepad app automatically saves to your browser's local storage, so your text is safe even if you refresh.
* **Nebula Theme Switcher:** Open up Settings to instantly swap out the background gradient for a completely different cosmic look.

## 📦 Tech Stack
* **HTML5:** Clean structural layout with proper character encoding.
* **CSS3:** Glassmorphic backdrop filters, custom animations, variables, and depth scaling.
* **JavaScript:** Pure vanilla JS built using an object-oriented layout.
