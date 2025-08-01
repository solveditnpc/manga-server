import re
import os
import asyncio
import httpx
import shutil
from bs4 import BeautifulSoup
from typing import List, Optional

from parallel_download import download_manga
from update_manga_info import fetch_and_store_manga_details
from database import init_db, update_manga_download_path


async def get_total_pages(client: httpx.AsyncClient, base_url: str, headers: dict) -> int:
    response = await client.get(base_url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    
    last_page = 1
    pagination = soup.find('div', class_='pagination')
    if pagination:
        page_links = pagination.find_all('a', class_='page')
        if page_links:
            try:
                last_page = max(int(link.text) for link in page_links if link.text.isdigit())
            except ValueError:
                pass
    return last_page

async def search_author(author_name: str) -> List[tuple[str, int]]:
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Host': 'nhentai.xxx',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Sec-GPC': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133',
        'Upgrade-Insecure-Requests': '1'
    }
    
    async with httpx.AsyncClient(verify=False, follow_redirects=True) as client:
        manga_links = []
        current_page = 1
        continue_search = True
        
        while continue_search:
            if current_page == 1:
                page_url = f'https://nhentai.xxx/search/?key={author_name}'
            else:
                page_url = f'https://nhentai.xxx/search/?key={author_name}&page={current_page}'
            
            print(f"\nScanning page {current_page}...")
            print(f"URL: {page_url}")
            
            try:
                response = await client.get(page_url, headers=headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                galleries = soup.find_all('div', class_='gallery_item')
                found_manga_on_page = False
                
                for gallery in galleries:
                    link = gallery.find('a')
                    if link and 'href' in link.attrs:
                        manga_url = f'https://nhentai.xxx{link["href"]}'
                        if not any(url for url, _ in manga_links if url == manga_url):
                            manga_links.append((manga_url, current_page))
                            print(f"Added manga: {manga_url}")
                            found_manga_on_page = True
                
                if not found_manga_on_page:
                    print("\nNo manga found on current page, stopping search")
                    continue_search = False
                    continue

                pagination = None
                pagination_div = soup.find('div', class_='pagination')
                if pagination_div:
                    pagination = pagination_div
                
                if not pagination:
                    all_links = soup.find_all('a')
                    page_links = [a for a in all_links if a.text.isdigit()]
                    if page_links:
                        pagination = page_links

                if not pagination:
                    next_links = [a for a in soup.find_all('a') if '>' in a.text or 'next' in a.text.lower()]
                    if next_links:
                        pagination = next_links

                print(f"\nPagination detection result: {'Found' if pagination else 'Not found'}")
                
                if pagination:
                    all_numbers = []
                    if isinstance(pagination, list):
                        all_numbers = [int(a.text) for a in pagination if a.text.isdigit()]
                    else:
                        all_numbers = [int(a.text) for a in pagination.find_all('a') if a.text.isdigit()]
                    
                    next_page = current_page + 1
                    
                    next_url = f'https://nhentai.xxx/search/?key={author_name}&page={next_page}'
                    try:
                        test_response = await client.head(next_url, headers=headers)
                        if test_response.status_code == 200:
                            current_page = next_page
                            print(f"Moving to page {current_page}...")
                            await asyncio.sleep(1)
                            continue
                    except Exception as e:
                        print(f"Error testing next page: {str(e)}")
                
                print("\nNo more pages found")
                continue_search = False
                
            except Exception as e:
                print(f"Error fetching page {current_page}: {str(e)}")
                continue_search = False
        
        if not manga_links:
            print("No manga found across all pages")
        else:
            print(f"\nTotal manga found: {len(manga_links)} across {current_page} pages")
        
        return manga_links

async def get_page_manga_urls(page_url: str) -> List[str]:
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Host': 'nhentai.xxx',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Sec-GPC': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133',
        'Upgrade-Insecure-Requests': '1'
    }
    
    async with httpx.AsyncClient(verify=False, follow_redirects=True) as client:
        response = await client.get(page_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        manga_links = []
        
        for link in soup.find_all('a', href=re.compile(r'/g/\d+')):
            manga_url = f'https://nhentai.xxx{link["href"]}'
            if manga_url not in manga_links:
                manga_links.append(manga_url)
        
        return manga_links

async def download_all(author_name: str) -> str:
    print(f"\nStarting full download for author: {author_name}")

    safe_author_name = re.sub(r'[<>:"/\\|?*]', '', author_name).strip()[:255]
    download_dir = os.path.join('/data', safe_author_name)
    os.makedirs(download_dir, exist_ok=True)
    print(f"Manga will be saved in: {download_dir}")

    print(f"\nSearching for all manga by '{author_name}'. This may take a moment...")
    manga_data = await search_author(author_name)
    
    if not manga_data:
        message = f"No manga found for author: {author_name}"
        print(message)
        return message

    manga_to_download = [url for url, _ in manga_data]
    total_manga = len(manga_to_download)
    print(f"Found {total_manga} total manga to process.")

    try:
        for i, url in enumerate(manga_to_download, 1):
            try:
                print(f"\n--- Processing manga {i}/{total_manga}: {url} ---")

                match = re.search(r'/g/(\d+)', url)
                if not match:
                    print(f"Could not extract manga ID from {url}. Skipping.")
                    continue
                manga_id = int(match.group(1))

                print(f"Updating database for manga ID: {manga_id}...")
                await fetch_and_store_manga_details(manga_id)

                print(f"Starting image download for manga ID: {manga_id}...")
                downloaded_path, _ = await download_manga(url, download_dir, create_pdf=False)

                if downloaded_path:
                    print(f"Updating database with download path: {downloaded_path}")
                    update_manga_download_path(manga_id, downloaded_path)
                    print(f"Successfully processed and saved: {url}")
                else:
                    print(f"Download failed or was skipped for {url}.")

            except Exception as e:
                print(f"An error occurred while processing {url}: {str(e)}")
                print("Moving to the next manga...")
    
    except KeyboardInterrupt:
        print("\n\nOperation interrupted by user. Progress for completed manga has been saved.")
        return f"Download process for {author_name} was interrupted."

    print(f"\nAll processing complete for author: {author_name}!")
    return f"Download complete for {author_name}"

async def main():
    print("Initializing database...")
    init_db()
    print("Database ready.")

    print("\nWelcome to nhentai.xxx Manga Downloader!")
    print("1. Download manga by author name")
    print("2. Download manga from specific page")
    
    choice = input("Enter your choice (1 or 2): ").strip()
    
    download_dir = ''
    indexed_manga = []

    if choice == '1':
        author_name = input("Enter author name: ").strip()
        
        safe_author_name = re.sub(r'[<>:"/\\|?*]', '', author_name).strip()[:255]
        download_dir = os.path.join('/data', safe_author_name)
        
        print(f"\nDownloads will be saved to: {download_dir}")
        os.makedirs(download_dir, exist_ok=True)
        
        print(f"\nSearching for manga by {author_name}...")
        manga_data = await search_author(author_name)
        
        if not manga_data:
            print(f"No manga found for author: {author_name}")
            return
            
        print(f"\nFound {len(manga_data)} manga by {author_name} across multiple pages")
        
        manga_by_page = {}
        for url, page in manga_data:
            if page not in manga_by_page:
                manga_by_page[page] = []
            manga_by_page[page].append(url)
        
        print("\nManga found by page:")
        manga_index = 1
        for page in sorted(manga_by_page.keys()):
            print(f"\nPage {page}:")
            for url in manga_by_page[page]:
                print(f"{manga_index}. {url}")
                indexed_manga.append(url)
                manga_index += 1
        
    elif choice == '2':
        default_download_dir = '/data'
        download_dir_input = input(f"Enter download directory path (press Enter for default: {default_download_dir}): ").strip()
        
        download_dir = download_dir_input if download_dir_input else default_download_dir
        
        print(f"\nDownloads will be saved to: {download_dir}")
        os.makedirs(download_dir, exist_ok=True)

        page_url = input("Enter the nhentai.xxx page URL: ").strip()
        if not page_url.startswith('https://nhentai.xxx/'):
            print("Invalid URL. URL must be from nhentai.xxx")
            return
            
        print("\nFetching manga from the page...")
        manga_urls = await get_page_manga_urls(page_url)
        indexed_manga = manga_urls
        
        if not manga_urls:
            print("No manga found on the specified page")
            return
            
        print(f"\nFound {len(manga_urls)} manga on the page")
        print("\nManga URLs found:")
        for i, url in enumerate(manga_urls, 1):
            print(f"{i}. {url}")
        
    else:
        print("Invalid choice. Please enter 1 or 2.")
        return
    
    print("\nDo you want to:")
    print("1. Download all manga")
    print("2. Select specific manga to download")
    download_choice = input("Enter your choice (1 or 2): ").strip()
    
    manga_to_download = []
    if download_choice == '1':
        manga_to_download = indexed_manga
    elif download_choice == '2':
        print("\nEnter the numbers of the manga you want to download (comma-separated)")
        print("Example: 1,3,5 to download the 1st, 3rd, and 5th manga")
        selections = input("Numbers: ").strip()
        try:
            indices = [int(x.strip()) - 1 for x in selections.split(',')]
            for idx in indices:
                if 0 <= idx < len(indexed_manga):
                    manga_to_download.append(indexed_manga[idx])
        except ValueError:
            print("Invalid input. Please enter numbers separated by commas.")
            return
    else:
        print("Invalid choice. Please enter 1 or 2.")
        return
    
    if not manga_to_download:
        print("No manga selected for download.")
        return
    
    print(f"\nStarting processing... ({len(manga_to_download)} manga total)")
    try:
        for i, url in enumerate(manga_to_download, 1):
            try:
                print(f"\n--- Processing manga {i}/{len(manga_to_download)}: {url} ---")
                
                match = re.search(r'/g/(\d+)', url)
                if not match:
                    print(f"Could not extract manga ID from {url}. Skipping.")
                    continue
                manga_id = int(match.group(1))

                print(f"\nUpdating database for manga ID: {manga_id}...")
                await fetch_and_store_manga_details(manga_id)

                # Step 3: Call the function to download the manga images.
                print(f"\nStarting image download for manga ID: {manga_id}...")
                # Capture the returned download path
                downloaded_path, _ = await download_manga(url, download_dir, create_pdf=False)

                # --- NEW STEP ---
                # If the download was successful, update the database with the path
                if downloaded_path:
                    print(f"Updating database with download path: {downloaded_path}")
                    update_manga_download_path(manga_id, downloaded_path)
                
                print(f"\n--- Successfully processed: {url} ---")

            except Exception as e:
                print(f"Failed to process {url}: {str(e)}")
    except KeyboardInterrupt:
        print("\n\nOperation interrupted by user. Already processed manga are saved.")
        return
    
    print("\nAll processing completed!")
    
if __name__ == '__main__':
    asyncio.run(main())
