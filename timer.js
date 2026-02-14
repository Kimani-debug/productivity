const timerDisplay = document.getElementById("timer");
const restTimer = document.getElementById("rest_timer");
const startBtn = document.getElementById("start_button");
const pauseBtn = document.getElementById("pause_button");
const resetBtn = document.getElementById("reset_button");
const workTxt = document.getElementById("work_text");
const breakTxt = document.getElementById("break_text");
const workBlkTxt = document.getElementById("workblk");
const restBlkTxt = document.getElementById("restblk");

let duration = Number(timerDisplay.textContent) * 60;
let restDuration = Number(restTimer.textContent) * 60;
let longRest = 3 * 60;

let workRemaining = duration;
let restRemaining = restDuration;

let intervalId = null;
let endTime = null;
let isRunning = false;
let restTime = false;
let startCount = 0;

restTimer.style.display = "none";
timerDisplay.style.display = "block";
workTxt.style.display = "block";
breakTxt.style.display = "none";
workBlkTxt.style.display = "none";
restBlkTxt.style.display = "none";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay() {
  if (restTime) {
    restTimer.textContent = formatTime(restRemaining);
  } else {
    timerDisplay.textContent = formatTime(workRemaining);
  }
}

function startTimer() {
  if (isRunning) return;
  
  startCount++;
  restTime = false;
  isRunning = true;

  restTimer.style.display = "none";
  restBlkTxt.style.display = "none";
  workTxt.style.display = "block";
  timerDisplay.style.display = "block";

  endTime = Date.now() + workRemaining * 1000;

  intervalId = setInterval(async () => {
    const now = Date.now();
    workRemaining = Math.max(0, Math.round((endTime - now) / 1000));

    updateDisplay();

    if (workRemaining <= 0) {
      clearInterval(intervalId);
      isRunning = false;

      timerDisplay.style.display = "none";
      workTxt.style.display = "none";
      workBlkTxt.style.display = "block";
      await sleep(3000);
      rest_Timer(); // start rest after work completes
    }
  }, 250);
}

function rest_Timer() {
  if (isRunning) return;
  restTime = true;
  isRunning = true;
  
    if(startCount == 3)
    {
    restRemaining = longRest
    startCount = 0;    
    } else {
    restRemaining = restDuration;
    }

  workBlkTxt.style.display = "none";
  timerDisplay.style.display = "none";
  restTimer.style.display = "block";
  breakTxt.style.display = "block";
  
  // IMPORTANT: base endTime on restRemaining
  endTime = Date.now() + restRemaining * 1000;

  intervalId = setInterval(async () => {
    const now = Date.now();
    restRemaining = Math.max(0, Math.round((endTime - now) / 1000));

    updateDisplay();

    if (restRemaining <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      restTime = false;

      // reset rest for next cycle, reset work for next cycle (optional)
      restRemaining = restDuration;
      workRemaining = duration;

      breakTxt.style.display = "none";
      timerDisplay.style.display = "none";
      restBlkTxt.style.display = "block";
      await sleep(3000);
      startTimer(); // start work again
    }
  }, 250);
}

function pauseTimer() {
  if (!isRunning) return;

  clearInterval(intervalId);
  isRunning = false;

  const now = Date.now();
  const remaining = Math.max(0, Math.round((endTime - now) / 1000));

  if (restTime) restRemaining = remaining;
  else workRemaining = remaining;

  updateDisplay();
}

function resetTimer() {
  clearInterval(intervalId);
  isRunning = false;
  restTime = false;

  workRemaining = duration;
  restRemaining = restDuration;

  restTimer.style.display = "none";
  timerDisplay.style.display = "none";

  updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
