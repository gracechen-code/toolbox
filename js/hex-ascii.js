const asciiInput = document.getElementById('asciiInput');
const hexInput = document.getElementById('hexInput');
const toHexBtn = document.getElementById('toHexBtn');
const toAsciiBtn = document.getElementById('toAsciiBtn');
const clearBtn = document.getElementById('clearBtn');
const toast = document.getElementById('toast');

function asciiToHex(text) {
    return Array.from(text)
        .map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
}

function hexToAscii(hex) {
    const parts = hex.trim().split(/\s+/);
    return parts
        .map((h) => {
            const code = parseInt(h, 16);
            if (isNaN(code)) return '';
            return String.fromCharCode(code);
        })
        .join('');
}

toHexBtn.addEventListener('click', () => {
    const text = asciiInput.value;
    if (!text) {
        showToast('请输入 ASCII 文本');
        return;
    }
    hexInput.value = asciiToHex(text);
    showToast('转换完成');
});

toAsciiBtn.addEventListener('click', () => {
    const hex = hexInput.value;
    if (!hex.trim()) {
        showToast('请输入十六进制');
        return;
    }
    try {
        asciiInput.value = hexToAscii(hex);
        showToast('转换完成');
    } catch (e) {
        showToast('十六进制格式错误');
    }
});

clearBtn.addEventListener('click', () => {
    asciiInput.value = '';
    hexInput.value = '';
});

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}
