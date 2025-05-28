// --- Firebase 設定與初始化 ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {getFirestore, collection, doc, setDoc, getDoc, getDocs,} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA147Q9C0iWu-eU2TVyqIKgEa-fgTNw2hk",
  authDomain: "final-project-33356.firebaseapp.com",
  projectId: "final-project-33356",
  storageBucket: "final-project-33356.appspot.com",
  messagingSenderId: "1034220970104",
  appId: "1:1034220970104:web:57573169fe866896878d8d",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  // ======== DOM 取得 (不變) ========
  const saveGoalBtn = document.getElementById("save-goal-btn");
  const goalInputs = document.querySelectorAll(".goal-item");
  const fireworksContainer = document.getElementById("fireworks-container");
  const weatherLocation = document.getElementById("weather-location");
  const weatherTemp = document.getElementById("weather-temp");
  const weatherDescription = document.getElementById("weather-description");
  const horoscopeSelect = document.getElementById("horoscope-select");
  const horoscopeResult = document.getElementById("horoscope-result");
  const calendarDays = document.getElementById("calendar-days");
  const monthYear = document.getElementById("month-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const eventForm = document.getElementById("event-form");
  const eventDateInput = document.getElementById("event-date");
  const eventDescInput = document.getElementById("event-desc");
  const eventList = document.getElementById("event-list");
  const eventMessage = document.getElementById("event-message");
  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const workInput = document.getElementById("work-time");
  const breakInput = document.getElementById("break-time");
  const cyclesInput = document.getElementById("cycles-input");
  const tomatoElement = document.querySelector(".tomato");
  const pomodoroFireworksContainer = document.getElementById("pomodoro-fireworks-container");
  const addBtn = document.getElementById("add-btn");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");

  function getTodayStr() {
    const dt = new Date();
    return (
      dt.getFullYear() +
      "-" +
      String(dt.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(dt.getDate()).padStart(2, "0")
    );
  }

  // ======== 1. 年度目標 ========
  let goalsSaved = false;
  async function loadGoals() {
    const ref = doc(db, "goals", "annual");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      goalInputs.forEach((input, idx) => {
        input.value = data[`goal${idx + 1}`] || "";
      });
      if (data.goalsSaved === true) {
        goalsSaved = true;
        saveGoalBtn.textContent = "修改目標";
        goalInputs.forEach((input) => {
          input.disabled = true;
          input.classList.add("no-border");
        });
      } else {
        goalsSaved = false;
        saveGoalBtn.textContent = "儲存目標";
        goalInputs.forEach((input) => {
          input.disabled = false;
          input.classList.remove("no-border");
        });
      }
    }
  }

  async function saveGoals() {
    const data = {};
    goalInputs.forEach((input, idx) => {
      data[`goal${idx + 1}`] = input.value;
    });
    data.goalsSaved = true;
    await setDoc(doc(db, "goals", "annual"), data);
    goalsSaved = true;
    saveGoalBtn.textContent = "修改目標";
    goalInputs.forEach((input) => {
      input.disabled = true;
      input.classList.add("no-border");
    });
    triggerFireworks("fireworks-container");
  }

  async function unlockGoals() {
    await setDoc(doc(db, "goals", "annual"), { goalsSaved: false }, { merge: true });
    goalsSaved = false;
    saveGoalBtn.textContent = "儲存目標";
    goalInputs.forEach((input) => {
      input.disabled = false;
      input.classList.remove("no-border");
    });
  }

  function triggerFireworks(containerId) {
    const targetContainer = document.getElementById(containerId);
    if (!targetContainer) return;
    const colors = ["red", "orange", "yellow", "blue", "green", "purple"];
    const centerX = targetContainer.clientWidth / 2;
    const centerY = targetContainer.clientHeight / 2;
    for (let i = 0; i < 30; i++) {
      const color = colors[i % colors.length];
      setTimeout(() => {
        createFireworkParticle(centerX, centerY, color, targetContainer);
      }, i * 30);
    }
  }

  function createFireworkParticle(x, y, colorClass, container) {
    const particle = document.createElement("div");
    particle.classList.add("firework", colorClass);
    const angle = Math.random() * 2 * Math.PI;
    const distance = 50 + Math.random() * 50;
    const tx = Math.cos(angle) * distance + "px";
    const ty = Math.sin(angle) * distance + "px";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty("--tx", tx);
    particle.style.setProperty("--ty", ty);
    container.appendChild(particle);
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }

  saveGoalBtn.addEventListener("click", async () => {
    if (!goalsSaved) {
      await saveGoals();
    } else {
      await unlockGoals();
    }
  });
  // 新增：在可編輯狀態時，按 Enter 也能儲存年度目標
  goalInputs.forEach(input => {
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !goalsSaved) {
        e.preventDefault();
        await saveGoals();
      }
    });
  });

  loadGoals();

  // ======== 2. 天氣 ========
  const OPENWEATHER_API_KEY = "9deb1198e7f930fefc85d8dfe2f5c275";
  const CITY_NAME = "Taipei";
  async function fetchWeather() {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`
      );
      const data = await response.json();
      if (response.ok) {
        weatherLocation.textContent = `${data.name}, ${data.sys.country}`;
        weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
        weatherDescription.textContent = data.weather[0].description;
      } else {
        weatherLocation.textContent = "無法獲取天氣資訊";
        weatherTemp.textContent = "";
        weatherDescription.textContent = data.message;
      }
    } catch (error) {
      weatherLocation.textContent = "載入天氣失敗";
      weatherTemp.textContent = "";
      weatherDescription.textContent = "請檢查網路連線或 API Key。";
    }
  }
  fetchWeather();

  // ======== 3. 星座運勢 ========
  async function loadHoroscopeData() {
    const ref = doc(db, "horoscope", "today");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    } else {
      const defaultData = {
        aries: "充滿活力，適合展開新計畫，但要小心衝動。",
        taurus: "財運亨通，適合處理財務問題，保持耐心。",
        gemini: "社交活躍，溝通順暢，但要避免說話過於輕率。",
        cancer: "家庭和睦，適合居家活動，多關心家人。",
        leo: "自信滿滿，適合展現領導力，但要留意與人合作。",
        virgo: "工作效率高，細節處理得當，注意身體健康。",
        libra: "人際關係良好，適合協商合作，保持平衡。",
        scorpio: "直覺敏銳，適合深入思考，避免過於執著。",
        sagittarius: "思維開闊，適合學習旅行，保持樂觀。",
        capricorn: "事業有成，適合專注目標，多注意休息。",
        aquarius: "創意無限，適合獨立思考，多參與社團活動。",
        pisces: "情感豐富，適合藝術創作，注意情緒起伏。",
      };
      await setDoc(ref, defaultData);
      return defaultData;
    }
  }

  async function saveSelectedHoroscope(sign) {
    await setDoc(doc(db, "userSettings", "horoscope"), { selected: sign });
  }
  async function loadSelectedHoroscope() {
    const ref = doc(db, "userSettings", "horoscope");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().selected : null;
  }

  async function displayHoroscope() {
    const horoscopeData = await loadHoroscopeData();
    const selectedHoroscope = horoscopeSelect.value;
    if (selectedHoroscope) {
      horoscopeResult.textContent =
        horoscopeData[selectedHoroscope] || "未知的星座運勢。";
    } else {
      horoscopeResult.textContent = "請選擇你的星座以查看今日運勢。";
    }
  }

  horoscopeSelect.addEventListener("change", async () => {
    await displayHoroscope();
    await saveSelectedHoroscope(horoscopeSelect.value);
  });

  (async function initHoroscopeSection() {
    const saved = await loadSelectedHoroscope();
    if (saved) {
      horoscopeSelect.value = saved;
    }
    await displayHoroscope();
  })();

  // ======== 4. 月曆/行程 ========
  let currentCalendarDate = new Date();
  let selectedCalendarDate = null;
  let events = {};

  function formatCalendarDate(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  async function loadMonthEventsFromFirebase(year, month) {
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    events = {};
    snapshot.forEach((docSnap) => {
      const dateStr = docSnap.id;
      const [evYear, evMonth] = dateStr.split("-").map(Number);
      if (evYear === year && evMonth === month + 1) {
        events[dateStr] = docSnap.data().list || [];
      }
    });
  }

  async function saveEventsToFirebase(dateStr, list) {
    await setDoc(doc(db, "events", dateStr), { list });
    events[dateStr] = list;
  }

  async function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    await loadMonthEventsFromFirebase(year, month);
    calendarDays.innerHTML = "";
    monthYear.textContent = `${year} 年 ${month + 1} 月`;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth; i > 0; i--) {
      const div = document.createElement("div");
      div.classList.add("other-month");
      div.textContent = daysInPrevMonth - i + 1;
      calendarDays.appendChild(div);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDateStr = formatCalendarDate(year, month + 1, day);
      const div = document.createElement("div");
      div.classList.add("calendar-day");
      div.setAttribute("data-date", fullDateStr);
      const dayNumberSpan = document.createElement("span");
      dayNumberSpan.classList.add("day-number");
      dayNumberSpan.textContent = day;
      div.appendChild(dayNumberSpan);
      if (events[fullDateStr] && events[fullDateStr].length > 0) {
        const eventCountSpan = document.createElement("span");
        eventCountSpan.classList.add("calendar-event-count");
        eventCountSpan.textContent = `📌${events[fullDateStr].length} `;
        dayNumberSpan.appendChild(eventCountSpan);
      }
      const today = new Date();
      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
      ) {
        div.classList.add("today");
      }
      if (selectedCalendarDate === fullDateStr) {
        div.classList.add("selected-day");
      }
      div.addEventListener("click", () => {
        selectCalendarDate(fullDateStr);
      });
      calendarDays.appendChild(div);
    }
    const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
    const remainingDays = 42 - totalDaysDisplayed;
    for (let i = 1; i <= remainingDays; i++) {
      const div = document.createElement("div");
      div.classList.add("other-month");
      div.textContent = i;
      calendarDays.appendChild(div);
    }
  }

  async function selectCalendarDate(date) {
    document
      .querySelectorAll(".calendar-day")
      .forEach((d) => d.classList.remove("selected-day"));
    const selectedDayElement = calendarDays.querySelector(
      `[data-date="${date}"]`
    );
    if (selectedDayElement) {
      selectedDayElement.classList.add("selected-day");
    } else {
      selectedCalendarDate = null;
    }
    selectedCalendarDate = date;
    eventDateInput.value = date;
    await renderEventList();
    eventDescInput.focus();
  }

  async function renderEventList() {
    eventList.innerHTML = "";
    if (!selectedCalendarDate) {
      eventList.textContent = "請選擇日期。";
      return;
    }
    const filteredEvents = events[selectedCalendarDate] || [];
    if (filteredEvents.length === 0) {
      eventList.textContent = "此日期沒有行程。";
      return;
    }
    filteredEvents.forEach((event, index) => {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "space-between";
      div.style.padding = "6px 8px";
      div.style.borderBottom = "1px solid #eee";
      const contentSpan = document.createElement("span");
      contentSpan.textContent = `📌 ${event.desc}`;
      contentSpan.style.flex = "1";
      contentSpan.style.whiteSpace = "nowrap";
      contentSpan.style.overflow = "hidden";
      contentSpan.style.textOverflow = "ellipsis";
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌";
      deleteBtn.style.border = "none";
      deleteBtn.style.background = "transparent";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.title = "刪除該行程";
      deleteBtn.addEventListener("click", async () => {
        const list = [...events[selectedCalendarDate]];
        list.splice(index, 1);
        await saveEventsToFirebase(selectedCalendarDate, list);
        await renderCalendar();
        await renderEventList();
        eventMessage.textContent = "已刪除行程";
        setTimeout(() => {
          eventMessage.textContent = "";
        }, 2000);
      });
      div.appendChild(contentSpan);
      div.appendChild(deleteBtn);
      eventList.appendChild(div);
    });
  }

  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = eventDateInput.value;
    const desc = eventDescInput.value.trim();
    if (!date || !desc) {
      alert("請輸入完整的日期與行程內容");
      return;
    }
    let list = events[date] ? [...events[date]] : [];
    list.push({ desc });
    await saveEventsToFirebase(date, list);
    await renderCalendar();
    await selectCalendarDate(date);
    eventMessage.textContent = "已新增行程！";
    setTimeout(() => {
      eventMessage.textContent = "";
    }, 2000);
    eventDescInput.value = "";
    eventDescInput.focus();
  });

  eventDescInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      eventForm.requestSubmit();
    }
  });

  prevMonthBtn.addEventListener("click", async () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    await renderCalendar();
  });
  nextMonthBtn.addEventListener("click", async () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    await renderCalendar();
  });

  renderCalendar();

  // ======== 5. Pomodoro 番茄鐘 ========
  const POMODORO_DOC_PATH = "pomodoro/timer";
  const PHASES = {
    WORK: "work",
    BREAK: "break",
  };

  let countdown = null;
  let timeLeft = 0;
  let isPaused = false;
  let currentPhase = PHASES.WORK;
  let totalCycles = 1;
  let completedCyclesCount = 0;

  function updateDisplay() {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    timerDisplay.textContent = `${String(min).padStart(2, "0")}:${String(
      sec
    ).padStart(2, "0")}`;
  }
  async function savePomodoroState() {
    await setDoc(doc(db, POMODORO_DOC_PATH), {
      timeLeft,
      isPaused,
      currentPhase,
      totalCycles,
      completedCyclesCount,
      workTime: parseInt(workInput.value) || 25,
      breakTime: parseInt(breakInput.value) || 5,
    });
  }

  async function loadPomodoroState() {
    const snap = await getDoc(doc(db, POMODORO_DOC_PATH));
    if (snap.exists()) {
      const data = snap.data();
      timeLeft = data.timeLeft ?? 0;
      isPaused = data.isPaused ?? false;
      currentPhase = data.currentPhase ?? PHASES.WORK;
      totalCycles = data.totalCycles ?? 1;
      completedCyclesCount = data.completedCyclesCount ?? 0;
      workInput.value = data.workTime ?? 25;
      breakInput.value = data.breakTime ?? 5;
      cyclesInput.value = data.totalCycles ?? 1;
    } else {
      // 預設值
      timeLeft = 0;
      isPaused = false;
      currentPhase = PHASES.WORK;
      totalCycles = 1;
      completedCyclesCount = 0;
      workInput.value = 25;
      breakInput.value = 5;
      cyclesInput.value = 1;
    }
    updateDisplay();
    setTomatoState();
  }

  function setTomatoState() {
    if (currentPhase === PHASES.BREAK) {
      tomatoElement.classList.add("sleeping");
    } else {
      tomatoElement.classList.remove("sleeping");
    }
    updateDisplay();
  }

  function toggleSettingsInputs(disable) {
    workInput.disabled = disable;
    breakInput.disabled = disable;
    if (cyclesInput) {
      cyclesInput.disabled = disable;
    }
  }

  function getPhaseTimeInSeconds() {
    const workTime = parseInt(workInput.value) || 25;
    const breakTime = parseInt(breakInput.value) || 5;
    return currentPhase === PHASES.WORK ? workTime * 60 : breakTime * 60;
  }

  function startTimer() {
    if (countdown) clearInterval(countdown);
    toggleSettingsInputs(true);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    if (!isPaused || timeLeft <= 0) {
      timeLeft = getPhaseTimeInSeconds();
    }
    isPaused = false;
    setTomatoState();
    countdown = setInterval(async () => {
      if (!isPaused) {
        if (timeLeft <= 0) {
          clearInterval(countdown);
          alert(`${currentPhase === PHASES.WORK ? "工作" : "休息"}時間結束！`);
          if (currentPhase === PHASES.WORK) {
            completedCyclesCount++;
            if (completedCyclesCount >= totalCycles) {
              alert(`恭喜您，已完成所有 ${totalCycles} 個番茄鐘循環！`);
              triggerFireworks("pomodoro-fireworks-container");
              await resetTimer(true);
              await savePomodoroState();
              return;
            }
            currentPhase = PHASES.BREAK;
          } else {
            currentPhase = PHASES.WORK;
          }
          timeLeft = getPhaseTimeInSeconds();
          await savePomodoroState();
          startTimer();
        } else {
          timeLeft--;
          updateDisplay();
          await savePomodoroState();
        }
      }
    }, 1000);
  }

  async function pauseTimer() {
    isPaused = !isPaused;
    if (isPaused) {
      clearInterval(countdown);
      pauseBtn.textContent = "繼續";
      toggleSettingsInputs(false);
    } else {
      startTimer();
      pauseBtn.textContent = "暫停";
      toggleSettingsInputs(true);
    }
    setTomatoState();
    await savePomodoroState();
  }

  async function resetTimer(fullReset = true) {
    clearInterval(countdown);
    countdown = null;
    isPaused = false;
    pauseBtn.textContent = "暫停";
    if (fullReset) {
      currentPhase = PHASES.WORK;
      completedCyclesCount = 0;
      totalCycles = parseInt(cyclesInput.value) || 1;
      timeLeft = getPhaseTimeInSeconds();
      toggleSettingsInputs(false);
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = true;
    } else {
      timeLeft = getPhaseTimeInSeconds();
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resetBtn.disabled = false;
      toggleSettingsInputs(true);
    }
    updateDisplay();
    setTomatoState();
    await savePomodoroState();
  }

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", () => resetTimer(true));

  workInput.addEventListener("input", async () => {
    let newWorkTime = parseInt(workInput.value);
    if (isNaN(newWorkTime) || newWorkTime < 1) newWorkTime = 1;
    workInput.value = newWorkTime;
    if (countdown === null || isPaused) {
      if (currentPhase === PHASES.WORK) {
        timeLeft = newWorkTime * 60;
        updateDisplay();
        await savePomodoroState();
      }
    }
  });
  breakInput.addEventListener("input", async () => {
    let newBreakTime = parseInt(breakInput.value);
    if (isNaN(newBreakTime) || newBreakTime < 1) newBreakTime = 1;
    breakInput.value = newBreakTime;
    if (countdown === null || isPaused) {
      if (currentPhase === PHASES.BREAK) {
        timeLeft = newBreakTime * 60;
        updateDisplay();
        await savePomodoroState();
      }
    }
  });
  cyclesInput.addEventListener("input", async () => {
    let newCycles = parseInt(cyclesInput.value);
    if (isNaN(newCycles) || newCycles < 1) newCycles = 1;
    cyclesInput.value = newCycles;
    totalCycles = newCycles;
    await savePomodoroState();
  });

  (async () => {
    await loadPomodoroState();
  })();

  // ======== 6. To-Do ========
  const TODOS_DOC_PATH = "todos/main";
  let todos = [];
  let draggedItem = null;

  async function loadTodosFromFirebase() {
    const snap = await getDoc(doc(db, TODOS_DOC_PATH));
    todos = snap.exists() ? snap.data().list || [] : [];
  }
  async function saveTodosToFirebase() {
    await setDoc(doc(db, TODOS_DOC_PATH), { list: todos });
  }
  async function renderTodos() {
    await loadTodosFromFirebase();
    todoList.innerHTML = "";
    const incompleteTodos = todos.filter((item) => !item.done);
    const completedTodos = todos.filter((item) => item.done);
    incompleteTodos.forEach((item, index) => {
      const li = createTodoListItem(item, index, false);
      todoList.appendChild(li);
    });
    completedTodos.forEach((item, index) => {
      const li = createTodoListItem(item, incompleteTodos.length + index, true);
      todoList.appendChild(li);
    });
    if (todos.length === 0) {
      todoList.innerHTML =
        '<p style="text-align: center; color: #777; margin-top: 20px;">目前沒有待辦事項。新增一個吧！</p>';
    }
  }

  function createTodoListItem(item, displayIndex, isCompleted) {
    const li = document.createElement("li");
    li.className = "todo-item" + (isCompleted ? " completed" : "");
    li.setAttribute("data-original-index", todos.findIndex((t) => t === item));
    li.setAttribute("data-display-index", displayIndex);
    if (!isCompleted) {
      li.setAttribute("draggable", "true");
    }
    li.innerHTML = `
        <button class="mark-btn">${item.done ? "✔️" : "⬜"}</button>
        <span class="todo-text">${item.text}</span>
        <button class="delete-btn">❌</button>
    `;
    li.querySelector(".mark-btn").addEventListener("click", () => {
      const originalIndex = parseInt(li.dataset.originalIndex);
      markDone(originalIndex);
    });
    li.querySelector(".delete-btn").addEventListener("click", () => {
      const originalIndex = parseInt(li.dataset.originalIndex);
      deleteItem(originalIndex);
    });
    if (!isCompleted) {
      li.addEventListener("dragstart", handleDragStart);
      li.addEventListener("dragover", handleDragOver);
      li.addEventListener("dragleave", handleDragLeave);
      li.addEventListener("drop", handleDrop);
      li.addEventListener("dragend", handleDragEnd);
    }
    return li;
  }

  async function addTodo() {
    const text = todoInput.value.trim();
    if (text === "") return;
    await loadTodosFromFirebase();
    const newTodo = { text, done: false };
    todos.push(newTodo);
    await saveTodosToFirebase();
    await renderTodos();
    todoInput.value = "";
  }

  async function markDone(originalIndex) {
    await loadTodosFromFirebase();
    if (originalIndex >= 0 && originalIndex < todos.length) {
      todos[originalIndex].done = !todos[originalIndex].done;
      if (todos[originalIndex].done) {
        const [completedItem] = todos.splice(originalIndex, 1);
        todos.push(completedItem);
      }
      await saveTodosToFirebase();
      await renderTodos();
    }
  }

  async function deleteItem(originalIndex) {
    await loadTodosFromFirebase();
    if (originalIndex >= 0 && originalIndex < todos.length) {
      todos.splice(originalIndex, 1);
      await saveTodosToFirebase();
      await renderTodos();
    }
  }

  function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => {
      draggedItem.classList.add("dragging");
    }, 0);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", this.dataset.originalIndex);
  }
  function handleDragOver(e) {
    e.preventDefault();
    if (
      draggedItem &&
      draggedItem !== this &&
      !this.classList.contains("completed")
    ) {
      const bounding = this.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      if (e.clientY - offset > 0) {
        this.style.borderBottom = "2px solid #555";
        this.style.borderTop = "none";
      } else {
        this.style.borderTop = "2px solid #555";
        this.style.borderBottom = "none";
      }
    }
  }
  function handleDragLeave() {
    this.style.borderBottom = "none";
    this.style.borderTop = "none";
  }
  async function handleDrop(e) {
    e.preventDefault();
    this.style.borderBottom = "none";
    this.style.borderTop = "none";
    if (
      draggedItem &&
      draggedItem !== this &&
      !this.classList.contains("completed")
    ) {
      await loadTodosFromFirebase();
      const fromOriginalIndex = parseInt(draggedItem.dataset.originalIndex);
      const toOriginalIndex = parseInt(this.dataset.originalIndex);
      const incompleteTodosInOriginalOrder = todos.filter((item) => !item.done);
      const draggedTodo = todos[fromOriginalIndex];
      const draggedIncompleteIndex = incompleteTodosInOriginalOrder.findIndex(
        (item) => item === draggedTodo
      );
      const targetTodo = todos[toOriginalIndex];
      const targetIncompleteIndex = incompleteTodosInOriginalOrder.findIndex(
        (item) => item === targetTodo
      );
      let tempIncompleteTodos = todos.filter((item) => !item.done);
      let tempCompletedTodos = todos.filter((item) => item.done);
      const draggedItemForReorder = tempIncompleteTodos.splice(
        draggedIncompleteIndex,
        1
      )[0];
      tempIncompleteTodos.splice(targetIncompleteIndex, 0, draggedItemForReorder);
      todos = [...tempIncompleteTodos, ...tempCompletedTodos];
      await saveTodosToFirebase();
      await renderTodos();
    }
  }
  function handleDragEnd() {
    if (draggedItem) {
      draggedItem.classList.remove("dragging");
      draggedItem = null;
    }
    document.querySelectorAll(".todo-item").forEach((item) => {
      item.style.borderBottom = "none";
      item.style.borderTop = "none";
    });
  }

  addBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo();
    }
  });

  renderTodos();

  // ======== 7. Navbar 平滑滾動 ========
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});