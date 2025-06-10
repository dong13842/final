// -------- Firebase Initialization --------
const firebaseConfig = {
  apiKey: "AIzaSyCat1HrcITV5w2hCzAuagnHHclsuePQKk4",
  authDomain: "manage-yourself-35038.firebaseapp.com",
  databaseURL: "https://manage-yourself-35038-default-rtdb.firebaseio.com",
  projectId: "manage-yourself-35038",
  storageBucket: "manage-yourself-35038.appspot.com",
  messagingSenderId: "866147446706",
  appId: "1:866147446706:web:e851e78ef24022c0d07eab"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==================== 分頁切換邏輯 ====================
const sectionIds = ["landing", "home-cards", "calendar-main", "todo-main"];
function showSectionByHash(hash) {
  hash = hash || window.location.hash || "#landing";
  sectionIds.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) sec.style.display = (hash === "#" + id) ? "" : "none";
  });
  const floatFruits = document.querySelector('.floating-fruits');
  if (floatFruits) {
    floatFruits.style.display = (hash === "#landing") ? "none" : "";
  }
}
window.addEventListener('DOMContentLoaded', () => {
  showSectionByHash();
});
window.addEventListener('hashchange', () => showSectionByHash());

// ==================== 首頁功能 ====================
// 每日小語
const dailyQuotes = [
  "今天也要好好過生活，加油！",
  "努力不一定會成功，但放棄一定不會有結果。",
  "給自己一個微笑，今天會更好！",
  "踏出第一步，就是成功的開始。",
  "每一天都是全新機會。",
  "你值得擁有美好的一天！",
  "相信自己，你可以的！",
  "別忘了給自己一點鼓勵。",
  "再小的進步，也是前進。",
  "累了就休息一下，明天會更好！",
  "生活不容易，但你很努力！",
  "用心生活，快樂自然來。"
];
function getTodayQuote() {
  const today = new Date();
  const idx = (today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate()) % dailyQuotes.length;
  return dailyQuotes[idx];
}
window.addEventListener('DOMContentLoaded', () => {
  const quoteEl = document.getElementById('daily-quote');
  if (quoteEl) quoteEl.textContent = getTodayQuote();

  // 首頁水果做為按鈕
  [
    { id: "home-link-cards", hash: "#home-cards" },
    { id: "home-link-calendar", hash: "#calendar-main" },
    { id: "home-link-todo", hash: "#todo-main" },
  ].forEach(({ id, hash }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        animateFruitJumpAndSwitch(el, hash);
      });
    }
  });

  // 浮動水果點擊
  document.querySelectorAll('.floating-fruit').forEach(fruit => {
    fruit.addEventListener('click', function () {
      if (fruit.classList.contains('jumping')) return;
      const hash = fruit.getAttribute('data-target');
      animateFruitJumpAndSwitch(fruit, hash);
    });
  });

  setInterval(launchRandomFireworksAlwaysUnfixed, 420);
});

// 跳轉動畫＋顯示切換
function animateFruitJumpAndSwitch(fruitEl, hash) {
  fruitEl.classList.add('jumping');
  window.location.hash = hash;
  setTimeout(() => {
    fruitEl.classList.remove('jumping');
  }, 400);
}
// ==================== 全頁煙火動畫 ====================
function randomPositionFullScreen() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = Math.random() * w;
  const y = Math.random() * h;
  return { x, y };
}
function launchFullScreenFirework(container) {
  if (!container) return;
  const colors = ['red', 'orange', 'yellow', 'blue', 'green', 'purple'];
  const numFireworks = 8 + Math.floor(Math.random() * 8);
  const { x: cx, y: cy } = randomPositionFullScreen();
  const R = 40 + Math.random() * 40;
  for (let i = 0; i < numFireworks; i++) {
    const angle = 2 * Math.PI * (i / numFireworks);
    const tx = Math.cos(angle) * R;
    const ty = Math.sin(angle) * R;
    const span = document.createElement('span');
    const color = colors[Math.floor(Math.random() * colors.length)];
    span.className = 'firework ' + color;
    span.style.position = 'absolute';
    span.style.left = cx + 'px';
    span.style.top = cy + 'px';
    span.style.width = '10px';
    span.style.height = '10px';
    span.style.borderRadius = '50%';
    span.style.background = color;
    span.style.opacity = '0.8';
    span.style.transform = 'translate(-50%, -50%) scale(1)';
    span.style.transition = 'transform 1s cubic-bezier(0.2,1.2,0.3,1), opacity 1.2s';
    container.appendChild(span);

    setTimeout(() => {
      span.style.transform = `translate(${tx}px, ${ty}px) scale(0.3)`;
      span.style.opacity = '0';
    }, 40);

    setTimeout(() => {
      if (span && span.parentNode) span.parentNode.removeChild(span);
    }, 1800);
  }
}
setInterval(() => {
  const overlay = document.getElementById('fireworks-overlay');
  if (overlay && window.location.hash === "" || window.location.hash === "#landing") {
    launchFullScreenFirework(overlay);
  }
}, 420);

