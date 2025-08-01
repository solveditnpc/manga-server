import os
import asyncio
import httpx
from typing import Set

from database import get_all_mangas_for_repair
from parallel_download import fetch_manga_images

async def download_missing_page(client: httpx.AsyncClient, page_num: int, img_url: str, manga_dir: str):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133',
            'Referer': 'https://nhentai.xxx/'
        }
        response = await client.get(img_url, headers=headers, timeout=30.0)
        response.raise_for_status()

        ext = os.path.splitext(img_url)[1] or '.jpg'
        filename = f"{page_num:03d}{ext}"
        filepath = os.path.join(manga_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  Successfully repaired page {page_num}")
        return True
    except Exception as e:
        print(f"  Failed to repair page {page_num}: {e}")
        return False

async def check_and_repair_manga(client: httpx.AsyncClient, manga: dict):
    title = manga['title']
    manga_id = manga['manga_id']
    total_pages_db = manga['total_pages']
    download_path = manga['download_path']

    print(f"\nChecking '{title}' (ID: {manga_id})...")

    if not os.path.isdir(download_path):
        print(f"  Directory not found: {download_path}. Cannot check files.")
        return

    existing_pages: Set[int] = set()
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    for f in os.listdir(download_path):
        if f.lower().endswith(valid_extensions):
            page_num_str = os.path.splitext(f)[0]
            if page_num_str.isdigit():
                existing_pages.add(int(page_num_str))

    expected_pages = set(range(1, total_pages_db + 1))
    missing_pages = sorted(list(expected_pages - existing_pages))

    if not missing_pages:
        print(f"  Complete. All {total_pages_db} pages found.")
        return

    print(f"  Missing {len(missing_pages)} page(s): {missing_pages}")
    print("  Attempting to repair...")

    all_page_urls, _ = await fetch_manga_images(str(manga_id))

    if not all_page_urls:
        print(f"  Could not fetch image URLs for manga ID {manga_id}. Cannot repair.")
        return

    tasks = []
    for page_num in missing_pages:
        img_url = all_page_urls.get(page_num)
        if img_url:
            tasks.append(download_missing_page(client, page_num, img_url, download_path))
        else:
            print(f"  Could not find URL for missing page {page_num}.")
    
    if tasks:
        await asyncio.gather(*tasks)
    
    print(f"  Repair attempt finished for '{title}'.")


async def main():
    print("--- Manga Library Repair Tool ---")
    
    mangas_to_check = get_all_mangas_for_repair()
    if not mangas_to_check:
        print("No mangas found in the database to check.")
        return

    print(f"Found {len(mangas_to_check)} mangas in the database. Starting scan...")

    async with httpx.AsyncClient(follow_redirects=True, verify=False) as client:
        for manga in mangas_to_check:
            await check_and_repair_manga(client, manga)

    print("\n✅ Repair process complete.")

if __name__ == "__main__":
    asyncio.run(main())