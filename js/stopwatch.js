let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let running = false;
let laps = [];
let currentLapIndex = 0;
let pendingLapIndex = null;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsContainer = document.getElementById('laps');
const noteModal = document.getElementById('noteModal');
const noteInput = document.getElementById('noteInput');
const cancelNote = document.getElementById('cancelNote');
const saveNote = document.getElementById('saveNote');
const toast = document.getElementById('toast');

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function updateDisplay() {
    const now = Date.now();
    elapsedTime = now - startTime;
    display.textContent = formatTime(elapsedTime);
}

function start() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateDisplay, 10);
    running = true;
    startBtn.textContent = '暂停';
    startBtn.className = 'btn btn-warning';
    lapBtn.disabled = false;
    resetBtn.disabled = false;
}

function pause() {
    clearInterval(timerInterval);
    running = false;
    startBtn.textContent = '继续';
    startBtn.className = 'btn btn-success';
}

function reset() {
    clearInterval(timerInterval);
    running = false;
    elapsedTime = 0;
    laps = [];
    currentLapIndex = 0;
    display.textContent = '00:00.000';
    startBtn.textContent = '开始';
    startBtn.className = 'btn btn-success';
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    renderLaps();
}

function recordLap() {
    currentLapIndex++;
    const lapTime = elapsedTime;
    laps.unshift({ index: currentLapIndex, time: lapTime, note: '' });
    pendingLapIndex = 0;
    renderLaps();
    openNoteModal(0);
}

function renderLaps() {
    if (laps.length === 0) {
        lapsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>暂无圈速记录</p>
            </div>`;
        return;
    }

    lapsContainer.innerHTML = laps.map((lap, i) => `
        <div class="lap-item">
            <span>圈 ${lap.index}</span>
            <span class="lap-time">${formatTime(lap.time)}</span>
            <span class="lap-note">${lap.note || '无备注'}</span>
            <button class="edit-note" onclick="openNoteModal(${i})">✏️</button>
        </div>
    `).join('');
}

function openNoteModal(index) {
    pendingLapIndex = index;
    noteInput.value = laps[index].note;
    noteModal.classList.add('active');
    noteInput.focus();
}

function saveNote() {
    if (pendingLapIndex !== null) {
        laps[pendingLapIndex].note = noteInput.value.trim();
        renderLaps();
    }
    noteModal.classList.remove('active');
    pendingLapIndex = null;
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

startBtn.addEventListener('click', () => {
    if (running) {
        pause();
    } else {
        start();
    }
});

lapBtn.addEventListener('click', recordLap);
resetBtn.addEventListener('click', reset);
cancelNote.addEventListener('click', () => {
    noteModal.classList.remove('active');
    pendingLapIndex = null;
});
saveNote.addEventListener('click', saveNote);
noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveNote();
});

noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) {
        noteModal.classList.remove('active');
        pendingLapIndex = null;
    }
});
