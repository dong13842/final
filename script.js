// --- Firebase 設定與初始化 ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCat1HrcITV5w2hCzAuagnHHclsuePQKk4",
  authDomain: "manage-yourself-35038.firebaseapp.com",
  databaseURL: "https://manage-yourself-35038-default-rtdb.firebaseio.com",
  projectId: "manage-yourself-35038",
  storageBucket: "manage-yourself-35038.firebasestorage.app",
  messagingSenderId: "866147446706",
  appId: "1:866147446706:web:e851e78ef24022c0d07eab"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Smooth scrolling for navigation (保持不變) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// --- Navbar Toggle Logic (保持不變) ---
document.addEventListener('DOMContentLoaded', () => {
    // ... 其他現有的 DOMContentLoaded 程式碼 ...

    const menuToggle = document.querySelector('.menu-toggle');
    const navbarLinks = document.querySelector('.navbar-links');

    if (menuToggle && navbarLinks) {
        menuToggle.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        navbarLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navbarLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        });
    }
});

// --- Global DOM Elements and Helper Functions (保持不變) ---
// Annual Goal Section Elements
const fireworksContainer = document.getElementById('fireworks-container');

// Weather & Horoscope DOM elements
const weatherLocation = document.getElementById('weather-location');
const weatherTemp = document.getElementById('weather-temp');
const weatherDescription = document.getElementById('weather-description');
const horoscopeSelect = document.getElementById('horoscope-select');
const horoscopeResult = document.getElementById('horoscope-result');

// Calendar DOM elements
const calendarDays = document.getElementById('calendar-days');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const eventForm = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventDescInput = document.getElementById('event-desc');
const eventList = document.getElementById('event-list');
const eventMessage = document.getElementById('event-message');

// Pomodoro DOM elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workInput = document.getElementById('work-time');
const breakInput = document.getElementById('break-time');
const cyclesInput = document.getElementById('cycles-input');
const tomatoElement = document.querySelector('.tomato');

