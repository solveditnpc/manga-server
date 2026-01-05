# Server & Web Interface Container

The **Server** container is the central orchestrator of the Manga Library application. It hosts the admin-facing web interface (`index.html`), serves the static manga images, and provides the primary HTTP API that connects the database, the file system, and the scraping microservice.

## 🔌 API Documentation

**Base URL:** `http://localhost:5001` (or `http://server:5001` internally)

### 1. Fetch Library Content
Retrieves a paginated list of manga. This endpoint automatically scans the file system to append file paths and cover images to the database metadata.

* **Endpoint:** `/api/mangas`
* **Method:** `GET`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `int` | `1` | The page number to retrieve. |
| `limit` | `int` | `24` | Number of items per page (Hardcoded to 24 in `server.get_mangas_route`). |
| `q` | `string` | `null` | Search query (matches Title, Author, Tags, or ID). |
| `sort` | `string` | `'date'` | Sort order: `'date'` (Newest First) or `'likes'` (Most Liked). |
| `server` | `string` | `null` | **Source Selector**. Pass `'S'` to query Suwayomi data, or omit for Standard (Nhentai) data. |

#### Usage Examples

**Option A: Standard Library (Nhentai)**

* **Request:** `GET http://localhost:5001/api/mangas?q=fantasy+time+travel&sort=date&page=1`

**Response Example:**
```json
{
  "current_page": 1,
  "mangas": [
    {
      "author": "name",
      "cover_image": "001.webp",
      "download_path": "/data/Author_name/manga_name",
      "like_count": 51,
      "manga_id": 123456,
      "page_files": ["001.jpg", "002.jpg", "003.jpg", ......],
      "score": 1,
      "tags": "[{\"type\":\"tags\",\"name\":\"fantasy\"},{}]",
      "title": "abcd [English] [Decensored] [Boo-Boo Translations]",
      "total_pages": 25
    },
    {
      "author": "name",
      "cover_image": "005.webp",
      ......
    }
  ]
  "total_items": 70,
  "total_pages": 5,
}
```
> **Note:** For Standard items, image URLs are constructed by appending the filename to the download path: `/data/author_name/manga_name/1600.jpg` and has cover_image path pointing to the cover of hte manga 
> **Note:** "Score"  tells how many search terms your query matches in the database table , so higher score means more likely the searched manga/category
---

**Option B: Suwayomi Library (`server=S`)**
Fetches items synced from the Suwayomi instance. Returns nested chapter structures.
* **Request:** `GET http://localhost:5001/api/mangas?server=S&q=fantasy+action&sort=likes&page=1`

