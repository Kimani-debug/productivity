(function () {
  const DURATIONS = {
    focus: 1 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const timerDisplay = document.getElementById("timer_display");
  const currentTaskName = document.getElementById("current_task_name");
  const sessionType = document.getElementById("session_type");

  const startButton = document.getElementById("start_button");
  const pauseButton = document.getElementById("pause_button");
  const skipButton = document.getElementById("skip_button");
  const resetButton = document.getElementById("reset_button");
  const restartButton = document.getElementById("restart_button");

  const taskInput = document.getElementById("task_input");
  const addTaskButton = document.getElementById("add_task_button");
  const taskList = document.getElementById("task_list");

  const pomodoroCountEl = document.getElementById("pomodoro_count");
  const focusMinutesEl = document.getElementById("focus_minutes");
  const shortBreaksEl = document.getElementById("short_breaks");
  const longBreaksEl = document.getElementById("long_breaks");

  let timerInterval = null;
  let isRunning = false;
  let isTransitioning = false;
  let currentMode = "focus";
  let timeLeft = DURATIONS.focus;
  let completedPomodoros = 0;
  let totalFocusMinutes = 0;
  let shortBreakCount = 0;
  let longBreakCount = 0;
  let draggedItem = null;
  let soundInterval = null;

  let tasks = [];
  let nextTaskId = 1;

  const audioCtx = new AudioContext();

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const workRemaining = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return workRemaining;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    sessionType.textContent =
      currentMode === "focus"
        ? "FOCUS"
        : currentMode === "shortBreak"
        ? "SHORT BREAK"
        : "LONG BREAK";
  }

  function updateStats() {
    pomodoroCountEl.textContent = completedPomodoros;
    focusMinutesEl.textContent = totalFocusMinutes;
    shortBreaksEl.textContent = shortBreakCount;
    longBreaksEl.textContent = longBreakCount;
  }

  function getCurrentTask() {
    return tasks.find((task) => !task.completed) || null;
  }

  function updateCurrentTaskDisplay() {
    const currentTask = getCurrentTask();
    currentTaskName.textContent = currentTask ? currentTask.text : "No task selected";
  }

  function createTaskElement(task) {
    const item = document.createElement("div");
    item.className = "task-item";
    item.dataset.taskId = String(task.id);
    item.draggable = true;

    if (task.completed) {
      item.classList.add("completed");
    }

    // --- Drag events ---
    item.addEventListener("dragstart", (e) => {
      // Only drag when grabbing the item itself, not checkbox or remove button
      if (e.target.closest(".task-checkbox") || e.target.closest("button")) {
        e.preventDefault();
        return;
      }
      draggedItem = item;
      item.style.opacity = "0.4";
    });
    item.addEventListener("dragend", () => {
      item.style.opacity = "1";
      draggedItem = null;
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedItem || draggedItem === item) return;

      // Reorder the DOM
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        taskList.insertBefore(draggedItem, item);
      } else {
        taskList.insertBefore(draggedItem, item.nextSibling);
      }

      // Sync the tasks array to match new DOM order
      const newOrder = [...taskList.children].map(
        (el) => tasks.find((t) => t.id === Number(el.dataset.taskId))
      );
      tasks = newOrder;
      updateCurrentTaskDisplay();
    });

    // --- Rest of your existing code ---
    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "10px";

    const checkbox = document.createElement("div");
    checkbox.className = "task-checkbox";
    checkbox.setAttribute("role", "checkbox");
    checkbox.setAttribute("tabindex", "0");
    checkbox.setAttribute("aria-checked", String(task.completed));

    const text = document.createElement("span");
    text.textContent = task.text;
    text.className = "task-text";

    function updateTaskUI() {
      item.classList.toggle("completed", task.completed);
      checkbox.setAttribute("aria-checked", String(task.completed));
    }

    checkbox.addEventListener("click", () => {
      task.completed = !task.completed;
      updateTaskUI();
      updateCurrentTaskDisplay();
    });

    checkbox.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        task.completed = !task.completed;
        updateTaskUI();
        updateCurrentTaskDisplay();
      }
    });

    left.appendChild(checkbox);
    left.appendChild(text);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.className = "btn-control";
    removeBtn.style.padding = "6px 10px";
    removeBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      renderTasks();
      updateCurrentTaskDisplay();
    });

    item.appendChild(left);
    item.appendChild(removeBtn);

    updateTaskUI();
    return item;
  }

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({
      id: nextTaskId++,
      text,
      completed: false,
    });

    taskInput.value = "";
    renderTasks();
    updateCurrentTaskDisplay();
  }

  function setMode(mode) {
    currentMode = mode;
    timeLeft =
      mode === "focus"
        ? DURATIONS.focus
        : mode === "shortBreak"
        ? DURATIONS.shortBreak
        : DURATIONS.longBreak;
    updateDisplay();
  }

  function pauseTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
  }

function startTimer() {
    if (isRunning) return;
   
    isRunning = true;
    playSessionSound();

   timerInterval = setInterval(async () => {

    if (timeLeft <= 0 && !isTransitioning) {
      isTransitioning = true;
      updateStats();
      await sleep(500);
      isTransitioning = false;
      completeSession();
      return;
    }

    timeLeft -= 1;
    updateDisplay();

    }, 1000);
  }

  function resetTimer() {
    pauseTimer();
    setMode(currentMode);
  }

  function restartTimer(){
    pauseTimer();

    completedPomodoros = 0;
    totalFocusMinutes = 0;
    shortBreakCount = 0;
    longBreakCount = 0;

    updateStats();
    setMode("focus");
  }

  function skipTimer() {
    pauseTimer();
    completeSession(true);
  }

  function chime() {
    const ctx = audioCtx;
    ctx.resume();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  }

  function playSessionSound() {
    chime();
  }


  function completeSession(skipped = false) {
    let mode;

    if (currentMode === "focus") {
      if (!skipped) {
        playSessionSound();
        completedPomodoros += 1;
        totalFocusMinutes += DURATIONS.focus / 60;
        updateStats(); //Starts with focus session updates after each session is completed
      }

      if (!skipped && completedPomodoros % 3 === 0) {
        playSessionSound();
        longBreakCount += 1;
        mode = "longBreak";
      } else {
        playSessionSound();
        shortBreakCount += 1;
        mode = "shortBreak";
      }
      setMode(mode);
    } 
    
    else 
    {
      setMode("focus");
    }
    updateCurrentTaskDisplay();
  }

  startButton.addEventListener("click", startTimer);
  pauseButton.addEventListener("click", pauseTimer);
  resetButton.addEventListener("click", resetTimer);
  skipButton.addEventListener("click", skipTimer);
  restartButton.addEventListener("click", restartTimer);

  addTaskButton.addEventListener("click", addTask);
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  });

  updateDisplay();
  updateStats();
  updateCurrentTaskDisplay();

})();