// ==================== 小卡頁功能 ====================
// 年度目標
(function () {
  if (!document.getElementById('goal-card')) return;
  const goalInputs = [
    document.getElementById('goal-input-1'),
    document.getElementById('goal-input-2'),
    document.getElementById('goal-input-3')
  ];
  const goalBtn = document.getElementById('save-goal');
  const fireworksContainer = document.getElementById('fireworks-container');
  const goalInputGroup = document.getElementById('goal-input-group');
  const goalDisplayList = document.getElementById('goal-display-list');
  let isEditingGoal = true;

  // 讀取年度目標
  db.ref('goal').on('value', snap => {
    const arr = snap.val() || ["", "", ""];
    goalInputs.forEach((inp, i) => inp.value = arr[i] || "");
    showGoalMode(isEditingGoal, arr);
    goalBtn.textContent = isEditingGoal ? "儲存目標" : "修改目標";
  });

  // 按鈕切換：儲存/修改
  goalBtn.onclick = async function () {
    if (isEditingGoal) {
      const data = goalInputs.map(inp => inp.value.trim());
      await db.ref('goal').set(data);
      isEditingGoal = false;
      showGoalMode(false, data);
      goalBtn.textContent = "修改目標";
      launchFireworks();
    } else {
      isEditingGoal = true;
      showGoalMode(true);
      goalBtn.textContent = "儲存目標";
      goalInputs[0].focus();
    }
  };
  function showGoalMode(editMode, dataArr) {
    if (editMode) {
      goalInputGroup.style.display = '';
      goalDisplayList.style.display = 'none';
    } else {
      goalInputGroup.style.display = 'none';
      goalDisplayList.style.display = '';
      const arr = dataArr || goalInputs.map(inp => inp.value.trim());
      goalDisplayList.innerHTML = '';
      arr.forEach((txt, idx) => {
        if (txt) {
          const div = document.createElement('div');
          div.className = 'goal-display-item';
          div.innerHTML = `<span class="crown">👑</span>${txt}`;
          goalDisplayList.appendChild(div);
        }
      });
      if (!goalDisplayList.children.length) {
        goalDisplayList.innerHTML = '<div style="color:#bbb;">（尚未設定目標）</div>';
      }
    }
  }
  // 年度目標煙火動畫
  function launchFireworks() {
    const colors = ['red', 'orange', 'yellow', 'blue', 'green', 'purple'];
    const numFireworks = 18;
    const container = fireworksContainer;
    container.innerHTML = "";
    const cx = container.offsetWidth / 2 || 200;
    const cy = 80;
    const R = 60;
    for (let i = 0; i < numFireworks; i++) {
      const angle = 2 * Math.PI * (i / numFireworks);
      const tx = Math.cos(angle) * R;
      const ty = Math.sin(angle) * R;
      const span = document.createElement('span');
      span.className = 'firework ' + colors[i % colors.length];
      span.style.position = 'absolute';
      span.style.left = cx + 'px';
      span.style.top = cy + 'px';
      span.style.width = '10px';
      span.style.height = '10px';
      span.style.borderRadius = '50%';
      span.style.background = colors[i % colors.length];
      span.style.opacity = '0.8';
      span.style.transform = 'translate(-50%, -50%) scale(1)';
      span.style.transition = 'transform 0.8s cubic-bezier(0.2,1.2,0.3,1), opacity 1s';
      container.appendChild(span);

      setTimeout(() => {
        span.style.transform = `translate(${tx}px, ${ty}px) scale(0.3)`;
        span.style.opacity = '0';
      }, 30);

      setTimeout(() => {
        if (span && span.parentNode) span.parentNode.removeChild(span);
      }, 1200);
    }
  }
})();

