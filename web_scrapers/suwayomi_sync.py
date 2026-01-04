import os
import time
import requests
import re
import database

SUWAYOMI_ROOT = "/suwayomi_data"

DOWNLOADS_PATH = os.path.join(SUWAYOMI_ROOT, "downloads", "mangas")

THUMBNAILS_PATH = os.path.join(SUWAYOMI_ROOT, "downloads","thumbnails")

API_URL = os.getenv("SUWAYOMI_HOST", "http://suwayomi:4567") + "/api/v1"

def sanitize_filename(name):
    """
    Sanitizes a string to match how Suwayomi saves folders.
    Replaces illegal characters with underscores.
    """
    if not name: return ""
    name = re.sub(r'[\\/*?:"<>|]', '_', name)
    return name.strip(". ")

def sync_library():
    if not os.path.exists(THUMBNAILS_PATH): 
        print(f"Waiting for Suwayomi thumbnails folder: {THUMBNAILS_PATH}")
        return

    print("--- Syncing via Thumbnails & API ---")

    try:
        files = os.listdir(THUMBNAILS_PATH)
    except Exception as e:
        print(f"Error accessing thumbnails: {e}")
        return

    processed_count = 0

    for filename in files:
        manga_id = os.path.splitext(filename)[0]

        if not manga_id.isdigit():
            continue

        try:
            ch_res = requests.get(f"{API_URL}/manga/{manga_id}/chapters", timeout=2)
            if not ch_res.ok: continue
            
            chapters = ch_res.json()
            
            # Count strictly downloaded chapters (downloaded: true)
            downloaded_count = sum(1 for ch in chapters if ch.get('downloaded') is True)

            # 4. If downloaded > 0, we take the server's word and sync it
            if downloaded_count > 0:
                
                # 5. Get Metadata (Title, Author, Source) for the DB
                meta_res = requests.get(f"{API_URL}/manga/{manga_id}", timeout=2)
                if not meta_res.ok: continue
                meta = meta_res.json()

                title = meta.get('title', 'Unknown')
                author = meta.get('author') or meta.get('artist') or "Unknown"
                
                # Suwayomi folders use the 'displayName' (e.g., "Asura Scans (EN)")
                source_obj = meta.get('source', {})
                source_name = source_obj.get('displayName') or source_obj.get('name') or "Unknown Source"
                
                # We are NOT scanning this path, just constructing the string for the database
                safe_source = sanitize_filename(source_name)
                safe_title = sanitize_filename(title)
                constructed_path = os.path.join(DOWNLOADS_PATH, safe_source, safe_title)

                tags = []
                genre_data = meta.get('genre', [])
                if isinstance(genre_data, list):
                    tags = [t.strip() for t in genre_data if t]
                elif isinstance(genre_data, str):
                    tags = [t.strip() for t in genre_data.split(',')]

                db_entry = {
                    "id": manga_id,        
                    "title": title,
                    "url": meta.get('url', ''),
                    "author": author,
                    "source": source_name
                }
                
                database.add_S_manga(
                    db_entry, 
                    constructed_path,  
                    downloaded_count,   
                    tags_list=tags
                )
                print(f"[Sync] Synced ID {manga_id}: {title} ({downloaded_count} ch)")
                processed_count += 1

        except Exception as e:
            print(f"Error checking ID {manga_id}: {e}")

    print(f"--- Cycle Complete. Synced {processed_count} active mangas. ---")

if __name__ == "__main__":
    database.init_db()
    print("Waiting 15s for Suwayomi startup...")
    time.sleep(15)

    while True:
        try:
            sync_library()
        except Exception as e:
            print(f"Sync Loop Critical Error: {e}")
        
        time.sleep(60)