// To-Do List DOM elements
const addBtn = document.getElementById('add-btn');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// --- Firebase 資料存取輔助函式（可依需求擴充） ---
function getTodayStr() {
    const dt = new Date();
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

// 讀寫年度目標
async function loadGoals() {
    const ref = doc(db, "goals", "annual");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { goal1: "", goal2: "", goal3: "" };
}
async function saveGoals(goalsObj) {
    await setDoc(doc(db, "goals", "annual"), goalsObj);
}

// 讀寫某天的行程（events）
async function loadEvents(dateStr) {
    const ref = doc(db, "events", dateStr);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().list : [];
}
async function saveEvents(dateStr, list) {
    await setDoc(doc(db, "events", dateStr), { list });
}

// 讀寫某天的 To-Do
async function loadTodos(dateStr) {
    const ref = doc(db, "todos", dateStr);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().list : [];
}
async function saveTodos(dateStr, list) {
    await setDoc(doc(db, "todos", dateStr), { list });
}

// --- Fireworks Function (通用) ---
function createFireworkParticle(x, y, colorClass, container) {
    const particle = document.createElement('div');
    particle.classList.add('firework', colorClass);

    const angle = Math.random() * 2 * Math.PI;
    const distance = 50 + Math.random() * 50;

    const tx = Math.cos(angle) * distance + 'px';
    const ty = Math.sin(angle) * distance + 'px';

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--tx', tx);
    particle.style.setProperty('--ty', ty);

    container.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// 觸發煙火動畫 (確保能傳入容器 ID)
function triggerFireworks(containerId) {
    const targetContainer = document.getElementById(containerId);
    if (!targetContainer) {
        console.error(`Fireworks container with ID '${containerId}' not found.`);
        return;
    }

    const colors = ['red', 'orange', 'yellow', 'blue', 'green', 'purple'];
    const centerX = targetContainer.clientWidth / 2;
    const centerY = targetContainer.clientHeight / 2;

    for (let i = 0; i < 30; i++) {
        const color = colors[i % colors.length];
        setTimeout(() => createFireworkParticle(centerX, centerY, color, targetContainer), i * 30);
    }
}


// --- Annual Goal Functionality (Firebase 版) ---
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// 請確保你的 firebase 初始化已經在程式前段完成
//const db = getFirestore();

// 目標輸入與按鈕
const saveGoalBtn = document.getElementById('save-goal-btn');
const goalInputs = document.querySelectorAll('.goal-item');
let goalsSaved = false;

// 讀取年度目標（從 Firebase）
async function loadGoals() {
    const ref = doc(db, "goals", "annual");
    const snap = await getDoc(ref);
    if (snap.exists()) {
        const data = snap.data();
        goalInputs.forEach((input, idx) => {
            input.value = data[`goal${idx+1}`] || "";
        });
        if (data.goalsSaved === true) {
            goalsSaved = true;
            saveGoalBtn.textContent = '修改目標';
            goalInputs.forEach(input => {
                input.disabled = true;
                input.classList.add('no-border');
            });
        }
    }
}

// 儲存年度目標（到 Firebase）
async function saveGoals() {
    const data = {};
    goalInputs.forEach((input, idx) => {
        data[`goal${idx+1}`] = input.value;
    });
    data.goalsSaved = true;
    await setDoc(doc(db, "goals", "annual"), data);
}

// 解鎖年度目標（允許編輯）
async function unlockGoals() {
    // 只標示狀態，不必清空內容
    await setDoc(doc(db, "goals", "annual"), { goalsSaved: false }, { merge: true });
}

saveGoalBtn.addEventListener('click', async () => {
    if (!goalsSaved) {
        await saveGoals();
        goalInputs.forEach(input => {
            input.disabled = true;
            input.classList.add('no-border');
        });
        saveGoalBtn.textContent = '修改目標';
        triggerFireworks('fireworks-container');
        goalsSaved = true;
    } else {
        goalInputs.forEach(input => {
            input.disabled = false;
            input.classList.remove('no-border');
        });
        saveGoalBtn.textContent = '儲存目標';
        goalsSaved = false;
        await unlockGoals();
    }
});

// 頁面載入時自動從 Firebase 載入
document.addEventListener('DOMContentLoaded', async () => {
    await loadGoals();
});

// --- Weather & Horoscope Section Logic ---
const OPENWEATHER_API_KEY = '9deb1198e7f930fefc85d8dfe2f5c275';
const CITY_NAME = 'Taipei'; 

const initWeatherHoroscope = () => {
    const fetchWeather = async () => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`);
            const data = await response.json();

            if (response.ok) {
                weatherLocation.textContent = `${data.name}, ${data.sys.country}`;
                weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
                weatherDescription.textContent = data.weather[0].description;
            } else {
                weatherLocation.textContent = '無法獲取天氣資訊';
                weatherTemp.textContent = '';
                weatherDescription.textContent = data.message;
                console.error('Error fetching weather:', data.message);
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherLocation.textContent = '載入天氣失敗';
            weatherTemp.textContent = '';
            weatherDescription.textContent = '請檢查網路連線或 API Key。';
        }
    };
}
    const getWeatherData = () => {
        if (navigator.geolocation) {
            weatherLocation.textContent = '正在獲取您的位置...';
            weatherTemp.textContent = '';
            weatherDescription.textContent = '';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    fetchWeatherByCoordinates(latitude, longitude);
                },
                (error) => {
                    console.warn('Geolocation error:', error.code, error.message);
                    let errorMessage = '無法獲取您的位置。';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += '您已拒絕位置共享。';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += '位置資訊不可用。';
                            break;
                        case error.TIMEOUT:
                            errorMessage += '獲取位置超時。';
                            break;
                        default:
                            errorMessage += '發生未知錯誤。';
                            break;
                    }
                    weatherLocation.textContent = errorMessage;
                    weatherTemp.textContent = '';
                    weatherDescription.textContent = `將顯示 ${DEFAULT_CITY_NAME} 的天氣。`;
                    // Fallback to default city if geolocation fails
                    fetchWeatherByCityName(DEFAULT_CITY_NAME);
                },
                {
                    enableHighAccuracy: true, // 嘗試獲取高精確度位置
                    timeout: 5000,          // 5秒內未獲取到位置則超時
                    maximumAge: 0           // 不使用舊的緩存位置
                }
            );
        } else {
            console.warn('Geolocation is not supported by this browser.');
            weatherLocation.textContent = '您的瀏覽器不支援地理位置。';
            weatherTemp.textContent = '';
            weatherDescription.textContent = `將顯示 ${DEFAULT_CITY_NAME} 的天氣。`;
            // Fallback to default city if geolocation is not supported
            fetchWeatherByCityName(DEFAULT_CITY_NAME);
        }
    };

    // Horoscope data (simulated)
  async function loadHoroscopeData() {
    const ref = doc(db, "horoscope", "today");
    const snap = await getDoc(ref);
    if (snap.exists()) {
        return snap.data(); // 預期格式與原本 JS 物件相同
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
            pisces: "情感豐富，適合藝術創作，注意情緒起伏。"
        };
        await setDoc(ref, defaultData);
        return defaultData;
    }
}

// 讀/寫使用者選擇的星座
async function saveSelectedHoroscope(sign) {
    await setDoc(doc(db, "userSettings", "horoscope"), { selected: sign });
}
async function loadSelectedHoroscope() {
    const ref = doc(db, "userSettings", "horoscope");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().selected : null;
}

// 顯示星座運勢（從 Firebase 讀資料）
async function displayHoroscope() {
    const horoscopeData = await loadHoroscopeData();
    const selectedHoroscope = horoscopeSelect.value;
    if (selectedHoroscope) {
        horoscopeResult.textContent = horoscopeData[selectedHoroscope] || "未知的星座運勢。";
    } else {
        horoscopeResult.textContent = "請選擇你的星座以查看今日運勢。";
    }
}

// 顯示星座運勢（從 Firebase 讀資料）
async function displayHoroscope() {
    const horoscopeData = await loadHoroscopeData();
    const selectedHoroscope = horoscopeSelect.value;
    if (selectedHoroscope) {
        horoscopeResult.textContent = horoscopeData[selectedHoroscope] || "未知的星座運勢。";
    } else {
        horoscopeResult.textContent = "請選擇你的星座以查看今日運勢。";
    }
}

// 事件監聽（星座選擇下拉選單變動）
horoscopeSelect.addEventListener('change', async () => {
    await displayHoroscope();
    await saveSelectedHoroscope(horoscopeSelect.value);
});

// 頁面初始載入，載入設定與現有運勢
async function initHoroscopeSection() {
    // 取得前次選擇
    const saved = await loadSelectedHoroscope();
    if (saved) {
        horoscopeSelect.value = saved;
    }
    await displayHoroscope();
}

// --- 頁面載入時呼叫 ---
document.addEventListener("DOMContentLoaded", () => {
    initHoroscopeSection();
});

    const fetchWeatherByCoordinates = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`);
            const data = await response.json();

            if (response.ok) {
                weatherLocation.textContent = `${data.name}, ${data.sys.country}`;
                weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
                weatherDescription.textContent = data.weather[0].description;
            } else {
                console.error('Error fetching weather by coordinates:', data.message);
                weatherLocation.textContent = '無法獲取天氣資訊';
                weatherTemp.textContent = '';
                weatherDescription.textContent = `錯誤: ${data.message}`;
            }
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            weatherLocation.textContent = '載入天氣失敗';
            weatherTemp.textContent = '';
            weatherDescription.textContent = '請檢查網路連線或 API Key。';
        }
    };

    const fetchWeatherByCityName = async (cityName) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`);
            const data = await response.json();

            if (response.ok) {
                weatherLocation.textContent = `${data.name}, ${data.sys.country}`;
                weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
                weatherDescription.textContent = data.weather[0].description;
            } else {
                console.error('Error fetching weather by city name:', data.message);
                weatherLocation.textContent = '無法獲取天氣資訊';
                weatherTemp.textContent = '';
                weatherDescription.textContent = `錯誤: ${data.message}`;
            }
        } catch (error) {
            console.error('Error fetching weather by city name:', error);
            weatherLocation.textContent = '載入天氣失敗';
            weatherTemp.textContent = '';
            weatherDescription.textContent = '請檢查網路連線或 API Key。';
        }
    };

// --- Calendar Functionality ---
let currentCalendarDate = new Date();
let selectedCalendarDate = null;
// Ensure events is an object mapping dates to arrays of events
let events = {};

function formatCalendarDate(y, m, d) {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}


// 從 Firebase 載入所有該月的行程（一次撈月資料）
async function loadMonthEventsFromFirebase(year, month) {
    // Firestore 無法做 "startsWith"，建議你 collection('events') 下每一天一份文件
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    events = {}; // 清空快取
    snapshot.forEach(docSnap => {
        // 檔名: yyyy-mm-dd
        const dateStr = docSnap.id;
        const [evYear, evMonth] = dateStr.split('-').map(Number);
        if (evYear === year && evMonth === month + 1) { // JS month從0開始
            events[dateStr] = docSnap.data().list || [];
        }
    });
}

// 儲存單一天的行程到 Firebase
async function saveCalendarEvents(dateStr, eventList) {
    await setDoc(doc(db, "events", dateStr), { list: eventList });
    events[dateStr] = eventList; // 更新本地快取
}

// 同步今日行程到今日 To-Do（假設你已有 loadTodosFromFirebase, saveTodosToFirebase）
async function syncTodaysEventsToTodos() {
    const today = new Date();
    const todayStr = formatCalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const todaysEvents = events[todayStr] || [];
    let todos = await loadTodosFromFirebase(todayStr);
    let updated = false;
    todaysEvents.forEach(event => {
        if (!todos.some(todo => todo.text === event.desc && !todo.done)) {
            todos.push({ text: event.desc, done: false });
            updated = true;
        }
    });
    if (updated) {
        await saveTodosToFirebase(todayStr, todos);
        renderTodos(); // 你的 renderTodos 要能自 firebase 載入
    }
}

// 行事曆渲染（要先呼叫 loadMonthEventsFromFirebase）
async function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // 先抓本月所有行程（快取在 events 物件）
    await loadMonthEventsFromFirebase(year, month);

    calendarDays.innerHTML = '';

    monthYear.textContent = `${year} 年 ${month + 1} 月`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month's days
    for (let i = firstDayOfMonth; i > 0; i--) {
        const div = document.createElement('div');
        div.classList.add('other-month');
        div.textContent = daysInPrevMonth - i + 1;
        calendarDays.appendChild(div);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDateStr = formatCalendarDate(year, month + 1, day);
        const div = document.createElement('div');
        div.classList.add('calendar-day');

        const dayNumberSpan = document.createElement('span');
        dayNumberSpan.classList.add('day-number');
        dayNumberSpan.textContent = day;
        div.appendChild(dayNumberSpan);

        // Add event count if any
        if (events[fullDateStr] && events[fullDateStr].length > 0) {
            const eventCountSpan = document.createElement('span');
            eventCountSpan.classList.add('calendar-event-count');
            eventCountSpan.textContent = `📌${events[fullDateStr].length} `;
            dayNumberSpan.appendChild(eventCountSpan);
        }

        const today = new Date();
        if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        ) {
            div.classList.add('today');
        }

        if (selectedCalendarDate === fullDateStr) {
            div.classList.add('selected-day');
        }

        div.addEventListener('click', () => {
            selectCalendarDate(fullDateStr);
        });

        calendarDays.appendChild(div);
    }

    // Next month's days to fill the grid (ensure 6 rows if needed)
    const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
    const remainingDays = 42 - totalDaysDisplayed; 
    for (let i = 1; i <= remainingDays; i++) {
        const div = document.createElement('div');
        div.classList.add('other-month');
        div.textContent = i;
        calendarDays.appendChild(div);
    }
}

//  selectCalendarDate
async function selectCalendarDate(date) {
    // Remove selected-day from all previous selections
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));

    // Add selected-day to the newly selected day
    const selectedDayElement = calendarDays.querySelector(`[data-date="${date}"]`);
    if (selectedDayElement) {
        selectedDayElement.classList.add('selected-day');
    } else {
        selectedCalendarDate = null;
    }

    selectedCalendarDate = date;
    eventDateInput.value = date;

    // 先載入該日行程再渲染
    await loadEventsFromFirebase(date);
    await renderEventList();
    eventDescInput.focus();
}

// renderEventList
async function renderEventList() {
    eventList.innerHTML = '';

    if (!selectedCalendarDate) {
        eventList.textContent = '請選擇日期。';
        return;
    }

    const filteredEvents = events[selectedCalendarDate] || [];

    if (filteredEvents.length === 0) {
        eventList.textContent = '此日期沒有行程。';
        return;
    }

    filteredEvents.forEach((event, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.padding = '6px 8px';
        div.style.borderBottom = '1px solid #eee';

        const contentSpan = document.createElement('span');
        contentSpan.textContent = `📌 ${event.desc}`;
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

        deleteBtn.addEventListener('click', async () => {
            const list = [...events[selectedCalendarDate]];
            list.splice(index, 1);
            await saveEventsToFirebase(selectedCalendarDate, list);
            await renderCalendar(); 
            await renderEventList(); 
            eventMessage.textContent = '已刪除行程';
            setTimeout(() => {
                eventMessage.textContent = '';
            }, 2000);
        });

        div.appendChild(contentSpan);
        div.appendChild(deleteBtn);
        eventList.appendChild(div);
    });
}


eventForm.addEventListener('submit', async e => {
    e.preventDefault();

    const date = eventDateInput.value;
    const desc = eventDescInput.value.trim();

    if (!date || !desc) {
        alert('請輸入完整的日期與行程內容');
        return;
    }
    let list = await loadEventsFromFirebase(date);
    list = [...list, { desc }];
    await saveEventsToFirebase(date, list);

    // 若是今天，也自動同步到 To-Do
    const today = new Date();
    const todayStr = formatCalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    if (date === todayStr) {
        let todos = await loadTodosFromFirebase(todayStr);
        if (!todos.some(todo => todo.text === desc && !todo.done)) {
            todos.push({ text: desc, done: false });
            await saveTodosToFirebase(todayStr, todos);
            renderTodos();
        }
    }

    await renderCalendar();
    await selectCalendarDate(date);

    eventMessage.textContent = '已新增行程！';
    setTimeout(() => {
        eventMessage.textContent = '';
    }, 2000);

    eventDescInput.value = '';
    eventDescInput.focus();
});

eventDescInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        eventForm.requestSubmit();
    }
});

prevMonthBtn.addEventListener('click', async () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    await renderCalendar();
});
nextMonthBtn.addEventListener('click', async () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    await renderCalendar();
});


// --- Pomodoro Timer Functionality ---
const POMODORO_DOC_PATH = "pomodoro/timer";
const PHASES = {
    WORK: 'work',
    BREAK: 'break',
};


let countdown = null;
let timeLeft = 0;
let isPaused = false;
let currentPhase = PHASES.WORK;
let totalCycles = 1;
let completedCyclesCount = 0;

const pomodoroFireworksContainer = document.getElementById('pomodoro-fireworks-container'); // This container should exist in HTML

function updateDisplay() {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    timerDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
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
    } else {
        // 預設值
        timeLeft = 0;
        isPaused = false;
        currentPhase = PHASES.WORK;
        totalCycles = 1;
        completedCyclesCount = 0;
        workInput.value = 25;
        breakInput.value = 5;
    }
    updateDisplay();
    setTomatoState();
}

function setTomatoState() {
    if (currentPhase === PHASES.BREAK) {
        tomatoElement.classList.add('sleeping');
    } else {
        tomatoElement.classList.remove('sleeping');
    }
    updateDisplay();
}

function toggleSettingsInputs(disable) {
    workInput.disabled = disable;
    breakInput.disabled = disable;
    if (cyclesInput) { // Check if cyclesInput exists
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
                alert(`${currentPhase === PHASES.WORK ? '工作' : '休息'}時間結束！`);
                if (currentPhase === PHASES.WORK) {
                    completedCyclesCount++;
                    if (completedCyclesCount >= totalCycles) {
                        alert(`恭喜您，已完成所有 ${totalCycles} 個番茄鐘循環！`);
                        triggerFireworks('pomodoro-fireworks-container');
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
        pauseBtn.textContent = '繼續';
        toggleSettingsInputs(false);
    } else {
        startTimer();
        pauseBtn.textContent = '暫停';
        toggleSettingsInputs(true);
    }
    setTomatoState();
    await savePomodoroState();
}

async function resetTimer(fullReset = true) {
    clearInterval(countdown);
    countdown = null;
    isPaused = false;
    pauseBtn.textContent = '暫停';

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

// --- 連接 UI Controls ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', () => resetTimer(true));

workInput.addEventListener('input', async () => {
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
breakInput.addEventListener('input', async () => {
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
cyclesInput.addEventListener('input', async () => {
    let newCycles = parseInt(cyclesInput.value);
    if (isNaN(newCycles) || newCycles < 1) newCycles = 1;
    cyclesInput.value = newCycles;
    totalCycles = newCycles;
    await savePomodoroState();
});

window.addEventListener('DOMContentLoaded', async () => {
    await loadPomodoroState();
});

// --- To-Do List Functionality ---
const TODOS_DOC_PATH = "todos/main";

let todos = [];
let draggedItem = null;

// Firestore 讀取
async function loadTodosFromFirebase() {
    const snap = await getDoc(doc(db, TODOS_DOC_PATH));
    todos = snap.exists() ? snap.data().list || [] : [];
}
// Firestore 儲存
async function saveTodosToFirebase() {
    await setDoc(doc(db, TODOS_DOC_PATH), { list: todos });
}
// 渲染待辦清單
async function renderTodos() {
    await loadTodosFromFirebase();
    todoList.innerHTML = '';

    const incompleteTodos = todos.filter(item => !item.done);
    const completedTodos = todos.filter(item => item.done);

    incompleteTodos.forEach((item, index) => {
        const li = createTodoListItem(item, index, false);
        todoList.appendChild(li);
    });

    completedTodos.forEach((item, index) => {
        const li = createTodoListItem(item, incompleteTodos.length + index, true);
        todoList.appendChild(li);
    });

    if (todos.length === 0) {
        todoList.innerHTML = '<p style="text-align: center; color: #777; margin-top: 20px;">目前沒有待辦事項。新增一個吧！</p>';
    }
}

function createTodoListItem(item, displayIndex, isCompleted) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (isCompleted ? ' completed' : '');
    li.setAttribute('data-original-index', todos.findIndex(t => t === item)); // Store original index
    li.setAttribute('data-display-index', displayIndex); 

    if (!isCompleted) {
        li.setAttribute('draggable', 'true');
    }

    li.innerHTML = `
        <button class="mark-btn">${item.done ? '✔️' : '⬜'}</button>
        <span class="todo-text">${item.text}</span>
        <button class="delete-btn">❌</button>
    `;

    li.querySelector('.mark-btn').addEventListener('click', () => {
        const originalIndex = parseInt(li.dataset.originalIndex);
        markDone(originalIndex);
    });
    li.querySelector('.delete-btn').addEventListener('click', () => {
        const originalIndex = parseInt(li.dataset.originalIndex);
        deleteItem(originalIndex);
    });

    if (!isCompleted) {
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('dragleave', handleDragLeave);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);
    }

    return li;
}

async function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    await loadTodosFromFirebase();
    const newTodo = { text, done: false };
    todos.push(newTodo);
    await saveTodosToFirebase();
    await renderTodos();
    todoInput.value = '';
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

// Drag and Drop Handlers
function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => {
        draggedItem.classList.add('dragging');
    }, 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.originalIndex); // Pass original index
}

function handleDragOver(e) {
    e.preventDefault();
    if (draggedItem && draggedItem !== this && !this.classList.contains('completed')) {
        const bounding = this.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        if (e.clientY - offset > 0) {
            this.style.borderBottom = '2px solid #555';
            this.style.borderTop = 'none';
        } else {
            this.style.borderTop = '2px solid #555';
            this.style.borderBottom = 'none';
        }
    }
}

function handleDragLeave() {
    this.style.borderBottom = 'none';
    this.style.borderTop = 'none';
}

async function handleDrop(e) {
    e.preventDefault();
    this.style.borderBottom = 'none';
    this.style.borderTop = 'none';

    if (draggedItem && draggedItem !== this && !this.classList.contains('completed')) {
        // 先同步最新 todos
        await loadTodosFromFirebase();

        const fromOriginalIndex = parseInt(draggedItem.dataset.originalIndex);
        const toOriginalIndex = parseInt(this.dataset.originalIndex);

        const incompleteTodosInOriginalOrder = todos.filter(item => !item.done);
        const draggedTodo = todos[fromOriginalIndex];

        const draggedIncompleteIndex = incompleteTodosInOriginalOrder.findIndex(item => item === draggedTodo);
        const targetTodo = todos[toOriginalIndex];
        const targetIncompleteIndex = incompleteTodosInOriginalOrder.findIndex(item => item === targetTodo);

        let tempIncompleteTodos = todos.filter(item => !item.done);
        let tempCompletedTodos = todos.filter(item => item.done);

        const draggedItemForReorder = tempIncompleteTodos.splice(draggedIncompleteIndex, 1)[0];
        tempIncompleteTodos.splice(targetIncompleteIndex, 0, draggedItemForReorder);

        // 重新組合 todos 並存回 firebase
        todos = [...tempIncompleteTodos, ...tempCompletedTodos];
        await saveTodosToFirebase();
        await renderTodos();
    }
}

function handleDragEnd() {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
    document.querySelectorAll('.todo-item').forEach(item => {
        item.style.borderBottom = 'none';
        item.style.borderTop = 'none';
    });
}


addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }
});


// --- Initialize All Sections on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    loadGoals(); 
    initWeatherHoroscope(); 
    renderCalendar(); 
    resetTimer(true); 
    renderTodos(); 
});
