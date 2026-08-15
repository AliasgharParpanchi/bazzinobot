const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// ===============================
// ADSGRAM
// ===============================

// اینجا Block ID خودت را قرار بده
const ADSGRAM_BLOCK_ID = "YOUR_BLOCK_ID";

let AdController = null;

function initAdsgram() {
  if (!window.Adsgram) {
    console.error("AdsGram SDK loaded نیست.");
    return false;
  }

  if (ADSGRAM_BLOCK_ID === "YOUR_BLOCK_ID") {
    console.warn("Block ID هنوز وارد نشده است.");
    return false;
  }

  try {
    AdController = window.Adsgram.init({
      blockId: ADSGRAM_BLOCK_ID
    });

    return true;
  } catch (error) {
    console.error("خطا در راه‌اندازی AdsGram:", error);
    return false;
  }
}

// ===============================
// GAME DATA
// ===============================

const questions = [
  {
    q: "کدام مورد یک حیوان است؟",
    a: ["ماشین", "گربه", "مداد", "خانه"],
    c: 1
  },
  {
    q: "کدام مورد برای نوشتن استفاده می‌شود؟",
    a: ["مداد", "کفش", "لیوان", "توپ"],
    c: 0
  },
  {
    q: "پایتخت ایران کدام است؟",
    a: ["تبریز", "شیراز", "تهران", "رشت"],
    c: 2
  },
  {
    q: "کدام مورد میوه است؟",
    a: ["هویج", "سیب", "نان", "پنیر"],
    c: 1
  },
  {
    q: "کدام عدد بزرگ‌تر است؟",
    a: ["7", "3", "5", "2"],
    c: 0
  }
];

// ===============================
// GAME STATE
// ===============================

let state = {
  score: 0,
  coins: Number(localStorage.getItem("bazino_coins") || 0),
  best: Number(localStorage.getItem("bazino_best") || 0),
  lives: 3,
  qIndex: 0,
  streak: Number(localStorage.getItem("bazino_streak") || 0)
};

const $ = (id) => document.getElementById(id);

// ===============================
// UI
// ===============================

function updateHome() {
  $("coins").textContent = state.coins;
  $("lives").textContent = state.lives;
  $("best").textContent = state.best;
  $("streak").textContent = state.streak;
  $("gameLives").textContent = state.lives;
}

function showScreen(name) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));

  $(name).classList.add("active");

  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  const nav = document.querySelector(`[data-screen="${name}"]`);

  if (nav) {
    nav.classList.add("active");
  }
}

// ===============================
// START GAME
// ===============================

function startGame() {
  state.score = 0;
  state.qIndex = 0;
  state.lives = 3;

  showScreen("game");
  renderQuestion();
}

// ===============================
// RENDER QUESTION
// ===============================

function renderQuestion() {
  const item = questions[state.qIndex];

  if (!item) {
    finishGame();
    return;
  }

  $("score").textContent = state.score;
  $("gameLives").textContent = state.lives;

  $("questionNumber").textContent =
    `سؤال ${state.qIndex + 1}`;

  $("question").textContent = item.q;

  $("progressBar").style.width =
    `${((state.qIndex) / questions.length) * 100}%`;

  const box = $("answers");

  box.innerHTML = "";

  item.a.forEach((text, i) => {

    const btn = document.createElement("button");

    btn.className = "answer";

    btn.textContent = text;

    btn.onclick = () => {
      answer(btn, i === item.c);
    };

    box.appendChild(btn);
  });
}

// ===============================
// ANSWER
// ===============================

function answer(button, correct) {

  document
    .querySelectorAll(".answer")
    .forEach((b) => b.disabled = true);

  if (correct) {

    button.classList.add("correct");

    state.score += 10;
    state.coins += 5;

  } else {

    button.classList.add("wrong");

    state.lives--;
  }

  updateHome();

  setTimeout(() => {

    if (
      state.lives <= 0 ||
      state.qIndex >= questions.length - 1
    ) {

      finishGame();

    } else {

      state.qIndex++;

      renderQuestion();
    }

  }, 650);
}

// ===============================
// FINISH GAME
// ===============================

function finishGame() {

  state.best = Math.max(
    state.best,
    state.score
  );

  localStorage.setItem(
    "bazino_best",
    state.best
  );

  localStorage.setItem(
    "bazino_coins",
    state.coins
  );

  $("finalScore").textContent =
    state.score;

  updateHome();

  showScreen("result");
}

// ===============================
// REWARDED AD
// ===============================

async function showRewardedAd() {

  if (!AdController) {

    const initialized = initAdsgram();

    if (!initialized) {

      showMessage(
        "تبلیغ فعلاً آماده نیست."
      );

      return;
    }
  }

  try {

    // نمایش تبلیغ
    const result = await AdController.show();

    /*
      در Rewarded Ad فقط زمانی جایزه می‌دهیم
      که تبلیغ با موفقیت نمایش داده شده باشد.
    */

    if (result && result.done === false) {

      showMessage(
        "تبلیغ کامل مشاهده نشد."
      );

      return;
    }

    // ==========================
    // REWARD
    // ==========================

    state.lives += 1;

    state.coins += 20;

    localStorage.setItem(
      "bazino_coins",
      state.coins
    );

    updateHome();

    showMessage(
      "🎉 تبریک!\nیک ❤️ جان و ۲۰ 🪙 سکه دریافت کردی."
    );

  } catch (error) {

    console.error(
      "AdsGram error:",
      error
    );

    showMessage(
      "فعلاً تبلیغی برای نمایش وجود ندارد."
    );
  }
}

// ===============================
// MESSAGE
// ===============================

function showMessage(message) {

  if (tg?.showAlert) {

    tg.showAlert(message);

  } else {

    alert(message);
  }
}

// ===============================
// BUTTONS
// ===============================

$("startBtn").onclick =
  startGame;

$("againBtn").onclick =
  startGame;

$("homeBtn").onclick =
  () => showScreen("home");

$("backBtn").onclick =
  () => showScreen("home");

// ===============================
// NAVIGATION
// ===============================

document
  .querySelectorAll(".nav-item[data-screen]")
  .forEach((btn) => {

    btn.onclick = () => {

      const target =
        btn.dataset.screen;

      if (target === "game") {

        startGame();

      } else {

        showScreen(target);
      }
    };
  });

// ===============================
// REWARDED AD BUTTON
// ===============================

$("rewardBtn").onclick =
  showRewardedAd;

// ===============================
// INITIALIZE
// ===============================

updateHome();

// راه‌اندازی AdsGram
initAdsgram();