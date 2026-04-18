# This or That 🎴

A two-player "This or That" game for **Sai** and **Lavu**.

## How to play

1. Open the website and select who you are (Sai or Lavu).
2. **Create Flashcard** – Add a pair of options to choose between.
3. **Play** – Go through each flashcard and pick your choice.
4. **View Answers** – See what both players picked in a side-by-side table.

## Tech stack

HTML · CSS · JavaScript (vanilla) · **Firebase Realtime Database** for shared cloud storage.

## Firebase setup (required)

The game uses Firebase so both players share the same flashcards and answers across devices.

1. Go to <https://console.firebase.google.com/> and create a **free** project.
2. In the project dashboard click the **web** icon (`</>`) to register a web app.
3. Copy the `firebaseConfig` object that Firebase shows you.
4. Open `firebase-config.js` in this repo and replace the placeholder values with your config.
5. In the Firebase console go to **Build → Realtime Database → Create Database**.
6. Choose any location, then select **Start in test mode** (allows open read/write for 30 days).
7. Deploy / push the updated `firebase-config.js` and you're done!

> **Tip:** Firebase API keys are *not* secret — they only identify your project. Security is controlled by the database rules you set in the Firebase console.

## Hosting

This site is ready for GitHub Pages — just enable Pages from the repository settings and point it to the root of the `main` branch.