// 天氣
(function () {
  if (!document.getElementById('weather-card')) return;
  function updateWeather(lat, lon) {
    const apiKey = "9deb1198e7f930fefc85d8dfe2f5c275";
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_tw`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('weather-location').textContent = data.name || "未知地點";
        document.getElementById('weather-desc').textContent =
          (data.main ? `${Math.round(data.main.temp)}°C｜` : '') +
          (data.weather && data.weather[0] ? data.weather[0].description : '');
      })
      .catch(() => {
        document.getElementById('weather-location').textContent = "取得天氣失敗";
        document.getElementById('weather-desc').textContent = "";
      });
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => updateWeather(pos.coords.latitude, pos.coords.longitude),
      () => { document.getElementById('weather-location').textContent = "請允許位置權限"; }
    );
  } else {
    document.getElementById('weather-location').textContent = "不支援定位";
  }
})();

// 今日代辦
(function () {
  if (!document.getElementById('today-todo-card')) return;
  function getLocalDateStr(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function renderTodayTodoCard() {
    const todayStr = getLocalDateStr(new Date());
    db.ref(`calendarTodos/${todayStr}`).on('value', snap => {
      const ul = document.getElementById('today-todo-list');
      ul.innerHTML = '';
      const todos = snap.val() || [];
      todos.forEach(todo => {
        const li = document.createElement('li');
        li.textContent = todo;
        ul.appendChild(li);
      });
      if (!todos.length) ul.innerHTML = "<li>今天沒有特別事項！</li>";
    });
  }
  renderTodayTodoCard();
})();

// ==================== 月曆區塊 ====================
(function () {
  if (!document.getElementById('calendar-main')) return;
  function getLocalDateStr(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  let currentMonth = new Date();
  let selectedDate = getLocalDateStr(new Date());

  function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    document.getElementById('calendar-month-title-inner').textContent = `${year}年${month + 1}月`;
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = "";

    db.ref('calendarTodos').once('value').then(allSnap => {
      const allTodos = allSnap.val() || {};
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay();

      for (let i = 0; i < firstDayOfWeek; i++) {
        daysContainer.appendChild(document.createElement('div'));
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const thisDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const day = document.createElement('div');
        day.innerHTML = `<span class="day-number">${d}</span>`;

        const today = new Date();
        if (
          year === today.getFullYear() &&
          month === today.getMonth() &&
          d === today.getDate()
        ) {
          day.classList.add('today');
        }
        if (selectedDate === thisDate) {
          day.classList.add('selected-day');
        }
        if (allTodos[thisDate] && allTodos[thisDate].length > 0) {
          day.innerHTML += `<div class="calendar-event-count"><span class="pin-emoji">📌</span><span class="pin-count">${allTodos[thisDate].length}</span></div>`;
        }
        day.onclick = () => {
          daysContainer.querySelectorAll('.selected-day').forEach(e => e.classList.remove('selected-day'));
          day.classList.add('selected-day');
          selectedDate = thisDate;
          document.getElementById('event-date').value = selectedDate;
          document.getElementById('event-date-fake').value = showMonthDay(selectedDate);
          renderEventList(selectedDate);
        };
        daysContainer.appendChild(day);
      }
    });
  }
  function renderEventList(date) {
    db.ref(`calendarTodos/${date}`).once('value').then(snap => {
      const list = snap.val() || [];
      const el = document.getElementById('event-list');
      if (list.length) {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        list.forEach((desc, idx) => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.alignItems = 'center';
          li.style.marginBottom = '12px';

          const contentSpan = document.createElement('span');
          contentSpan.textContent = `📌 ${desc}`;
          contentSpan.style.flex = '1';
          contentSpan.style.whiteSpace = 'nowrap';
          contentSpan.style.overflow = 'hidden';
          contentSpan.style.textOverflow = 'ellipsis';

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = '❌';
          deleteBtn.style.border = 'none';
          deleteBtn.style.background = 'transparent';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.style.marginLeft = '10px';
          deleteBtn.title = '刪除該行程';
          deleteBtn.onclick = () => deleteEvent(date, idx);

          li.appendChild(contentSpan);
          li.appendChild(deleteBtn);
          ul.appendChild(li);
        });
        el.innerHTML = '';
        el.appendChild(ul);
      } else {
        el.innerHTML = "<div class='empty'>（此日暫無事項）</div>";
      }
    });
  }
  function deleteEvent(date, idx) {
    db.ref(`calendarTodos/${date}`).once('value').then(snap => {
      let arr = snap.val() || [];
      const deletedDesc = arr[idx];
      arr.splice(idx, 1);
      db.ref(`calendarTodos/${date}`).set(arr).then(() => {
        renderEventList(date);
        updateCalendarEventDot(date, arr.length);
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (date === todayStr && deletedDesc) {
          let todoList = [];
          try {
            todoList = JSON.parse(localStorage.getItem('todo-list') || '[]');
          } catch(e) {}
          const delIdx = todoList.findIndex(item => item.text === deletedDesc);
          if (delIdx > -1) {
            todoList.splice(delIdx, 1);
            localStorage.setItem('todo-list', JSON.stringify(todoList));
            if (typeof window.renderTodoList === "function") window.renderTodoList();
          }
        }
      });
    });
  }
  function updateCalendarEventDot(date, count) {
    const [year, month, day] = date.split('-');
    const curYear = currentMonth.getFullYear();
    const curMonth = currentMonth.getMonth() + 1;
    if (parseInt(year) !== curYear || parseInt(month) !== curMonth) return;

    const daysContainer = document.getElementById('calendar-days');
    const dayBoxes = daysContainer.querySelectorAll('div');
    const box = Array.from(dayBoxes).find(div => {
      const dayNum = div.querySelector('.day-number');
      return dayNum && parseInt(dayNum.textContent) === parseInt(day)
        && !div.classList.contains('other-month');
    });
    if (!box) return;
    const oldDot = box.querySelector('.calendar-event-count');
    if (oldDot) oldDot.remove();
    if (count > 0) {
      const dot = document.createElement('div');
      dot.className = 'calendar-event-count';
      dot.innerHTML = `<span class="pin-emoji">📌</span><span class="pin-count">${count}</span>`;
      box.appendChild(dot);
    }
  }
  document.getElementById('event-form').onsubmit = function(e) {
    e.preventDefault();
    saveEvent();
  };
  document.getElementById('event-desc').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEvent();
    }
  });
  function saveEvent() {
    const date = document.getElementById('event-date').value;
    const desc = document.getElementById('event-desc').value.trim();
    if (!date || !desc) return;
    db.ref(`calendarTodos/${date}`).once('value').then(snap => {
      const arr = snap.val() || [];
      arr.push(desc);
      db.ref(`calendarTodos/${date}`).set(arr).then(() => {
        document.getElementById('event-desc').value = '';
        selectedDate = date;
        renderEventList(date);
        updateCalendarEventDot(date, arr.length);

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (date === todayStr) {
          let todoList = [];
          try {
            todoList = JSON.parse(localStorage.getItem('todo-list') || '[]');
          } catch (e) {}
          todoList.push({ text: desc, completed: false });
          localStorage.setItem('todo-list', JSON.stringify(todoList));
          if (typeof window.renderTodoList === "function") window.renderTodoList();
        }
      });
    });
  }
  document.getElementById('prev-month').onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  };
  document.getElementById('next-month').onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  };
  function showMonthDay(val) {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${parseInt(m)} / ${parseInt(d)}`;
  }
  const realDate = document.getElementById('event-date');
  const fakeDate = document.getElementById('event-date-fake');
  function syncDateInputs(val) {
    fakeDate.value = showMonthDay(val);
  }
  realDate.addEventListener('input', function() {
    syncDateInputs(this.value);
  });
  syncDateInputs(realDate.value);
  fakeDate.addEventListener('click', () => realDate.showPicker && realDate.showPicker());
  // 頁面初始
  window.addEventListener('DOMContentLoaded', () => {
    selectedDate = getLocalDateStr(new Date());
    document.getElementById('event-date').value = selectedDate;
    document.getElementById('event-date-fake').value = showMonthDay(selectedDate);
    renderCalendar();
    renderEventList(selectedDate);
  });
})();

