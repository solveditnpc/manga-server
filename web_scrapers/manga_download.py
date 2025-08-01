import os
import re
import asyncio
from typing import Optional

from parallel_download import download_manga
from update_manga_info import fetch_and_store_manga_details
from database import init_db, update_manga_download_path, get_manga_author

def safe_format_foldername(name: str) -> str:
    if not name:
        return 'Unknown_Author'
    
    sanitized_name = re.sub(r'[<>:"/\\|?*]', '', name).strip()
    return sanitized_name[:255]

async def process_single_manga(manga_id: int):
    print(f"\n--- Starting process for Manga ID: {manga_id} ---")
    
    print(f"\n[1/4] Checking and updating database details for manga ID: {manga_id}...")
    await fetch_and_store_manga_details(manga_id)

    print("\n[2/4] Retrieving author name from database...")
    author_name = get_manga_author(manga_id)
    
    if author_name:
        print(f"  > Found author: {author_name}")
    else:
        print("  > Warning: Author not found in database. Using 'Unknown_Author'.")

    author_folder_name = safe_format_foldername(author_name)
    download_dir = os.path.join('/data', author_folder_name)
    
    print(f"  > Download directory set to: {download_dir}")
    os.makedirs(download_dir, exist_ok=True)

    print(f"\n[3/4] Starting image download for manga ID: {manga_id}...")
    manga_url = f"https://nhentai.xxx/g/{manga_id}/"
    downloaded_path, failed_pages = await download_manga(manga_url, download_dir, create_pdf=False)

    if downloaded_path:
        print(f"\n[4/4] Updating database with final download path: {downloaded_path}")
        update_manga_download_path(manga_id, downloaded_path)
    
    if failed_pages:
        print(f"\n--- WARNING: Process for {manga_id} finished, but failed to download pages: {failed_pages} ---")
    else:
        print(f"\n--- SUCCESS: Successfully processed Manga ID: {manga_id} ---")

async def main():
    print("Initializing database...")
    init_db()
    
    try:
        manga_id_input = input("Enter the manga ID to download: ").strip()
        if manga_id_input.isdigit():
            await process_single_manga(int(manga_id_input))
        else:
            print("Invalid input. Please enter a numerical ID.")
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        print(f"A critical error occurred: {e}")

if __name__ == '__main__':
    asyncio.run(main())
