# Japanese Word Frequency Analyzer + SRS WebApp
https://wordfreqdb.netlify.app/

A powerful and intuitive web application for Japanese language learners. Upload your **EPUBs** or **subtitle files**, and let the app:

* **Analyze word frequency** across the entire content.
* **Display definitions** using a lightweight, custom-tailored version of **JMdict**.
* Help you **learn the most frequent words** in the media you provided using a built-in **Spaced Repetition System (SRS)**.
* **Read books online** with a smooth **hover dictionary** that allows one-click SRS additions.

Built with **TypeScript**, **React**, and **Node.js** for speed, scalability, and responsiveness.

## Features

### 1. Word Frequency Analysis

Upload a Japanese **EPUB** or **subtitle file (.srt/.ass/.vtt)** and receive:

* A sorted list of words based on frequency.
* Definitions from a lightweight version of **JMdict**, optimized for this app.
* Quick selection of unknown words to add to your SRS list.

![Frequency Analysis](https://github.com/user-attachments/assets/e9c5054a-b318-4829-9e67-db075a80475d)

### 2. Spaced Repetition System (SRS)

Efficiently learn the words you're encountering most often:

* Automatically schedules reviews.
* Supports simple review UI with word, reading, and meaning.
* Optimized intervals based on your progress.

![SRS Page](https://github.com/user-attachments/assets/27616741-3963-4606-ae38-86a6fc99e3ce)

### 3. Online EPUB Reader + Hover Dictionary

Read Japanese EPUBs directly in your browser:

* Hover over words to instantly see readings and definitions.
* Add any word to your SRS list with a single click.

![EPUB Reader](https://github.com/user-attachments/assets/527df139-9b5b-418e-833f-c8be068d6373)

## Technologies Used

* **Frontend**: React, TypeScript, TailwindCSS
* **Backend**: Node.js, Express
* **Storage**: MongoDB
* **Dictionary**: Custom-minified version of [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html)

## Why This Project?

Reading native Japanese content is one of the best ways to improve, but:

* It's hard to know which words are important.
* Existing tools are too heavy or not beginner-friendly.
* You lose track of what you’ve seen and learned.

This app solves that by giving you a **focused, frequency-based learning path**, all built into the reading experience itself.


## Acknowledgements

* [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) for the dictionary data.
* Japanese learners and open source community for constant inspiration.