**Response Example:**
```json
{
    "current_page": 1,
    "total_items": 2,
    "total_pages": 1,
    "mangas": [
        {
            "author": "hong daeui/ Q10",
            "chapters": [
                {
                    "title": "Chapter 95",
                    "images": ["001.webp", "002.webp", "003.webp", "..."]
                },
                {
                    "title": "Chapter 96 - S1 END",
                    "images": ["001.webp", "002.webp", "003.webp", "..."]
                }
            ],
            "cover_image": "suwayomi_data/downloads/thumbnails/5.webp",
            "download_path": "/suwayomi_data/downloads/mangas/Asura Scans (EN)/Star-Embracing Swordmaster",
            "download_timestamp": "2026-01-04T16:53:25.310324",
            "like_count": 0,
            "manga_id": "5",
            "page_files": [],
            "score": 1,
            "tags": "[{\"type\":\"suwayomi\",\"name\":\"Manhwa\"},{\"type\":\"suwayomi\",\"name\":\"Action\"},{\"type\":\"suwayomi\",\"name\":\"Adventure\"},{\"type\":\"suwayomi\",\"name\":\"Fantasy\"},{\"type\":\"suwayomi\",\"name\":\"Genius MC\"}]",
            "title": "Star-Embracing Swordmaster",
            "total_pages": 2
        },
        {
            "author": "추공 (Chugong)",
            "chapters": [
                {
                    "title": "Chapter 196 - Side Story 17",
                    "images": ["001.webp", "002.webp", "..."]
                },
                {
                    "title": "Chapter 200 - Side Story 21 { THE END }",
                    "images": ["001.webp", "002.webp", "..."]
                }
            ],
            "cover_image": "suwayomi_data/downloads/thumbnails/23.webp",
            "download_path": "/suwayomi_data/downloads/mangas/Asura Scans (EN)/Solo Leveling",
            "download_timestamp": "2026-01-04T16:53:23.259197",
            "like_count": 0,
            "manga_id": "23",
            "page_files": [],
            "score": 1,
            "tags": "[{\"type\":\"suwayomi\",\"name\":\"Manhwa\"},{\"type\":\"suwayomi\",\"name\":\"Action\"},{\"type\":\"suwayomi\",\"name\":\"Adventure\"},{\"type\":\"suwayomi\",\"name\":\"Fantasy\"},{\"type\":\"suwayomi\",\"name\":\"Shounen\"}]",
            "title": "Solo Leveling",
            "total_pages": 2
        }
    ]
}
```
> **Note:** "Score"  tells how many search words your query matches in the database table , so higher score means more likely the searched manga/category
> **Note:** For Suwayomi items, image URLs are constructed by appending the filename to the download_path/chapters.title/001.webp: `/suwayomi_data/downloads/mangas/Asura Scans (EN)/Solo Leveling/Chapter 200 - Side Story 21 { THE END }/001.webp`
> **Note:** For Suwayomi thumbnails, image URLs are cover_image(the image name is manga_id.webp/manga_id.jpeg etc): `suwayomi_data/downloads/thumbnails/23.webp`



### 2. Download Proxy
Forwards a download request to the scraping microservice.

* **Endpoint:** `/api/download`
* **Method:** `POST`
* **Payload:** `{"manga_id": 123}` OR `{"author": "Artist Name"}`
* **Behavior:** Sends request to `http://web-scraper:5002/api/queue`.

### 3. File Serving
Serves the actual image files.

* **Endpoint:** `/mangas/<path:filename>`
* **Logic:**
    * If path starts with `suwayomi_data`: Serves from the read-only Suwayomi volume.
    * Otherwise: Serves from the standard `/data` volume.
    * jpg,jpeg,webp,gif etc

### 4. Item Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `DELETE` | `/api/mangas/<id>` | Deletes metadata from DB and removes folder from disk (Standard only). **Note:** ID is a int here.|
| `POST` | `/api/mangas/<id>/like` | Increments/decrements like count (Standard). **Note:** ID is a int here.|
| `POST` | `/api/s_mangas/<id>/like` | Increments/decrements like count (Suwayomi). **Note:** ID is a string here. |

---

## 🛠 Internal Developer Guide

### "Layer 3" Scanning Logic (`server.py`)
A key feature of this server is how it handles the file structure differences between the two sources in the `_add_file_details` function:

1.  **Standard (Nhentai):**
    * **Structure:** Flat folder of images (`/data/Mangas/Author_Name/Manga_Name/001.jpg`).
    * **Logic:** Simply lists all valid image extensions in the folder.

2.  **Suwayomi ('S' Source):**
    * **Structure:** Nested Chapters (`/suwayomi_data/.../Manga/Chapter 1/01.jpg`).
    * **Logic:**
        1.  Finds all sub-directories (Chapters).
        2.  Sorts them naturally (Chapter 1, Chapter 2, ... Chapter 10).
        3.  Scans inside *each* chapter folder for images.
        4.  Returns a structured `chapters` JSON array containing the hierarchy.

### Volume Mappings
Ensure these paths are mounted in `docker-compose.yml`:

| Container Path | Purpose |
| :--- | :--- |
| `/data` | Read/Write. Stores Standard downloads. |
| `/suwayomi_data` | Read-Only. Mounts the Suwayomi root to access its downloads. |
| `/database` | Read/Write. Shared SQLite file location. |