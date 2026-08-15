// =====================================================
// BAZZINO - Telegram Mini App
// =====================================================

// -----------------------------------------------------
// TELEGRAM
// -----------------------------------------------------

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}


// -----------------------------------------------------
// CONFIG
// -----------------------------------------------------

const config = window.BAZINO_CONFIG;

if (!config) {
  console.error("BAZINO_CONFIG پیدا نشد.");
}


// -----------------------------------------------------
// ADSGRAM CONFIG
// -----------------------------------------------------

const ADSGRAM_BLOCK_ID =
  config?.ads?.adsgram?.blockId || null;

let AdController = null;


// -----------------------------------------------------
// ADSGRAM INITIALIZATION
// -----------------------------------------------------

function initAdsgram() {

  // بررسی SDK
  if (!window.Adsgram) {

    console.error(
      "AdsGram SDK loaded نشده است."
    );

    return false;
  }


  // بررسی Config
  if (!ADSGRAM_BLOCK_ID) {

    console.error(
      "AdsGram Block ID در config وجود ندارد."
    );

    return false;
  }


  try {

    AdController = window.Adsgram.init({
      blockId: ADSGRAM_BLOCK_ID
    });

    console.log(
      "AdsGram initialized:",
      ADSGRAM_BLOCK_ID
    );

    return true;

  } catch (error) {

    console.error(
      "خطا در راه‌اندازی AdsGram:",
      error
    );

    return false;
  }
}


// =====================================================
// GAME DATA
// =====================================================

const questions = [

  {
    q: "کدام مورد یک حیوان است؟",
    a: [
      "ماشین",
      "گربه",
      "مداد",
      "خانه"
    ],
    c: 1
  },

  {
    q: "کدام مورد برای نوشتن استفاده می‌شود؟",
    a: [
      "مداد",
      "کفش",
      "لیوان",
      "توپ"
    ],
    c: 0
  },

  {
    q: "پایتخت ایران کدام است؟",
    a: [
      "تبریز",
      "شیراز",
      "تهران",
      "رشت"
    ],
    c: 2
  },

  {
    q: "کدام مورد میوه است؟",
    a: [
      "هویج",
      "سیب",
      "نان",
      "پنیر"
    ],
    c: 1
  },

  {
    q: "کدام عدد بزرگ‌تر است؟",
    a: [
      "7",
      "3",
      "5",
      "2"
    ],
    c: 0
  }

];


// =====================================================
// GAME STATE
// =====================================================

let state = {

  score: 0,

  coins: Number(
    localStorage.getItem("bazino_coins") || 0
  ),

  best: Number(
    localStorage.getItem("bazino_best") || 0
  ),

  lives: 3,

  qIndex: 0,

  streak: Number(
    localStorage.getItem("bazino_streak") || 0
  )

};


// =====================================================
// DOM HELPER
// =====================================================

const $ = (id) =>
  document.getElementById(id);


// =====================================================
// UPDATE HOME
// =====================================================

function updateHome() {

  $("coins").textContent =
    state.coins;

  $("lives").textContent =
    state.lives;

  $("best").textContent =
    state.best;

  $("streak").textContent =
    state.streak;

  $("gameLives").textContent =
    state.lives;
}


// =====================================================
// SCREEN MANAGEMENT
// =====================================================

function showScreen(name) {

  document
    .querySelectorAll(".screen")
    .forEach((screen) => {

      screen.classList.remove("active");

    });


  const target =
    $(name);

  if (target) {

    target.classList.add("active");

  }


  document
    .querySelectorAll(".nav-item")
    .forEach((item) => {

      item.classList.remove("active");

    });


  const nav =
    document.querySelector(
      `[data-screen="${name}"]`
    );


  if (nav) {

    nav.classList.add("active");

  }
}


// =====================================================
// START GAME
// =====================================================

function startGame() {

  state.score = 0;

  state.qIndex = 0;

  state.lives = 3;

  showScreen("game");

  renderQuestion();
}


// =====================================================
// RENDER QUESTION
// =====================================================

function renderQuestion() {

  const item =
    questions[state.qIndex];


  if (!item) {

    finishGame();

    return;
  }


  $("score").textContent =
    state.score;


  $("gameLives").textContent =
    state.lives;


  $("questionNumber").textContent =
    `سؤال ${state.qIndex + 1}`;


  $("question").textContent =
    item.q;


  $("progressBar").style.width =
    `${(state.qIndex / questions.length) * 100}%`;


  const box =
    $("answers");


  box.innerHTML = "";


  item.a.forEach((text, index) => {

    const button =
      document.createElement("button");


    button.className =
      "answer";


    button.textContent =
      text;


    button.onclick = () => {

      answer(
        button,
        index === item.c
      );

    };


    box.appendChild(button);

  });

}


// =====================================================
// ANSWER
// =====================================================

function answer(button, correct) {

  document
    .querySelectorAll(".answer")
    .forEach((item) => {

      item.disabled = true;

    });


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


// =====================================================
// FINISH GAME
// =====================================================

function finishGame() {

  state.best =
    Math.max(
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


// =====================================================
// REWARDED ADSGRAM AD
// =====================================================

async function showRewardedAd() {

  // اگر Controller ساخته نشده
  if (!AdController) {

    const initialized =
      initAdsgram();


    if (!initialized) {

      showMessage(
        "تبلیغ فعلاً آماده نیست."
      );

      return;
    }
  }


  try {

    console.log(
      "درخواست نمایش تبلیغ..."
    );


    /*
     * در Rewarded Ad:
     *
     * اگر کاربر تبلیغ را کامل ببیند
     * Promise موفق می‌شود.
     *
     * اگر تبلیغ skip شود یا خطایی رخ دهد
     * Promise شکست می‌خورد.
     */

    const result =
      await AdController.show();


    console.log(
      "AdsGram Reward:",
      result
    );


    // =================================================
    // REWARD
    // =================================================

    state.lives +=
      config.rewards.rewardedAd.lives;


    state.coins +=
      config.rewards.rewardedAd.coins;


    localStorage.setItem(
      "bazino_coins",
      state.coins
    );


    updateHome();


    showMessage(
      `🎉 تبریک!\n` +
      `❤️ +${config.rewards.rewardedAd.lives} جان\n` +
      `🪙 +${config.rewards.rewardedAd.coins} سکه`
    );


  } catch (error) {

    console.error(
      "AdsGram error:",
      error
    );


    showMessage(
      "تبلیغ کامل مشاهده نشد یا فعلاً تبلیغی موجود نیست."
    );

  }

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message) {

  if (tg?.showAlert) {

    tg.showAlert(message);

  } else {

    alert(message);

  }

}


// =====================================================
// BUTTONS
// =====================================================

$("startBtn").onclick =
  startGame;


$("againBtn").onclick =
  startGame;


$("homeBtn").onclick =
  () => {

    showScreen("home");

  };


$("backBtn").onclick =
  () => {

    showScreen("home");

  };


// =====================================================
// NAVIGATION
// =====================================================

document
  .querySelectorAll(".nav-item[data-screen]")
  .forEach((button) => {

    button.onclick = () => {

      const target =
        button.dataset.screen;


      if (target === "game") {

        startGame();

      } else {

        showScreen(target);

      }

    };

  });


// =====================================================
// REWARDED AD BUTTON
// =====================================================

$("rewardBtn").onclick =
  showRewardedAd;


// =====================================================
// INITIALIZATION
// =====================================================

updateHome();

initAdsgram();