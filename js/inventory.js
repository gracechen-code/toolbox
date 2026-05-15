let items = JSON.parse(localStorage.getItem('inventory')) || [];
let syncConfig = JSON.parse(localStorage.getItem('syncConfig')) || { apiKey: '', binId: '' };

const inventoryList = document.getElementById('inventoryList');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const addBtn = document.getElementById('addBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const syncBtn = document.getElementById('syncBtn');

const itemModal = document.getElementById('itemModal');
const importModal = document.getElementById('importModal');
const syncModal = document.getElementById('syncModal');

const modalTitle = document.getElementById('modalTitle');
const editId = document.getElementById('editId');
const itemName = document.getElementById('itemName');
const itemQuantity = document.getElementById('itemQuantity');
const itemLocation = document.getElementById('itemLocation');
const itemCategory = document.getElementById('itemCategory');
const itemNote = document.getElementById('itemNote');

const cancelModal = document.getElementById('cancelModal');
const saveModal = document.getElementById('saveModal');

const importData = document.getElementById('importData');
const cancelImport = document.getElementById('cancelImport');
const confirmImport = document.getElementById('confirmImport');

const apiKeyInput = document.getElementById('apiKey');
const binIdInput = document.getElementById('binId');
const cancelSync = document.getElementById('cancelSync');
const uploadSync = document.getElementById('uploadSync');
const downloadSync = document.getElementById('downloadSync');

const toast = document.getElementById('toast');

function saveItems() {
    localStorage.setItem('inventory', JSON.stringify(items));
}

function getCategories() {
    const cats = [...new Set(items.map((i) => i.category).filter(Boolean))];
    return cats.sort();
}

function updateCategoryFilter() {
    const cats = getCategories();
    const current = filterCategory.value;
    filterCategory.innerHTML = '<option value="">全部分类</option>' +
        cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    filterCategory.value = current;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFilteredItems() {
    const search = searchInput.value.toLowerCase();
    const category = filterCategory.value;
    return items.filter((item) => {
        const matchSearch = !search ||
            item.name.toLowerCase().includes(search) ||
            (item.location && item.location.toLowerCase().includes(search)) ||
            (item.note && item.note.toLowerCase().includes(search));
        const matchCategory = !category || item.category === category;
        return matchSearch && matchCategory;
    });
}

function renderItems() {
    const filtered = getFilteredItems();
    updateCategoryFilter();

    if (filtered.length === 0) {
        inventoryList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <p>${items.length === 0 ? '暂无物品，点击上方"添加"开始' : '没有匹配的物品'}</p>
            </div>`;
        return;
    }

    inventoryList.innerHTML = `
        <table class="inventory-table">
            <thead>
                <tr>
                    <th>名称</th>
                    <th>数量</th>
                    <th>位置</th>
                    <th>分类</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map((item) => `
                    <tr>
                        <td>
                            <div class="list-item-title">${escapeHtml(item.name)}</div>
                            ${item.note ? `<div class="list-item-meta">${escapeHtml(item.note.substring(0, 30))}${item.note.length > 30 ? '...' : ''}</div>` : ''}
                        </td>
                        <td>${item.quantity}</td>
                        <td>${escapeHtml(item.location || '-')}</td>
                        <td>${escapeHtml(item.category || '-')}</td>
                        <td class="actions">
                            <button onclick="editItem('${item.id}')" title="编辑">✏️</button>
                            <button onclick="deleteItem('${item.id}')" title="删除">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}

function openAddModal() {
    modalTitle.textContent = '添加物品';
    editId.value = '';
    itemName.value = '';
    itemQuantity.value = '1';
    itemLocation.value = '';
    itemCategory.value = '';
    itemNote.value = '';
    itemModal.classList.add('active');
    itemName.focus();
}

function openEditModal(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    modalTitle.textContent = '编辑物品';
    editId.value = item.id;
    itemName.value = item.name;
    itemQuantity.value = item.quantity;
    itemLocation.value = item.location || '';
    itemCategory.value = item.category || '';
    itemNote.value = item.note || '';
    itemModal.classList.add('active');
    itemName.focus();
}

function saveItem() {
    const name = itemName.value.trim();
    if (!name) {
        showToast('请输入名称');
        return;
    }

    const data = {
        name,
        quantity: parseInt(itemQuantity.value) || 0,
        location: itemLocation.value.trim(),
        category: itemCategory.value.trim(),
        note: itemNote.value.trim()
    };

    if (editId.value) {
        const index = items.findIndex((i) => i.id === editId.value);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
        }
        showToast('已更新');
    } else {
        items.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            ...data,
            createdAt: new Date().toISOString()
        });
        showToast('已添加');
    }

    saveItems();
    renderItems();
    itemModal.classList.remove('active');
}

function deleteItem(id) {
    const item = items.find((i) => i.id === id);
    if (item && confirm(`确定删除 "${item.name}" 吗？`)) {
        items = items.filter((i) => i.id !== id);
        saveItems();
        renderItems();
        showToast('已删除');
    }
}

function exportData() {
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出');
}

function openImportModal() {
    importData.value = '';
    importModal.classList.add('active');
    importData.focus();
}

function importData() {
    try {
        const data = JSON.parse(importData.value);
        if (!Array.isArray(data)) throw new Error('数据格式错误');
        data.forEach((item) => {
            if (!item.id) item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            if (!item.createdAt) item.createdAt = new Date().toISOString();
        });
        items = [...items, ...data];
        saveItems();
        renderItems();
        importModal.classList.remove('active');
        showToast(`已导入 ${data.length} 条数据`);
    } catch (e) {
        showToast('JSON 格式错误: ' + e.message);
    }
}

function openSyncModal() {
    apiKeyInput.value = syncConfig.apiKey || '';
    binIdInput.value = syncConfig.binId || '';
    syncModal.classList.add('active');
}

async function uploadToCloud() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showToast('请输入 API Key');
        return;
    }

    syncConfig.apiKey = apiKey;
    localStorage.setItem('syncConfig', JSON.stringify(syncConfig));

    const url = syncConfig.binId
        ? `https://api.jsonbin.io/v3/b/${syncConfig.binId}`
        : 'https://api.jsonbin.io/v3/b';

    const method = syncConfig.binId ? 'PUT' : 'POST';

    try {
        showToast('上传中...');
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(items)
        });

        if (!res.ok) throw new Error('上传失败');

        const data = await res.json();
        if (!syncConfig.binId && data.metadata) {
            syncConfig.binId = data.metadata.id;
            localStorage.setItem('syncConfig', JSON.stringify(syncConfig));
            binIdInput.value = syncConfig.binId;
        }

        showToast('上传成功');
        syncModal.classList.remove('active');
    } catch (e) {
        showToast('上传失败: ' + e.message);
    }
}

async function downloadFromCloud() {
    const apiKey = apiKeyInput.value.trim();
    const binId = binIdInput.value.trim();

    if (!apiKey || !binId) {
        showToast('请输入 API Key 和 Bin ID');
        return;
    }

    syncConfig.apiKey = apiKey;
    syncConfig.binId = binId;
    localStorage.setItem('syncConfig', JSON.stringify(syncConfig));

    try {
        showToast('下载中...');
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': apiKey }
        });

        if (!res.ok) throw new Error('下载失败');

        const data = await res.json();
        items = data.record;
        saveItems();
        renderItems();
        showToast('下载成功');
        syncModal.classList.remove('active');
    } catch (e) {
        showToast('下载失败: ' + e.message);
    }
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

addBtn.addEventListener('click', openAddModal);
saveModal.addEventListener('click', saveItem);
cancelModal.addEventListener('click', () => itemModal.classList.remove('active'));

exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', openImportModal);
confirmImport.addEventListener('click', importData);
cancelImport.addEventListener('click', () => importModal.classList.remove('active'));

syncBtn.addEventListener('click', openSyncModal);
cancelSync.addEventListener('click', () => syncModal.classList.remove('active'));
uploadSync.addEventListener('click', uploadToCloud);
downloadSync.addEventListener('click', downloadFromCloud);

searchInput.addEventListener('input', renderItems);
filterCategory.addEventListener('change', renderItems);

itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) itemModal.classList.remove('active');
});

importModal.addEventListener('click', (e) => {
    if (e.target === importModal) importModal.classList.remove('active');
});

syncModal.addEventListener('click', (e) => {
    if (e.target === syncModal) syncModal.classList.remove('active');
});

itemName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveItem();
});

window.editItem = openEditModal;
window.deleteItem = deleteItem;

renderItems();
