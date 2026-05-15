let totalSeconds = 300;
let remainingSeconds = 300;
let timerInterval = null;
let running = false;

const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timerInputs = document.getElementById('timerInputs');
const notificationBanner = document.getElementById('notificationBanner');
const toast = document.getElementById('toast');

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateDisplay() {
    display.textContent = formatTime(remainingSeconds);
}

function getInputSeconds() {
    const h = parseInt(hoursInput.value) || 0;
    const m = parseInt(minutesInput.value) || 0;
    const s = parseInt(secondsInput.value) || 0;
    return h * 3600 + m * 60 + s;
}

function start() {
    if (!running) {
        if (remainingSeconds === totalSeconds) {
            totalSeconds = getInputSeconds();
            remainingSeconds = totalSeconds;
        }
        if (remainingSeconds <= 0) {
            showToast('请设置时间');
            return;
        }
        timerInterval = setInterval(() => {
            remainingSeconds--;
            updateDisplay();
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                running = false;
                startBtn.disabled = true;
                pauseBtn.disabled = true;
                showToast('⏰ 计时结束！');
                sendNotification();
            }
        }, 1000);
        running = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        timerInputs.style.display = 'none';
    }
}

function pause() {
    clearInterval(timerInterval);
    running = false;
    startBtn.disabled = false;
    startBtn.textContent = '继续';
    pauseBtn.disabled = true;
}

function reset() {
    clearInterval(timerInterval);
    running = false;
    totalSeconds = getInputSeconds();
    remainingSeconds = totalSeconds;
    updateDisplay();
    startBtn.disabled = false;
    startBtn.textContent = '开始';
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    timerInputs.style.display = 'flex';
}

function sendNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('计时器', {
            body: '倒计时已结束！',
            icon: '⏳'
        });
    }
}

function requestNotification() {
    if ('Notification' in window) {
        Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
                notificationBanner.style.display = 'none';
                showToast('通知已开启');
            }
        });
    }
}

function updateFromInputs() {
    if (!running) {
        totalSeconds = getInputSeconds();
        remainingSeconds = totalSeconds;
        updateDisplay();
    }
}

hoursInput.addEventListener('input', updateFromInputs);
minutesInput.addEventListener('input', updateFromInputs);
secondsInput.addEventListener('input', updateFromInputs);

startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);

if ('Notification' in window && Notification.permission === 'default') {
    notificationBanner.style.display = 'flex';
}

updateDisplay();
