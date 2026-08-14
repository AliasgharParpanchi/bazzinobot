const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const questions = [
  {q:"کدام مورد یک حیوان است؟", a:["ماشین","گربه","مداد","خانه"], c:1},
  {q:"کدام مورد برای نوشتن استفاده می‌شود؟", a:["مداد","کفش","لیوان","توپ"], c:0},
  {q:"پایتخت ایران کدام است؟", a:["تبریز","شیراز","تهران","رشت"], c:2},
  {q:"کدام مورد میوه است؟", a:["هویج","سیب","نان","پنیر"], c:1},
  {q:"کدام عدد بزرگ‌تر است؟", a:["7","3","5","2"], c:0}
];

let state = {
  score: 0,
  coins: Number(localStorage.getItem("bazino_coins") || 0),
  best: Number(localStorage.getItem("bazino_best") || 0),
  lives: 3,
  qIndex: 0,
  streak: Number(localStorage.getItem("bazino_streak") || 0)
};

const $ = id => document.getElementById(id);

function updateHome(){
  $("coins").textContent = state.coins;
  $("lives").textContent = state.lives;
  $("best").textContent = state.best;
  $("streak").textContent = state.streak;
  $("gameLives").textContent = state.lives;
}

function showScreen(name){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(name).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  const nav = document.querySelector(`[data-screen="${name}"]`);
  if(nav) nav.classList.add("active");
}

function startGame(){
  state.score = 0;
  state.qIndex = 0;
  state.lives = 3;
  showScreen("game");
  renderQuestion();
}

function renderQuestion(){
  const item = questions[state.qIndex];
  if(!item){ finishGame(); return; }

  $("score").textContent = state.score;
  $("gameLives").textContent = state.lives;
  $("questionNumber").textContent = `سؤال ${state.qIndex + 1}`;
  $("question").textContent = item.q;
  $("progressBar").style.width = `${((state.qIndex) / questions.length) * 100}%`;

  const box = $("answers");
  box.innerHTML = "";

  item.a.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = text;
    btn.onclick = () => answer(btn, i === item.c);
    box.appendChild(btn);
  });
}

function answer(button, correct){
  document.querySelectorAll(".answer").forEach(b => b.disabled = true);

  if(correct){
    button.classList.add("correct");
    state.score += 10;
    state.coins += 5;
  }else{
    button.classList.add("wrong");
    state.lives--;
  }

  updateHome();

  setTimeout(() => {
    if(state.lives <= 0 || state.qIndex >= questions.length - 1){
      finishGame();
    }else{
      state.qIndex++;
      renderQuestion();
    }
  }, 650);
}

function finishGame(){
  state.best = Math.max(state.best, state.score);
  localStorage.setItem("bazino_best", state.best);
  localStorage.setItem("bazino_coins", state.coins);
  $("finalScore").textContent = state.score;
  updateHome();
  showScreen("result");
}

$("startBtn").onclick = startGame;
$("againBtn").onclick = startGame;
$("homeBtn").onclick = () => showScreen("home");
$("backBtn").onclick = () => showScreen("home");

document.querySelectorAll(".nav-item[data-screen]").forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.screen;
    if(target === "game") startGame();
    else showScreen(target);
  };
});

// محل اتصال Rewarded Ad در مرحله بعد:
// این تابع را بعد از ساخت Ad Platform در AdsGram به SDK واقعی متصل می‌کنیم.
$("rewardBtn").onclick = () => {
  if (tg?.showAlert) {
    tg.showAlert("بخش دریافت جایزه در مرحله بعد به AdsGram متصل می‌شود.");
  } else {
    alert("بخش دریافت جایزه در مرحله بعد به AdsGram متصل می‌شود.");
  }
};

updateHome();
