/* ============================================================
   This or That – Game Logic
   Data is persisted in Firebase Realtime Database so both
   players share the same flashcards and answers in real time.
   ============================================================ */

// ---- State ----
let currentUser = null;   // "sai" | "lavu"
let playIndex = 0;        // index of the card being played

// ---- In-memory data cache (kept in sync by Firebase listeners) ----
let _flashcards = [];
let _answers = {};

// ---- Firebase real-time listeners ----
function initFirebase() {
  let flashcardsReady = false;
  let answersReady = false;

  function checkReady() {
    if (flashcardsReady && answersReady) {
      // Data loaded — hide loading screen, show welcome
      document.getElementById("loading-screen").classList.remove("active");
      document.getElementById("welcome-screen").classList.add("active");
    }
  }

  db.ref("flashcards").on("value", function (snapshot) {
    _flashcards = snapshot.val() || [];
    flashcardsReady = true;
    checkReady();
  });

  db.ref("answers").on("value", function (snapshot) {
    _answers = snapshot.val() || {};
    answersReady = true;
    checkReady();
  });

  // Show a hint if Firebase doesn't respond within 8 seconds
  setTimeout(function () {
    if (!flashcardsReady || !answersReady) {
      document.getElementById("loading-error").classList.remove("hidden");
    }
  }, 8000);
}

// ---- Storage helpers (backed by Firebase) ----
function getFlashcards() {
  // Return a deep copy so callers can mutate safely
  return JSON.parse(JSON.stringify(_flashcards));
}

function saveFlashcards(cards) {
  _flashcards = cards;
  db.ref("flashcards").set(cards);
}

function getAnswers() {
  return JSON.parse(JSON.stringify(_answers));
}

function saveAnswers(answers) {
  _answers = answers;
  db.ref("answers").set(answers);
}

// ---- Screen navigation ----
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function (s) {
    s.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// ---- Login / Logout ----
function login(user) {
  currentUser = user;
  document.getElementById("username-display").textContent =
    user.charAt(0).toUpperCase() + user.slice(1);
  showScreen("menu-screen");
}

function logout() {
  currentUser = null;
  showScreen("welcome-screen");
}

// ---- Create Flashcard ----
function createFlashcard(e) {
  e.preventDefault();
  const optA = document.getElementById("option-a").value.trim();
  const optB = document.getElementById("option-b").value.trim();
  if (!optA || !optB) return;

  const cards = getFlashcards();
  // Each card gets a unique id (safe as a Firebase key)
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  cards.push({ id: id, optionA: optA, optionB: optB });
  saveFlashcards(cards);

  document.getElementById("option-a").value = "";
  document.getElementById("option-b").value = "";
  renderCardList();
}

function deleteFlashcard(index) {
  const cards = getFlashcards();
  const removed = cards.splice(index, 1)[0];
  saveFlashcards(cards);

  // Also remove associated answers
  const answers = getAnswers();
  delete answers[removed.id];
  saveAnswers(answers);

  renderCardList();
}

function renderCardList() {
  const ul = document.getElementById("cards-ul");
  const cards = getFlashcards();
  ul.innerHTML = "";
  cards.forEach(function (c, i) {
    const li = document.createElement("li");
    li.innerHTML =
      "<span>" + escapeHtml(c.optionA) + "  <strong>vs</strong>  " + escapeHtml(c.optionB) + "</span>" +
      '<button class="delete-btn" onclick="deleteFlashcard(' + i + ')">✕</button>';
    ul.appendChild(li);
  });
}

// Show card list whenever create screen is activated
const _origShowScreen = showScreen;
showScreen = function (id) {
  _origShowScreen(id);
  if (id === "create-screen") renderCardList();
};

// ---- Play ----
function startPlay() {
  const cards = getFlashcards();
  const answers = getAnswers();

  // Filter to cards this user hasn't answered yet
  const unanswered = cards.filter(function (c) {
    return !(answers[c.id] && answers[c.id][currentUser]);
  });

  if (cards.length === 0) {
    showScreen("play-screen");
    document.getElementById("no-cards-msg").classList.remove("hidden");
    document.getElementById("card-container").classList.add("hidden");
    document.getElementById("play-done-msg").classList.add("hidden");
    return;
  }

  if (unanswered.length === 0) {
    showScreen("play-screen");
    document.getElementById("no-cards-msg").classList.add("hidden");
    document.getElementById("card-container").classList.add("hidden");
    document.getElementById("play-done-msg").classList.remove("hidden");
    return;
  }

  playIndex = 0;
  window._playQueue = unanswered;
  showScreen("play-screen");
  document.getElementById("no-cards-msg").classList.add("hidden");
  document.getElementById("play-done-msg").classList.add("hidden");
  document.getElementById("card-container").classList.remove("hidden");
  renderPlayCard();
}

function renderPlayCard() {
  const queue = window._playQueue;
  if (playIndex >= queue.length) {
    document.getElementById("card-container").classList.add("hidden");
    document.getElementById("play-done-msg").classList.remove("hidden");
    return;
  }
  const card = queue[playIndex];
  document.getElementById("card-counter").textContent =
    "Card " + (playIndex + 1) + " of " + queue.length;
  document.getElementById("choice-a-text").textContent = card.optionA;
  document.getElementById("choice-b-text").textContent = card.optionB;
}

function pickChoice(choice) {
  const queue = window._playQueue;
  const card = queue[playIndex];
  const picked = choice === "A" ? card.optionA : card.optionB;

  const answers = getAnswers();
  if (!answers[card.id]) answers[card.id] = {};
  answers[card.id][currentUser] = picked;
  saveAnswers(answers);

  playIndex++;
  renderPlayCard();
}

// ---- View Answers ----
function showAnswers() {
  showScreen("answers-screen");
  const cards = getFlashcards();
  const answers = getAnswers();
  const tbody = document.getElementById("answers-tbody");
  tbody.innerHTML = "";

  const hasAny = cards.some(function (c) {
    return answers[c.id] && (answers[c.id].sai || answers[c.id].lavu);
  });

  if (!hasAny) {
    document.getElementById("no-answers-msg").classList.remove("hidden");
    document.getElementById("answers-table").classList.add("hidden");
    return;
  }

  document.getElementById("no-answers-msg").classList.add("hidden");
  document.getElementById("answers-table").classList.remove("hidden");

  cards.forEach(function (c) {
    const a = answers[c.id] || {};
    const tr = document.createElement("tr");

    const tdQ = document.createElement("td");
    tdQ.textContent = c.optionA + " vs " + c.optionB;
    const tdSai = document.createElement("td");
    tdSai.textContent = a.sai || "—";
    const tdLavu = document.createElement("td");
    tdLavu.textContent = a.lavu || "—";

    tr.appendChild(tdQ);
    tr.appendChild(tdSai);
    tr.appendChild(tdLavu);
    tbody.appendChild(tr);
  });
}

// ---- Utility ----
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---- Boot ----
initFirebase();
