/* ============================================================
   Firebase Configuration

   To set up Firebase for this app:
   1. Go to https://console.firebase.google.com/
   2. Click "Create a project" (or use an existing one)
   3. Once in the project, click the web icon (</>) to add a web app
   4. Register the app and copy the firebaseConfig object below
   5. In the left sidebar go to "Build → Realtime Database"
   6. Click "Create Database" → choose a location → Start in **test mode**
      (test mode allows open read/write for 30 days — fine for this game)
   7. Replace the placeholder values below with your project's config
   ============================================================ */

   const firebaseConfig = {
    apiKey: "AIzaSyCm4y_ZqgkXGJXNa9hj6icYzTIpoBYmbw8",
    authDomain: "this-or-that-dbe87.firebaseapp.com",
    databaseURL: "https://this-or-that-dbe87-default-rtdb.firebaseio.com",
    projectId: "this-or-that-dbe87",
    storageBucket: "this-or-that-dbe87.firebasestorage.app",
    messagingSenderId: "281208426210",
    appId: "1:281208426210:web:2221b7b9b3439f166e58bb",
    measurementId: "G-GJL5N365LJ"
  };

// Initialize Firebase
const _isPlaceholderConfig =
  firebaseConfig.apiKey === "YOUR_API_KEY" ||
  !firebaseConfig.databaseURL ||
  firebaseConfig.databaseURL.includes("YOUR_PROJECT");

if (!_isPlaceholderConfig) {
  firebase.initializeApp(firebaseConfig);
}
const db = _isPlaceholderConfig ? null : firebase.database();
