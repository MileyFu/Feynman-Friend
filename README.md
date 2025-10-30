# 🧑‍🎓 Feynman Friend

**Entry for the Google Chrome Built-in AI Challenge 2025**

Feynman Friend is a Chrome Extension that helps you test your understanding of any concept using the Feynman Technique. You act as the "teacher," and an on-device AI acts as your "student."

## The Problem

We often read articles or documentation and *think* we understand a concept, but we can't be sure until we try to explain it to someone else. It's hard to find a study partner 24/7.

## The Solution

This extension puts a study partner in your browser.

1.  Highlight any text on a webpage.
2.  Right-click and select "Explain this to Feynman Friend."
3.  A small chat window appears, and your AI "student" will read the text and ask you a simple question about it.
4.  You then type your explanation into the chat.
5.  The AI will either confirm its understanding or ask a follow-up question if you used jargon or were unclear.

This forces you to articulate complex ideas in simple terms, which is the core of the Feynman Technique, helping you solidify your knowledge.

## 🤖 API(s) Used

This project uses the **Prompt API** (via `LanguageModel.create()`) to power the "student." The entire conversation is:
* **Private:** No data ever leaves your device.
* **Fast:** Runs locally using Gemini Nano.
* **Offline-capable:** Works even without an internet connection (once the model is downloaded).

## 🚀 How to Install and Test

Judges can test this extension by following these steps:

1.  **Check Requirements:** Ensure you have a compatible device and Chrome version that supports the Built-in AI APIs (as per the 2025 challenge documentation).
2.  **Download:** Download this repository. You can either use `git clone git clone https://github.com/MileyFu/Feynman-Friend.git` or click the green `<> Code` button -> **Download ZIP**.
3.  **Unzip:** If you downloaded a ZIP, unzip the folder to a permanent location on your computer.
4.  **Load Extension in Chrome:**
    * Open Chrome and navigate to `chrome://extensions`.
    * Turn on **Developer mode** (using the toggle in the top-right).
    * Click the **Load unpacked** button.
    * Select the folder where you just unzipped/cloned the project.
5.  **Test it!**
    * Go to any webpage with a good amount of text (like a Wikipedia article).
    * Highlight a paragraph.
    * Right-click the highlighted text.
    * Select **"Explain this to Feynman Friend"** from the context menu.
    * The chat window will appear, and the AI will ask you its first question. Start teaching!
