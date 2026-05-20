/* ================================================================
   PC CONSTRUCTOR — script.js
   Единственный JS файл. Читай комментарии — они объясняют всё.
   ================================================================ */

// ── КОНФИГ ──────────────────────────────────────────────────────
// Сюда пиши адрес своего бэкенда
const API = 'http://localhost:8000';
const LIMIT = 12; // карточек на страницу

// ── СОСТОЯНИЕ СБОРКИ ─────────────────────────────────────────────
// Здесь хранится всё что выбрал пользователь.
// Загружаем из localStorage чтобы не потерять при обновлении страницы.
let build = JSON.parse(localStorage.getItem('pc-build') || '{}');

// Текущие офсеты пагинации для каждой вкладки
const offsets = { cpu: 0, gpu: 0, motherboard: 0, ram: 0, cooler: 0, psu: 0, storage: 0 };

// ── ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ─────────────────────────────────────────
// Вся "магия" одностраничника — показываем нужный div, скрываем остальные
function switchTab(name) {
  // Скрыть все вкладки
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  // Показать нужную
  document.getElementById('tab-' + name).classList.remove('hidden');

  // Подсветить активную кнопку в навигации
  document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.step-btn[data-tab="${name}"]`);
  if (btn) btn.classList.add('active');

  // Загрузить данные для вкладки если ещё не загружены
  if (name === 'cpu')         loadCPU();
  if (name === 'gpu')         loadGPU();
  if (name === 'motherboard') loadMotherboard();
  if (name === 'ram')         loadRAM();
  if (name === 'cooler')      loadCooler();
  if (name === 'psu')         loadPSU();
  if (name === 'storage')     loadStorage();
  if (name === 'summary')     renderSummary();
}

// ── УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ЗАГРУЗКИ КАРТОЧЕК ─────────────────────
// Принимает URL, рисует карточки, делает пагинацию.
// Используется для всех вкладок — меняется только URL и поля specs.
async function fetchAndRender(url, containerId, paginationId, type, offset, specsBuilder) {
  const container   = document.getElementById(containerId);
  const pagination  = document.getElementById(paginationId);

  // Показать спиннер
  container.innerHTML = `<div class="state-msg"><div class="loading-dots">Загрузка</div></div>`;

  try {
    const res  = await fetch(url);

    // Если API недоступен — показать понятную ошибку
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const items = data.items ?? data; // /build/* возвращает массив напрямую

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="state-msg"><div class="icon">○</div>Ничего не найдено. Попробуйте изменить фильтры.</div>`;
      pagination.innerHTML = '';
      return;
    }

    // Нарисовать карточки
    container.innerHTML = items.map(item => renderCard(item, type, specsBuilder(item))).join('');

    // Подсветить уже выбранный компонент
    if (build[type]) {
      const selectedCard = [...container.querySelectorAll('.comp-card')]
        .find(c => c.dataset.name === build[type].name);
      if (selectedCard) selectedCard.classList.add('selected');
    }

    // Пагинация — только для обычных эндпоинтов (не /build/)
    const total = data.total;
    if (total !== undefined) {
      renderPagination(pagination, total, offset, LIMIT, type);
    } else {
      pagination.innerHTML = '';
    }

  } catch (err) {
    container.innerHTML = `
      <div class="state-msg">
        <div class="icon">⚠</div>
        Не удалось подключиться к API.<br>
        <span style="font-size:11px;color:var(--text3)">Убедитесь что бэкенд запущен на ${API}</span>
      </div>`;
    pagination.innerHTML = '';
  }
}

// ── ШАБЛОН КАРТОЧКИ ─────────────────────────────────────────────
// Принимает данные компонента, возвращает HTML строку карточки
function renderCard(item, type, specs) {
  const price     = item.price != null ? `$${item.price}` : null;
  const priceHtml = price
    ? `<span class="card-price">${price}</span>`
    : `<span class="card-price na">цена не указана</span>`;

  // Сохраняем item как JSON в data-атрибут — потом читаем при клике
  const itemJson = escapeAttr(JSON.stringify(item));
  const isSelected = build[type]?.name === item.name;

  return `
    <div class="comp-card ${isSelected ? 'selected' : ''}" data-name="${escapeAttr(item.name)}">
      <div class="card-name">${item.name}</div>
      <div class="card-specs">
        ${specs.map(([k, v]) => v != null
          ? `<div class="card-spec"><span>${k}</span><span class="card-spec-val">${v}</span></div>`
          : '').join('')}
      </div>
      <div class="card-footer">
        ${priceHtml}
        <button class="card-select-btn" onclick='selectPart("${type}", ${itemJson})'>
          ${isSelected ? '✓ Выбрано' : 'Выбрать →'}
        </button>
      </div>
    </div>`;
}

