import re
import os
import asyncio
import traceback
import httpx
import img2pdf
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple, Set, Optional
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError


@dataclass
class ImagePattern:
    pattern: str
    base_dir: str

@dataclass
class VerificationResult:
    page_num: int
    url: Optional[str]
    server: Optional[str]
    extension: Optional[str]

def extract_manga_id(url: str) -> str:
    match = re.search(r'/g/(\d+)/?', url)
    if match:
        return match.group(1)
    
    parts = url.rstrip('/').split('/')
    for part in reversed(parts):
        if part.isdigit():
            return part
    
    raise ValueError(f"Could not extract manga ID from URL: {url}")

def get_default_downloads_dir() -> str:
    return '/data'

def safe_format_filename(name: str) -> str:
    if not name:
        return ''
    
    sanitized_name = re.sub(r'[<>:"/\\|?*]', '', name).strip()
    return sanitized_name[:230]

def calculate_optimal_concurrency(total_pages: int) -> int:
    if total_pages <= 25:
        return 3
        
    cpu_count = os.cpu_count() or 4
    base_concurrency = min(cpu_count * 2, 10)
    
    if total_pages <= 50:
        return min(5, base_concurrency)
    elif total_pages <= 100:
        return min(7, base_concurrency)
    else:
        return base_concurrency

def calculate_optimal_concurrency_verification(total_urls: int) -> int:
    if total_urls <= 50:
        return 5
        
    cpu_count = os.cpu_count() or 4
    base_concurrency = min(cpu_count * 4, 20)
    
    if total_urls <= 100:
        return min(10, base_concurrency)
    elif total_urls <= 200:
        return min(15, base_concurrency)
    else:
        return base_concurrency

async def verify_image_url(
    client: httpx.AsyncClient,
    page_num: int,
    pattern: ImagePattern,
    server: str,
    headers: Dict[str, str],
    semaphore: asyncio.Semaphore
) -> VerificationResult:
    async with semaphore:
        img_headers = headers.copy()
        img_headers['Host'] = f'{server}.nhentaimg.com'
        
        for ext in ['.jpg', '.png', '.webp']:
            test_urls = [
                f"https://{server}.nhentaimg.com/galleries/{pattern.pattern}/{page_num}{ext}",
                f"https://{server}.nhentaimg.com/{pattern.pattern}/{page_num}{ext}",
            ]
            
            for test_url in test_urls:
                try:
                    response = await client.head(test_url, headers=img_headers)
                    if response.status_code == 200:
                        return VerificationResult(page_num, test_url, server, ext)
                except Exception:
                    continue
    
    return VerificationResult(page_num, None, None, None)

