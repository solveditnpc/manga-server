# Web Scraper & Download Microservice

This container acts as the central download engine and library synchronizer for the manga platform. It abstracts complex scraping logic (Playwright/HTTPX) behind a simple REST API and handles background synchronization with an external **Suwayomi** instance.

## System Architecture

The service utilizes a **Producer-Consumer** architecture to decouple high-latency scraping tasks from the HTTP API. This ensures the web server remains responsive even when processing heavy download queues.


### Core Components

The container launches three concurrent processes via `start.sh`:

1.  **API Server (`api.py`)**
    * **Role:** Producer
    * **Tech:** Flask running on Gunicorn (Port 5002).
    * **Function:** Accepts incoming HTTP POST requests. It validates input and immediately serializes the task into a persistent JSON-based queue (`/database/queue.json`). It does **not** perform downloads directly.

2.  **Queue Processor (`processor.py`)**
    * **Role:** Consumer
    * **Tech:** Python `asyncio` loop.
    * **Function:**
        * Polls `queue.json` every 30 seconds.
        * Manages concurrency using `asyncio.Semaphore` (Default: 5 concurrent downloads).
        * Executes complex scraping workflows using **Playwright** (for Cloudflare/CAPTCHA navigation) and **HTTPX** (for high-speed HTTP/2 image retrieval).
        * Updates the local SQLite database upon task completion.

3.  **Suwayomi Sync (`suwayomi_sync.py`)**
    * **Role:** Background Synchronizer
    * **Tech:** Python standalone script.
    * **Function:**
        * Runs every 60 seconds.
        * Scans the **local Suwayomi thumbnails directory** (`/suwayomi_data/downloads/thumbnails`) to identify valid IDs (Source of Truth).
        * Queries the external Suwayomi API (`/api/v1/manga/{id}/chapters`) to verify download status.
        * Upserts metadata into the `S_mangas` table in the shared database.

---

## API Documentation

**Base URL:** `http://localhost:5002` (or `http://web-scraper:5002` internally)

### 1. Queue Download Task

Submit a new download job. The server will validate the request and queue it for background processing.

* **Endpoint:** `/api/queue`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

#### Request Body Schemas

**Option A: Download by ID (Nhentai)**
Starts from 1 to 999999 and is capable of adjusting to 1M+ , send one id or author name at a time and there should be a 10 milli second delay between requests

```json
{
  "manga_id": 12345
}
```

**Option B: Download by Author**
Use this to scrape and download *all* works by a specific author.send one request at a time and with a delay of 10 milli seconds between requests 

```json
{
  "author": "author_name1"
}
```

#### Responses
```json
{
    "message": "Item added to queue successfully",
    "item": {
        "type": "id",
        "value": 12345
    }
}
```
```json
{
    "message": "Item added to queue successfully",
    "item": {
        "type": "author",
        "value": "author_name1"
    }
}
```
---

## Internal Developer Guide

### Database Schema (`database.py`)

The service uses a shared SQLite database (`/database/manga_database.db`) with two primary distinct scopes:

1.  **Standard Tables (`mangas`):** Stores data for items downloaded directly by this scraper.
    * *Key Columns:* `manga_id` (INT), `download_path`, `total_pages`, `like_count`.
2.  **Suwayomi Tables (`S_mangas`):** Stores read-only metadata synced from Suwayomi.
    * *Key Columns:* `manga_id` (TEXT), `source`, `last_synced`.
    * *Note:* The `S_manga_tags` table links to the shared `tags` table but is maintained separately.

### Concurrency & Performance

* **Parallel Downloads:** The `parallel_download.py` module calculates optimal concurrency based on page count.
    * < 50 pages: ~5 concurrent streams.
    * > 100 pages: Up to 10 concurrent streams (capped by CPU count).
* **Browser Management:** Playwright is used strictly for the initial page load to bypass protections and extract image tokens. Actual image downloading is handed off to `HTTPX` (HTTP/2 enabled) for maximum speed.

### Volume Mappings

For the container to function, ensure these volumes are mapped in `docker-compose.yml`:

| Container Path | Host/Purpose |
| :--- | :--- |
| `/database` | Stores `manga_database.db` and `queue.json`. |
| `/data` | Destination for downloads. |
| `/suwayomi_data` | Read-only access to Suwayomi's root folder (for thumbnails scan and manga img read). |

### Troubleshooting Tools

The container includes standalone utility scripts for maintenance. You can run these commands while your stack is running:

* **`repairing_manga.py`**
    Scans the database for downloaded items, checks the file system for missing pages, and attempts to re-download only the missing images.
    ```bash
    docker compose run --rm web-scraper python repairing_manga.py
    ```

* **`check_library.py`**
    A read-only audit tool that prints a report of "ghost" entries (DB records with no files) or corrupt entries (folders missing images).
    ```bash
    docker compose run --rm web-scraper python check_library.py
    ```

* **`delete_manga.py`**
    Safely removes a manga entry from the DB and deletes its folder from the disk. Interactive prompt will ask for the ID.
    ```bash
    docker compose run --rm web-scraper python delete_manga.py
    ``` 
* **Once you are done troubleshooting you can simply exit the container "ctrl+c" and run the webscraper normally again using**
    ```bash
    docker compose up web-scraper
    ```