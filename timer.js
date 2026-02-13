const timerDisplay = document.getElementById("timer");
const restTimer = document.getElementById("rest_timer");
const startBtn = document.getElementById("start_button");
const pauseBtn = document.getElementById("pause_button");
const resetBtn = document.getElementById("reset_button");
const workTxt = document.getElementById("work_text");
const breakTxt = document.getElementById("break_text");

let duration = Number(timerDisplay.textContent) * 60;
let restDuration = Number(restTimer.textContent) * 60;

let workRemaining = duration;
let restRemaining = restDuration;

let intervalId = null;
let endTime = null;
let isRunning = false;
let restTime = false;

restTimer.style.display = "none";
timerDisplay.style.display = "none";
workTxt.style.display = "none";
breakTxt.style.display = "none";

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
  restTime = false;
  isRunning = true;

  restTimer.style.display = "none";
  timerDisplay.style.display = "block";

  endTime = Date.now() + workRemaining * 1000;

  intervalId = setInterval(() => {
    const now = Date.now();
    workRemaining = Math.max(0, Math.round((endTime - now) / 1000));

    updateDisplay();

    if (workRemaining <= 0) {
      clearInterval(intervalId);
      isRunning = false;

      timerDisplay.style.display = "none";
      rest_Timer(); // start rest after work completes
    }
  }, 250);
}

function rest_Timer() {
  if (isRunning) return;
  restTime = true;
  isRunning = true;

  timerDisplay.style.display = "none";
  restTimer.style.display = "block";

  // IMPORTANT: base endTime on restRemaining
  endTime = Date.now() + restRemaining * 1000;

  intervalId = setInterval(() => {
    const now = Date.now();
    restRemaining = Math.max(0, Math.round((endTime - now) / 1000));

    updateDisplay();

    if (restRemaining <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      alert("Break session complete!");

      // reset rest for next cycle, reset work for next cycle (optional)
      restRemaining = restDuration;
      workRemaining = duration;

      restTime = false;
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