// Экранирование для вставки в HTML-атрибуты
function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── ПАГИНАЦИЯ ───────────────────────────────────────────────────
function changePage(type, newOffset) {
  offsets[type] = newOffset;
  switchTab(type);
}

function renderPagination(container, total, offset, limit, type) {
  if (total <= limit) { container.innerHTML = ''; return; }

  const page     = Math.floor(offset / limit) + 1;
  const maxPages = Math.ceil(total / limit);

  container.innerHTML = `
    <button class="page-btn" ${offset === 0 ? 'disabled' : ''}
      onclick="changePage('${type}', ${offset - limit})">← Назад</button>
    <span class="page-info">стр. ${page} / ${maxPages} &nbsp;·&nbsp; всего ${total}</span>
    <button class="page-btn" ${offset + limit >= total ? 'disabled' : ''}
      onclick="changePage('${type}', ${offset + limit})">Вперёд →</button>`;
}

// ── ВЫБОР КОМПОНЕНТА ────────────────────────────────────────────
// Вызывается при клике "Выбрать" на любой карточке
function selectPart(type, item) {
  build[type] = item;
  saveBuild();
  updateHeader();
  updatePanel();
  updateCheckmarks();
  updatePCVisual();
  showToast(`${type.toUpperCase()} добавлен в сборку`, 'success');

  // После выбора CPU — автоматически переходим к материнке с совместимостью
  // После выбора материнки — к RAM с совместимостью
  // После выбора CPU+GPU — при переходе к PSU покажем совместимые
  const nextTab = {
    cpu:         'motherboard',
    motherboard: 'ram',
    ram:         'cooler',
    gpu:         'psu',
    cooler:      'gpu',
    psu:         'storage',
    storage:     'summary',
  };

  setTimeout(() => {
    if (nextTab[type]) switchTab(nextTab[type]);
  }, 400);
}

// ── ЗАГРУЗЧИКИ ДЛЯ КАЖДОЙ ВКЛАДКИ ───────────────────────────────

function loadCPU() {
  const min   = document.getElementById('cpu-min').value;
  const max   = document.getElementById('cpu-max').value;
  const cores = document.getElementById('cpu-cores').value;
  const igpu  = document.getElementById('cpu-igpu').checked;
  const sort  = document.getElementById('cpu-sort').checked;
  const off   = offsets.cpu;

  let url = `${API}/components/cpu?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min)   url += `&min_price=${min}`;
  if (max)   url += `&max_price=${max}`;
  if (cores) url += `&core_count=${cores}`;
  if (igpu)  url += `&graphics=true`;

  fetchAndRender(url, 'results-cpu', 'pagination-cpu', 'cpu', off, item => [
    ['Ядра',   item.core_count],
    ['Сокет',  item.socket],
    ['TDP',    item.tdp ? item.tdp + 'W' : null],
  ]);
}

function loadGPU() {
  const min    = document.getElementById('gpu-min').value;
  const max    = document.getElementById('gpu-max').value;
  const memory = document.getElementById('gpu-memory').value;
  const sort   = document.getElementById('gpu-sort').checked;
  const off    = offsets.gpu;

  let url = `${API}/components/gpu?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min)    url += `&min_price=${min}`;
  if (max)    url += `&max_price=${max}`;
  if (memory) url += `&memory=${memory}`;

  fetchAndRender(url, 'results-gpu', 'pagination-gpu', 'gpu', off, item => [
    ['Память',  item.memory ? item.memory + ' GB' : null],
    ['Чипсет',  item.chipset],
    ['TDP',     item.tdp ? item.tdp + 'W' : null],
  ]);
}

