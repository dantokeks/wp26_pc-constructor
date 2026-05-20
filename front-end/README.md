# PC Constructor — Frontend

Одностраничный конструктор ПК. Подключается к FastAPI бэкенду.

## Как запустить

1. Запусти бэкенд:
   ```
   uvicorn src.main:app --reload
   ```

2. Открой `index.html` в браузере через Live Server (VS Code расширение)
   — не просто двойным кликом, а через Live Server, иначе fetch не сработает из-за CORS.

3. Если бэкенд на другом порту — измени в начале script.js:
   ```js
   const API = 'http://localhost:8000';
   ```

## Структура файлов

```
index.html   — вся HTML разметка (одна страница, 7 вкладок)
style.css    — все стили
script.js    — вся логика (с подробными комментариями)
```

## Как работает переключение вкладок

```js
function switchTab(name) {
  // скрыть все .tab
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  // показать нужную
  document.getElementById('tab-' + name).classList.remove('hidden');
}
```

Это весь механизм SPA — никакого React/Vue не нужно.

## Как работает совместимость

При выборе CPU → следующий шаг (материнки) автоматически
запрашивает `/build/compatible_cpu_motherboard?cpu=...`
вместо обычного `/components/motherboard`.

Бэкенд сам фильтрует — фронтенд просто показывает результат.