async def fetch_manga_images(manga_id: str) -> Tuple[Dict[int, str], List[int]]:
    html_content = None
    gallery_url = f"https://nhentai.xxx/g/{manga_id}/"
    print(f"Fetching gallery page with Playwright: {gallery_url}")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            await page.goto(gallery_url, timeout=60000)
            await page.wait_for_selector("#thumbnail-container, .gallery_thumbs", timeout=30000)
            html_content = await page.content()
            await browser.close()
    except PlaywrightTimeoutError:
        print(f"❌ Timeout Error: Could not load the gallery page for manga {manga_id}. It might be a CAPTCHA.")
        return {}, []
    except Exception as e:
        print(f"An error occurred with Playwright while fetching the gallery page: {e}")
        return {}, []

    headers = {
        'Accept': 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Host': 'i4.nhentaimg.com',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133',
        'X-Firefox-Spdy': 'h2'
    }
    
    limits = httpx.Limits(max_keepalive_connections=10, max_connections=20)
    timeout = httpx.Timeout(10.0, connect=5.0)
    transport = httpx.AsyncHTTPTransport(retries=3)
    
    async with httpx.AsyncClient(
        limits=limits,
        timeout=timeout,
        transport=transport,
        follow_redirects=True,
        verify=False,
        http2=True
    ) as client:
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            print("\nLooking for thumbnails...")
            main_gallery_div = soup.find('div', id='thumbnail-container') or soup.find('div', class_='gallery_thumbs')
            if not main_gallery_div:
                 main_gallery_div = soup

            thumbs = main_gallery_div.find_all('img', class_='lazy')
            
            unique_patterns = {}
            for thumb in thumbs:
                if 'data-src' in thumb.attrs:
                    src = thumb['data-src']
                    print(f"Found thumbnail: {src}")
                    
                    match = re.search(r'nhentaimg\.com/(?:galleries/)?(\d+/[a-zA-Z0-9]+)/', src)
                    if match:
                        pattern_str = match.group(1)
                        base_dir = pattern_str.split('/')[0]
                        if pattern_str not in unique_patterns:
                             unique_patterns[pattern_str] = base_dir
                             print(f"Found unique pattern: {pattern_str}")

            for pattern_str, base_dir in unique_patterns.items():
                print(f"\nVerifying with pattern: {pattern_str}")
                current_pattern = ImagePattern(pattern_str, base_dir)
                image_urls = {}
                working_server = None

                max_concurrent = calculate_optimal_concurrency_verification(len(['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7']))
                semaphore = asyncio.Semaphore(max_concurrent)
                
                verification_tasks = [
                    verify_image_url(client, 1, current_pattern, server, headers, semaphore)
                    for server in ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7']
                ]
                
                results = await asyncio.gather(*verification_tasks)
                
                for result in results:
                    if result.url:
                        working_server = result.server
                        print(f"Found working server for this pattern: {working_server}")
                        break
                
                if working_server:
                    page = 1
                    consecutive_failures = 0
                    while consecutive_failures < 5:
                        result = await verify_image_url(client, page, current_pattern, working_server, headers, semaphore)
                        if result.url:
                            image_urls[page] = result.url
                            print(f"Verified page {page} with extension {result.extension}")
                            consecutive_failures = 0
                        else:
                            consecutive_failures += 1
                            print(f"Could not verify page {page} (Consecutive failures: {consecutive_failures})")
                        
                        page += 1
                    
                    if image_urls:
                        print(f"\nSuccessfully verified {len(image_urls)} images with pattern {pattern_str}.")
                        return image_urls, []
                else:
                    print(f"Pattern {pattern_str} did not yield a working server. Trying next pattern...")
            
            raise ValueError("Could not find a working image pattern from any thumbnails.")
            
        except Exception as e:
            print(f"Error in fetch_manga_images: {e}")
            traceback.print_exc()
            return {}, []


def convert_to_pdf(manga_dir: str, downloaded_files: List[str]) -> None:
    try:
        image_files = sorted(downloaded_files)
        
        if not image_files:
            print(f"No images found in {manga_dir} to convert to PDF")
            return
            
        pdf_name = os.path.basename(manga_dir) + '.pdf'
        pdf_path = os.path.join(manga_dir, pdf_name)
        
        # Create temporary files for RGB images
        rgb_images = []
        temp_files = []
        
        for img_path in image_files:
            with Image.open(img_path) as img:
                # Convert to RGB if image has alpha channel
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGB')
                    # Save to temporary file
                    temp_path = img_path + '_temp.jpg'
                    img.save(temp_path, 'JPEG', quality=95)
                    temp_files.append(temp_path)
                    rgb_images.append(temp_path)
                else:
                    rgb_images.append(img_path)
        
        # Convert to PDF
        with open(pdf_path, "wb") as f:
            f.write(img2pdf.convert(rgb_images))
            
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass
            
        print(f"Successfully created PDF: {pdf_path}")
        
    except Exception as e:
        print(f"Error creating PDF: {str(e)}")
        traceback.print_exc()

async def download_image(
    client: httpx.AsyncClient,
    page_num: int,
    img_url: str,
    manga_dir: str,
    headers: Dict[str, str],
    semaphore: asyncio.Semaphore,
    downloaded_files: Set[str],
    failed_pages: Set[int],
    total_pages: int
) -> None:
    """Download a single image with semaphore control, skipping existing files."""
    # --- NEW: Construct filepath first to check if it exists ---
    ext = os.path.splitext(img_url)[1]
    if not ext:
        ext = '.webp' # Fallback extension
    filename = f"{page_num:03d}{ext}"
    filepath = os.path.join(manga_dir, filename)

    # --- NEW: Check if the file already exists ---
    if os.path.exists(filepath):
        print(f"Skipping page {page_num}/{total_pages} (already exists)")
        downloaded_files.add(filepath)
        return

    async with semaphore:
        try:
            img_headers = headers.copy()
            img_headers['Host'] = img_url.split('/')[2]
            
            response = await client.get(img_url, headers=img_headers)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            downloaded_files.add(filepath)
            print(f"Downloaded page {page_num}/{total_pages}")
            
        except Exception as e:
            print(f"Failed to download page {page_num}: {e}")
            failed_pages.add(page_num)