function loadMotherboard() {
  const min  = document.getElementById('mb-min').value;
  const max  = document.getElementById('mb-max').value;
  const sort = document.getElementById('mb-sort').checked;
  const off  = offsets.motherboard;

  // Если выбран CPU — используем эндпоинт совместимости
  if (build.cpu) {
    const cpuName = build.cpu.name;
    document.getElementById('mb-desc').innerHTML = `
      Показаны <strong style="color:var(--accent)">совместимые</strong> материнские платы для <strong style="color:var(--text)">${cpuName}</strong>.
      <span class="compat-notice">✦ Фильтр совместимости активен</span>`;

    const url = `${API}/build/compatible_cpu_motherboard?cpu=${encodeURIComponent(cpuName)}&limit=${LIMIT}&offset=${off}`;
    fetchAndRender(url, 'results-motherboard', 'pagination-motherboard', 'motherboard', off, item => [
      ['Сокет',       item.socket],
      ['Форм-фактор', item.form_factor],
      ['Чипсет',      item.chipset],
    ]);
    return;
  }

  // Иначе — все материнки
  document.getElementById('mb-desc').textContent = 'Выберите материнскую плату. Выберите CPU сначала — тогда покажем только совместимые.';
  let url = `${API}/components/motherboard?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min) url += `&min_price=${min}`;
  if (max) url += `&max_price=${max}`;

  fetchAndRender(url, 'results-motherboard', 'pagination-motherboard', 'motherboard', off, item => [
    ['Сокет',       item.socket],
    ['Форм-фактор', item.form_factor],
    ['Чипсет',      item.chipset],
  ]);
}

function loadRAM() {
  const min  = document.getElementById('ram-min').value;
  const max  = document.getElementById('ram-max').value;
  const size = document.getElementById('ram-size').value;
  const sort = document.getElementById('ram-sort').checked;
  const off  = offsets.ram;

  // Если выбрана материнка — используем совместимость
  if (build.motherboard) {
    const mbName = build.motherboard.name;
    document.getElementById('ram-desc').innerHTML = `
      Показана <strong style="color:var(--accent)">совместимая</strong> RAM для <strong style="color:var(--text)">${mbName}</strong>.
      <span class="compat-notice">✦ Фильтр совместимости активен</span>`;

    const url = `${API}/build/compatible_motherboard_ram?motherboard=${encodeURIComponent(mbName)}&limit=${LIMIT}&offset=${off}`;
    fetchAndRender(url, 'results-ram', 'pagination-ram', 'ram', off, item => [
      ['Объём',   item.size ? item.size + ' GB' : null],
      ['Скорость', item.speed ? item.speed + ' MHz' : null],
      ['Тип',     item.type],
    ]);
    return;
  }

  document.getElementById('ram-desc').textContent = 'Выберите оперативную память. Сначала выберите материнку — тогда покажем только совместимую.';
  let url = `${API}/components/ram?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min)  url += `&min_price=${min}`;
  if (max)  url += `&max_price=${max}`;
  if (size) url += `&size=${size}`;

  fetchAndRender(url, 'results-ram', 'pagination-ram', 'ram', off, item => [
    ['Объём',   item.size ? item.size + ' GB' : null],
    ['Скорость', item.speed ? item.speed + ' MHz' : null],
    ['Тип',     item.type],
  ]);
}

