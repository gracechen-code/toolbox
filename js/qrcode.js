const presetFields = ['Wi-Fi_SSID', 'Wi-Fi_PWD', 'Volumn'];

let selectedFields = JSON.parse(localStorage.getItem('qrcodeSelectedFields')) || [];

const presetBtns = document.getElementById('presetBtns');
const customFieldInput = document.getElementById('customFieldInput');
const addCustomFieldBtn = document.getElementById('addCustomFieldBtn');
const selectedFieldsContainer = document.getElementById('selectedFields');
const generateBtn = document.getElementById('generateBtn');
const qrCard = document.getElementById('qrCard');
const qrcodeContainer = document.getElementById('qrcode');
const toast = document.getElementById('toast');

let qrInstance = null;

function saveSelectedFields() {
    localStorage.setItem('qrcodeSelectedFields', JSON.stringify(selectedFields));
}

function renderPresetButtons() {
    presetBtns.querySelectorAll('.preset-btn').forEach((btn) => {
        const field = btn.dataset.field;
        const isSelected = selectedFields.some((f) => f.name === field);
        btn.classList.toggle('btn-primary', isSelected);
        btn.classList.toggle('btn-outline', !isSelected);
    });
}

function renderSelectedFields() {
    if (selectedFields.length === 0) {
        selectedFieldsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>点击上方按钮添加字段</p>
            </div>`;
        return;
    }

    selectedFieldsContainer.innerHTML = selectedFields.map((f, i) => `
        <div class="list-item" data-index="${i}">
            <div class="list-item-content" style="display: flex; gap: 8px; align-items: center;">
                <span style="font-weight: 500; min-width: 100px;">${escapeHtml(f.name)}</span>
                <span style="color: var(--text-secondary);">=</span>
                <input type="text" class="input field-value" value="${escapeHtml(f.value)}" placeholder="输入值" style="flex: 1;">
            </div>
            <div class="list-item-actions">
                <button onclick="removeField(${i})" title="删除">🗑️</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.field-value').forEach((input, i) => {
        input.addEventListener('input', (e) => {
            selectedFields[i].value = e.target.value;
            saveSelectedFields();
        });
    });

    renderPresetButtons();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addField(name) {
    if (selectedFields.some((f) => f.name === name)) {
        showToast('字段已存在');
        return;
    }
    selectedFields.push({ name, value: '' });
    saveSelectedFields();
    renderSelectedFields();
}

window.removeField = function(index) {
    selectedFields.splice(index, 1);
    saveSelectedFields();
    renderSelectedFields();
};

presetBtns.addEventListener('click', (e) => {
    if (e.target.classList.contains('preset-btn')) {
        const field = e.target.dataset.field;
        addField(field);
    }
});

addCustomFieldBtn.addEventListener('click', () => {
    const name = customFieldInput.value.trim();
    if (!name) {
        showToast('请输入字段名');
        return;
    }
    addField(name);
    customFieldInput.value = '';
});

customFieldInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addCustomFieldBtn.click();
    }
});

function generatePayload() {
    const ESC = '\x1B';
    const CR = '\x0D';
    let payload = '#<HPRTSetting>';

    const validFields = selectedFields.filter((f) => f.name);
    for (let i = 0; i < validFields.length; i++) {
        payload += `#$${validFields[i].name}$@${validFields[i].value}`;
        if (i < validFields.length - 1) {
            payload += ESC;
        }
    }

    if (payload === '#<HPRTSetting>') return '';
    payload += CR;
    return payload;
}

function generateQR() {
    const payload = generatePayload();
    if (!payload) {
        showToast('请至少添加一个字段');
        return;
    }

    qrcodeContainer.innerHTML = '';
    qrInstance = new QRCode(qrcodeContainer, {
        text: payload,
        width: 256,
        height: 256,
        colorDark: '#1e293b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    qrCard.style.display = 'block';
    showToast('二维码已生成');
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

generateBtn.addEventListener('click', generateQR);

renderSelectedFields();
