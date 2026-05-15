let counters = JSON.parse(localStorage.getItem('counters')) || [];

const countersContainer = document.getElementById('counters');
const addCounterBtn = document.getElementById('addCounterBtn');
const addModal = document.getElementById('addModal');
const counterNameInput = document.getElementById('counterName');
const cancelAdd = document.getElementById('cancelAdd');
const confirmAdd = document.getElementById('confirmAdd');
const toast = document.getElementById('toast');

function saveCounters() {
    localStorage.setItem('counters', JSON.stringify(counters));
}

function renderCounters() {
    if (counters.length === 0) {
        countersContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔢</div>
                <p>暂无计数器，点击"新建计数器"开始</p>
            </div>`;
        return;
    }

    countersContainer.innerHTML = counters.map((c, i) => `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="color: var(--text-secondary);">${escapeHtml(c.name)}</h3>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.85rem;" onclick="deleteCounter(${i})">删除</button>
            </div>
            <div class="counter-display">
                <button class="btn btn-danger" onclick="changeCount(${i}, -1)">−</button>
                <span class="count">${c.count}</span>
                <button class="btn btn-success" onclick="changeCount(${i}, 1)">+</button>
            </div>
            <div style="text-align: center;">
                <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.85rem;" onclick="resetCount(${i})">归零</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addCounter() {
    const name = counterNameInput.value.trim();
    if (!name) {
        showToast('请输入名称');
        return;
    }
    counters.push({ name, count: 0 });
    saveCounters();
    renderCounters();
    counterNameInput.value = '';
    addModal.classList.remove('active');
    showToast('计数器已创建');
}

window.changeCount = function(index, delta) {
    counters[index].count += delta;
    saveCounters();
    renderCounters();
};

window.resetCount = function(index) {
    counters[index].count = 0;
    saveCounters();
    renderCounters();
};

window.deleteCounter = function(index) {
    if (confirm(`确定删除 "${counters[index].name}" 吗？`)) {
        counters.splice(index, 1);
        saveCounters();
        renderCounters();
        showToast('已删除');
    }
};

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

addCounterBtn.addEventListener('click', () => {
    addModal.classList.add('active');
    counterNameInput.focus();
});

cancelAdd.addEventListener('click', () => {
    addModal.classList.remove('active');
    counterNameInput.value = '';
});

confirmAdd.addEventListener('click', addCounter);

counterNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCounter();
});

addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
        addModal.classList.remove('active');
        counterNameInput.value = '';
    }
});

renderCounters();
