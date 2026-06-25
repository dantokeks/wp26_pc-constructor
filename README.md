# PC Constructor

PC Constructor is a web application for building a custom PC configuration. It combines a FastAPI backend with a plain HTML/CSS/JavaScript frontend and helps users choose compatible components step by step.

## Features

- Browse PC components by category.
- Filter components by price and category-specific fields.
- Search components by name.
- Search GPUs by chipset.
- Build a PC in this order:
  1. Processor
  2. Motherboard
  3. RAM
  4. Cooling
  5. Video card
  6. Power supply
  7. Storage device
- Automatically show compatible components after key selections.
- Save the current build in `localStorage`.
- Display selected components, total price, and a simple PC visualization.

## Tech Stack

- Backend: FastAPI, Uvicorn
- Frontend: HTML, CSS, JavaScript
- Data: JSON files in `src/data`

## Project Structure

```text
pc-constructor/
├── front-end/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── README.md
├── src/
│   ├── build/
│   ├── components/
│   ├── data/
│   └── main.py
├── requirements.txt
└── README.md
```

## Installation

Create and activate a virtual environment:

```powershell
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

## Running the Backend

From the project root, run:

```powershell
python -m uvicorn src.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI documentation is available at:

```text
http://localhost:8000/docs
```

You can also run the backend with:

```powershell
python src/main.py
```

## Running the Frontend

Open `front-end/index.html` through a local server, for example the VS Code Live Server extension.

Do not rely on opening the file directly by double-clicking if browser CORS rules block requests.

The frontend expects the backend at:

```js
const API = 'http://localhost:8000';
```

You can change this value at the top of `front-end/script.js` if the backend uses another host or port.

## Main API Endpoints

Component endpoints:

```text
GET /components/cpu
GET /components/gpu
GET /components/ram
GET /components/cpu-cooler
GET /components/motherboard
GET /components/power-supply
GET /components/storage(SSD_HDD)
```

Compatibility endpoints:

```text
GET /build/compatible_cpu_motherboard
GET /build/compatible_motherboard_ram
GET /build/compatible_cpu_cooler
GET /build/compatible_psu_to_everything
```

Common component query parameters:

```text
limit
offset
min_price
max_price
sort_by_price
name
```

Some endpoints also support category-specific filters such as `core_count`, `graphics`, `memory`, or `size`.

## Search

The frontend sends component search input as the `name` query parameter.

For most components, the backend searches with `find_by_name`.

For GPUs, the backend searches with `find_by_gpu_chipset`.

Example:

```text
GET /components/cpu?name=Ryzen&limit=12&offset=0
GET /components/gpu?name=RTX&limit=12&offset=0
```

## Compatibility Flow

The build flow is designed around compatibility:

- After selecting a CPU, the motherboard tab shows compatible motherboards.
- After selecting a motherboard, the RAM tab shows compatible RAM.
- After selecting a CPU, the cooling tab shows compatible coolers.
- After selecting both CPU and GPU, the power supply tab shows compatible PSUs.

If a search field is used on a tab, the frontend performs a direct component search for that category.

## Notes

- Selected parts are stored in browser `localStorage` under `pc-build`.
- Use the "Clear build" button to reset the current configuration.
- The frontend is a small single-page app without React, Vue, or a build step.
- The original `opendata-2026-04-14-000002+0000.jsonl` import file is not stored in Git because it is larger than GitHub's file size limit. The application uses the processed JSON files in `src/data`.