function loadCooler() {
  const min  = document.getElementById('cooler-min').value;
  const max  = document.getElementById('cooler-max').value;
  const sort = document.getElementById('cooler-sort').checked;
  const off  = offsets.cooler;

  // Если выбран CPU — совместимые кулеры
  if (build.cpu) {
    const cpuName = build.cpu.name;
    document.getElementById('cooler-desc').innerHTML = `
      Совместимые кулеры для <strong style="color:var(--text)">${cpuName}</strong>.
      <span class="compat-notice">✦ Фильтр совместимости активен</span>`;

    const url = `${API}/build/compatible_cpu_cooler?cpu=${encodeURIComponent(cpuName)}&limit=${LIMIT}&offset=${off}`;
    fetchAndRender(url, 'results-cooler', 'pagination-cooler', 'cooler', off, item => [
      ['TDP',    item.tdp ? item.tdp + 'W' : null],
      ['Тип',    item.type],
      ['Сокеты', item.socket],
    ]);
    return;
  }

  document.getElementById('cooler-desc').textContent = 'Выберите кулер. Сначала выберите CPU — тогда покажем только совместимые.';
  let url = `${API}/components/cpu-cooler?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min) url += `&min_price=${min}`;
  if (max) url += `&max_price=${max}`;

  fetchAndRender(url, 'results-cooler', 'pagination-cooler', 'cooler', off, item => [
    ['TDP',  item.tdp ? item.tdp + 'W' : null],
    ['Тип',  item.type],
  ]);
}

function loadPSU() {
  const min  = document.getElementById('psu-min').value;
  const max  = document.getElementById('psu-max').value;
  const sort = document.getElementById('psu-sort').checked;
  const off  = offsets.psu;

  // Если выбраны CPU и GPU — используем совместимость по мощности
  if (build.cpu && build.gpu) {
    const cpuName = build.cpu.name;
    const gpuName = build.gpu.chipset ?? build.gpu.name;
    document.getElementById('psu-desc').innerHTML = `
      Совместимые БП для <strong style="color:var(--text)">${cpuName}</strong> + <strong style="color:var(--text)">${gpuName}</strong>.
      <span class="compat-notice">✦ Фильтр по мощности активен</span>`;

    const url = `${API}/build/compatible_psu_to_everything?cpu=${encodeURIComponent(cpuName)}&gpu=${encodeURIComponent(gpuName)}&limit=${LIMIT}&offset=${off}`;
    fetchAndRender(url, 'results-psu', 'pagination-psu', 'psu', off, item => [
      ['Мощность',  item.wattage ? item.wattage + 'W' : null],
      ['Рейтинг',   item.efficiency_rating],
      ['Модульный', item.modular],
    ]);
    return;
  }

  document.getElementById('psu-desc').textContent = 'Выберите блок питания. Выберите CPU и GPU — тогда подберём подходящий по мощности.';
  let url = `${API}/components/power-supply?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min) url += `&min_price=${min}`;
  if (max) url += `&max_price=${max}`;

  fetchAndRender(url, 'results-psu', 'pagination-psu', 'psu', off, item => [
    ['Мощность', item.wattage ? item.wattage + 'W' : null],
    ['Рейтинг',  item.efficiency_rating],
    ['Модульный', item.modular],
  ]);
}

function loadStorage() {
  const min  = document.getElementById('storage-min').value;
  const max  = document.getElementById('storage-max').value;
  const sort = document.getElementById('storage-sort').checked;
  const off  = offsets.storage;

  // Эндпоинт storage имеет пробел в URL — кодируем
  let url = `${API}/components/storage(SSD%2FHDD)?limit=${LIMIT}&offset=${off}&sort_by_price=${sort}`;
  if (min) url += `&min_price=${min}`;
  if (max) url += `&max_price=${max}`;

  fetchAndRender(url, 'results-storage', 'pagination-storage', 'storage', off, item => [
    ['Объём',  item.capacity],
    ['Тип',    item.type],
    ['Форм',   item.form_factor],
  ]);
}

// ── ИТОГОВАЯ СБОРКА ──────────────────────────────────────────────
function renderSummary() {
  const container = document.getElementById('summary-content');

  const parts = [
    { key: 'cpu',         label: 'ПРОЦЕССОР' },
    { key: 'gpu',         label: 'ВИДЕОКАРТА' },
    { key: 'motherboard', label: 'МАТЕРИНСКАЯ ПЛАТА' },
    { key: 'ram',         label: 'ОПЕРАТИВНАЯ ПАМЯТЬ' },
    { key: 'cooler',      label: 'ОХЛАЖДЕНИЕ' },
    { key: 'psu',         label: 'БЛОК ПИТАНИЯ' },
    { key: 'storage',     label: 'НАКОПИТЕЛЬ' },
  ];

  const rows = parts.map(({ key, label }) => {
    const item = build[key];
    if (!item) return `
      <div class="summary-row empty">
        <span class="summary-type">${label}</span>
        <span class="summary-empty-name">не выбрано</span>
        <span class="summary-price" style="color:var(--text3)">—</span>
      </div>`;

    return `
      <div class="summary-row">
        <span class="summary-type">${label}</span>
        <span class="summary-name">${item.name}</span>
        <span class="summary-price">${item.price != null ? '$' + item.price : '—'}</span>
      </div>`;
  }).join('');

  const total = getTotalPrice();
  const hasAny = Object.keys(build).length > 0;

  container.innerHTML = `
    <div class="summary-grid">
      ${rows}
      <div class="summary-total-row">
        <span class="summary-total-label">ИТОГО</span>
        <span class="summary-total-price">$${total}</span>
      </div>
      ${hasAny ? `<button class="summary-go-btn" onclick="clearBuild()">✕ Начать заново</button>` : ''}
    </div>`;
}

// ── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ─────────────────────────────────────

// Сохранить сборку в localStorage
function saveBuild() {
  localStorage.setItem('pc-build', JSON.stringify(build));
}

// Очистить всю сборку
function clearBuild() {
  if (!Object.keys(build).length) return;
  build = {};
  saveBuild();
  updateHeader();
  updatePanel();
  updateCheckmarks();
  updatePCVisual();
  switchTab('cpu');
  showToast('Сборка очищена', 'info');
}

// Суммарная цена
function getTotalPrice() {
  return Object.values(build).reduce((sum, item) => sum + (item?.price ?? 0), 0);
}

// Обновить цену в шапке
function updateHeader() {
  document.getElementById('total-price').textContent = '$' + getTotalPrice();
}

// Обновить галочки в навигации
function updateCheckmarks() {
  const map = {
    cpu: 'cpu', gpu: 'gpu', motherboard: 'motherboard',
    ram: 'ram', cooler: 'cooler', psu: 'psu', storage: 'storage'
  };
  for (const [key, id] of Object.entries(map)) {
    const el = document.getElementById('check-' + id);
    if (!el) continue;
    if (build[key]) {
      el.textContent = '●';
      el.classList.add('done');
    } else {
      el.textContent = '○';
      el.classList.remove('done');
    }
  }
}

// Обновить правую панель со списком выбранного
function updatePanel() {
  const container = document.getElementById('panel-build-list');
  const items = Object.entries(build);

  if (!items.length) {
    container.innerHTML = '<div class="panel-empty">Начните добавлять компоненты</div>';
    return;
  }

  const labels = {
    cpu: 'CPU', gpu: 'GPU', motherboard: 'MB',
    ram: 'RAM', cooler: 'COOLER', psu: 'PSU', storage: 'STORAGE'
  };

  const total = getTotalPrice();

  container.innerHTML = items.map(([type, item]) => `
    <div class="panel-item">
      <div>
        <div class="panel-item-type">${labels[type] || type}</div>
        <div class="panel-item-name">${item.name.split(' ').slice(0, 4).join(' ')}</div>
      </div>
      <div class="panel-item-price">${item.price != null ? '$' + item.price : '—'}</div>
    </div>
  `).join('') + `
    <div class="panel-total">
      <span class="panel-total-label">ИТОГО</span>
      <span class="panel-total-val">$${total}</span>
    </div>`;
}

// ── 2D ВИЗУАЛИЗАЦИЯ ПК ──────────────────────────────────────────
// Подсвечиваем слоты на SVG когда компонент выбран
function updatePCVisual() {
  const slotMap = {
    cpu:         'slot-cpu',
    gpu:         'slot-gpu',
    ram:         'slot-ram',
    storage:     'slot-storage',
    psu:         'slot-psu',
    cooler:      'slot-cooler',
    motherboard: 'mb-board',
  };

  for (const [type, slotId] of Object.entries(slotMap)) {
    const el = document.getElementById(slotId);
    if (!el) continue;
    if (build[type]) {
      el.classList.add('slot-active');
      // Красим в зелёный когда выбрано
      const rects = el.querySelectorAll('rect, circle');
      rects.forEach(r => {
        r.style.fill = 'rgba(232,255,71,0.12)';
        r.style.stroke = 'rgba(232,255,71,0.6)';
      });
      const texts = el.querySelectorAll('text');
      texts.forEach(t => { t.style.fill = 'rgba(232,255,71,0.8)'; });
    } else {
      el.classList.remove('slot-active');
      const rects = el.querySelectorAll('rect, circle');
      rects.forEach(r => {
        r.style.fill = '';
        r.style.stroke = '';
      });
      const texts = el.querySelectorAll('text');
      texts.forEach(t => { t.style.fill = ''; });
    }
  }
}

// ── ТОСТ-УВЕДОМЛЕНИЕ ────────────────────────────────────────────
let toastTimer;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2500);
}

// ── ИНИЦИАЛИЗАЦИЯ ────────────────────────────────────────────────
// Запускается один раз при загрузке страницы
(function init() {
  updateHeader();
  updatePanel();
  updateCheckmarks();
  updatePCVisual();
  loadCPU(); // загрузить первую вкладку сразу
})();