// ==================== 代辦區塊 ====================
(function () {
  if (!document.getElementById('todo-main')) return;

  function getTodoList() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('todo-list') || '[]');
    } catch (e) { }
    return list;
  }
  function setTodoList(list) {
    localStorage.setItem('todo-list', JSON.stringify(list));
  }

  function saveTodo() {
    const input = document.getElementById('todo-input');
    const value = input.value.trim();
    if (!value) return;
    const list = getTodoList();
    list.push({ text: value, completed: false });
    setTodoList(list);
    input.value = '';
    renderTodoList();
  }

  function toggleTodo(idx) {
    const list = getTodoList();
    if (list[idx]) {
      list[idx].completed = !list[idx].completed;
      setTodoList(list);
      renderTodoList();
    }
  }
  function deleteTodo(idx) {
    const list = getTodoList();
    if (list[idx]) {
      list.splice(idx, 1);
      setTodoList(list);
      renderTodoList();
    }
  }


  function handleDragTodo(fromIdx, toIdx) {
    let list = getTodoList();
    const uncompleted = list.map((item, idx) => ({ ...item, idx })).filter(item => !item.completed);
    const fromPos = uncompleted.findIndex(item => item.idx === fromIdx);
    const toPos = uncompleted.findIndex(item => item.idx === toIdx);
    if (fromPos === -1 || toPos === -1) return;
    const [moved] = uncompleted.splice(fromPos, 1);
    uncompleted.splice(toPos, 0, moved);
    const completed = list.filter(item => item.completed);
    const newList = [
      ...uncompleted.map(item => list[item.idx]),
      ...completed
    ];
    setTodoList(newList);
    renderTodoList();
  }

  function renderTodoList() {
    const ul = document.getElementById('todo-list');
    let list = getTodoList();
    const displayList = list
      .map((item, idx) => ({ ...item, _idx: idx }))
      .sort((a, b) => {
        if (a.completed === b.completed) return a._idx - b._idx;
        return a.completed - b.completed;
      });

    ul.innerHTML = '';
    displayList.forEach(item => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (item.completed ? ' completed' : '');
      li.setAttribute('draggable', !item.completed);
      li.dataset.idx = item._idx;

      li.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', item._idx);
        li.classList.add('dragging');
      });
      li.addEventListener('dragend', e => {
        li.classList.remove('dragging');
      });
      li.addEventListener('dragover', e => {
        e.preventDefault();
        li.classList.add('drag-over');
      });
      li.addEventListener('dragleave', e => {
        li.classList.remove('drag-over');
      });
      li.addEventListener('drop', e => {
        e.preventDefault();
        li.classList.remove('drag-over');
        const fromIdx = Number(e.dataTransfer.getData('text/plain'));
        const toIdx = Number(li.dataset.idx);
        handleDragTodo(fromIdx, toIdx);
      });

      const markBtn = document.createElement('button');
      markBtn.className = 'mark-btn';
      markBtn.textContent = item.completed ? '✔️' : '⬜';
      markBtn.title = item.completed ? '取消完成' : '標記完成';
      markBtn.onclick = () => toggleTodo(item._idx);

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = item.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = '❌';
      delBtn.onclick = () => deleteTodo(item._idx);

      li.appendChild(markBtn);
      li.appendChild(span);
      li.appendChild(delBtn);
      ul.appendChild(li);
    });
  }
  document.getElementById('todo-form').onsubmit = function(e) {
    e.preventDefault();
    saveTodo();
  };
  document.getElementById('todo-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTodo();
    }
  });
  window.renderTodoList = renderTodoList;
})();
  // ==================== 番茄鐘 ====================
  let workMinutes = 50, restMinutes = 10, cycleTimes = 1;
  let currentCycle = 1;
  let mode = "work"; // "work" or "rest"
  let pomoTime = workMinutes * 60, pomoTimer, pomoRunning = false, pomoPaused = false;

  const pomoDisplay = document.getElementById('pomodoro-timer');
  const tomato = document.getElementById('tomato');

  function updatePomo() {
    const min = Math.floor(pomoTime / 60).toString().padStart(2, '0');
    const sec = (pomoTime % 60).toString().padStart(2, '0');
    pomoDisplay.textContent = `${min}:${sec}`;
  }
  function renderSettings() {
    document.getElementById('work-minutes').textContent = workMinutes;
    document.getElementById('rest-minutes').textContent = restMinutes;
    document.getElementById('cycle-times').textContent = cycleTimes;
  }
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  document.getElementById('work-minus').onclick = () => {
    workMinutes = clamp(workMinutes - 5, 5, 180);
    if (mode === "work" && !pomoRunning) {
      pomoTime = workMinutes * 60;
      updatePomo();
    }
    renderSettings();
  };
  document.getElementById('work-plus').onclick = () => {
    workMinutes = clamp(workMinutes + 5, 5, 180);
    if (mode === "work" && !pomoRunning) {
      pomoTime = workMinutes * 60;
      updatePomo();
    }
    renderSettings();
  };
  document.getElementById('rest-minus').onclick = () => {
    restMinutes = clamp(restMinutes - 5, 5, 60);
    if (mode === "rest" && !pomoRunning) {
      pomoTime = restMinutes * 60;
      updatePomo();
    }
    renderSettings();
  };
  document.getElementById('rest-plus').onclick = () => {
    restMinutes = clamp(restMinutes + 5, 5, 60);
    if (mode === "rest" && !pomoRunning) {
      pomoTime = restMinutes * 60;
      updatePomo();
    }
    renderSettings();
  };
  document.getElementById('cycle-minus').onclick = () => {
    cycleTimes = clamp(cycleTimes - 1, 1, 20);
    renderSettings();
  };
  document.getElementById('cycle-plus').onclick = () => {
    cycleTimes = clamp(cycleTimes + 1, 1, 20);
    renderSettings();
  };
  function startPomo() {
    if (pomoRunning) return;
    pomoRunning = true;
    pomoPaused = false;
    tomato.classList.remove('sleeping');
    let tick = () => {
      if (!pomoRunning || pomoPaused) return;
      if (pomoTime > 0) {
        pomoTime--;
        updatePomo();
        pomoTimer = setTimeout(tick, 1000);
      } else {
        if (mode === "work") {
          mode = "rest";
          pomoTime = restMinutes * 60;
          updatePomo();
          alert("工作結束，休息一下吧！");
          startPomo();
        } else {
          if (currentCycle < cycleTimes) {
            currentCycle++;
            mode = "work";
            pomoTime = workMinutes * 60;
            updatePomo();
            alert("休息結束，開始下一輪工作！");
            startPomo();
          } else {
            pomoRunning = false;
            mode = "work";
            currentCycle = 1;
            tomato.classList.add('sleeping');
            alert('所有循環結束！');
          }
        }
      }
    };
    tick();
  }
  function pausePomo() {
    if (!pomoRunning) return;
    pomoPaused = !pomoPaused;
    if (!pomoPaused) {
      startPomo();
    }
  }
  function resetPomo() {
    clearTimeout(pomoTimer);
    pomoRunning = false;
    pomoPaused = false;
    mode = "work";
    currentCycle = 1;
    pomoTime = workMinutes * 60;
    tomato.classList.remove('sleeping');
    updatePomo();
  }
  document.getElementById('pomodoro-start').onclick = startPomo;
  document.getElementById('pomodoro-pause').onclick = pausePomo;
  document.getElementById('pomodoro-reset').onclick = resetPomo;
  renderSettings();
  resetPomo();