async def download_manga(url: str, download_dir: Optional[str] = None, create_pdf: bool = True) -> Tuple[str, List[int]]:
    manga_id = extract_manga_id(url)
    base_dir = download_dir if download_dir else '/data'
    os.makedirs(base_dir, exist_ok=True)
    
    manga_name = "unknown_manga"
    html_content_for_title = None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            await page.goto(url, timeout=60000)
            await page.wait_for_selector("h1, h2.title", timeout=30000)
            html_content_for_title = await page.content()
            await browser.close()
    except Exception as e:
        print(f"Warning: Could not fetch manga title with Playwright. Using ID. Error: {e}")

    if html_content_for_title:
        soup = BeautifulSoup(html_content_for_title, 'html.parser')
        title_element = None
        selectors = [
            'div#info > h1',
            'div#info h1',
            'h1',
            'div.title',
            'h2.title'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                print(f"Found element with selector '{selector}': {element.text.strip()}")
                if not title_element:
                    title_element = element
        
        if title_element:
            manga_name = safe_format_filename(title_element.text.strip())
        else:
            print("Warning: Could not find manga title from rendered page.")
    
    print(f"Using manga title: {manga_name}")
    manga_dir = os.path.join(base_dir, f"{manga_id}_{manga_name}")
    print(f"Creating directory: {manga_dir}")
    os.makedirs(manga_dir, exist_ok=True)
    
    print(f"Starting verification and download for manga {manga_id}...")
    image_urls, _ = await fetch_manga_images(manga_id)
    
    if not image_urls:
        print("No images found to download")
        return manga_dir, []
    
    total_pages = len(image_urls)
    max_concurrent = calculate_optimal_concurrency(total_pages)
    print(f"\nDownloading {total_pages} images with {max_concurrent} concurrent downloads...")
    
    headers = {
        'Accept': 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133',
        'X-Firefox-Spdy': 'h2'
    }
    
    downloaded_files: Set[str] = set()
    failed_pages: Set[int] = set()
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        verify=False,
        http2=True
    ) as client:
        tasks = []
        for page_num, img_url in sorted(image_urls.items()):
            task = download_image(
                client,
                page_num,
                img_url,
                manga_dir,
                headers,
                semaphore,
                downloaded_files,
                failed_pages,
                total_pages
            )
            tasks.append(task)
        
        await asyncio.gather(*tasks)
    
    if downloaded_files:
        print(f"\nDownload completed! Files saved in: {manga_dir}")
        if create_pdf:
            convert_to_pdf(manga_dir, list(sorted(downloaded_files)))
        if failed_pages:
            print(f"Failed to download pages: {sorted(failed_pages)}")
    else:
        print("Failed to download any images")
    
    return manga_dir, list(sorted(failed_pages))

def is_valid_nhentai_xxx_url(url: str) -> bool:
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    return 'nhentai.xxx/g/' in url

async def main():
    try:
        file_path = input("Enter the path to your manga links file (or press Enter to use constants.txt): ").strip()
        
        if not file_path:
            file_path = 'constants.txt'
            print(f"Using default file: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"Error: File '{file_path}' not found.")
            return
            
        default_downloads = get_default_downloads_dir()
        download_dir = input(f"Enter the download directory (or press Enter to use {default_downloads}): ").strip()
        
        if not download_dir:
            download_dir = default_downloads
            print(f"Using default downloads directory: {download_dir}")
        
        os.makedirs(download_dir, exist_ok=True)
            
        with open(file_path, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        if not urls:
            print(f"No URLs found in {file_path}")
            return
        
        for url in urls:
            if 'https://' not in url and 'http://' not in url:
                continue
                
            if not is_valid_nhentai_xxx_url(url):
                print(f"Skipping invalid URL (not from nhentai.xxx): {url}")
                continue
            
            try:
                await download_manga(url, download_dir)
                print(f"Successfully downloaded manga from: {url}")
            except Exception as e:
                print(f"Error downloading manga from {url}: {str(e)}")
                traceback.print_exc()
    except Exception as e:
        print(f"Error reading constants.txt: {str(e)}")
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
