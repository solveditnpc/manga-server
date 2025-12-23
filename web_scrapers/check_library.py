import sqlite3
import os

# Path to the database inside the Docker container
DB_PATH = '/database/manga_database.db'

def scan_library():
    print("--- Starting Full Library Scan ---")
    
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get all entries: ID, Title, Expected Pages, and Path
        cursor.execute("SELECT manga_id, title, total_pages, download_path FROM mangas")
        all_rows = cursor.fetchall()
        conn.close()
    except Exception as e:
        print(f"Critical Error reading database: {e}")
        return

    print(f"Total entries in database: {len(all_rows)}\n")

    # Lists to store the results
    no_download_path_ids = []
    missing_pages_ids = []

    # Valid image extensions to count
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')

    for row in all_rows:
        manga_id, title, total_pages, download_path = row
        
        # Safety check for None values in total_pages
        if total_pages is None:
            total_pages = 0

        # --- CHECK 1: Is the download path missing? ---
        if not download_path:
            print(f"[NO PATH] ID: {manga_id} | Title: {title[:60]}...")
            no_download_path_ids.append(manga_id)
            continue # Skip to next, can't check pages if no path

        # --- CHECK 2: Do we have all the pages? ---
        if not os.path.isdir(download_path):
            print(f"[DIR MISSING] ID: {manga_id} | Path not found: {download_path}")
            missing_pages_ids.append(manga_id)
        else:
            try:
                # Count files in the directory
                files = os.listdir(download_path)
                image_count = sum(1 for f in files if f.lower().endswith(valid_extensions))

                if image_count < total_pages:
                    print(f"[MISSING PAGES] ID: {manga_id} | Expected: {total_pages} | Found: {image_count}")
                    missing_pages_ids.append(manga_id)
            except Exception as e:
                print(f"[ERROR] Could not scan folder for ID {manga_id}: {e}")

    # --- FINAL SUMMARY ---
    print("\n" + "="*60)
    print("FINAL REPORT")
    print("="*60)

    print(f"\n1. IDs with NO Download Path ({len(no_download_path_ids)}):")
    print(f"   (These are likely 'ghost' entries to be deleted)")
    print(no_download_path_ids)

    print(f"\n2. IDs with MISSING Pages ({len(missing_pages_ids)}):")
    print(f"   (These exist but are incomplete)")
    print(missing_pages_ids)

    print("\n" + "="*60)

if __name__ == "__main__":
    scan_library()
