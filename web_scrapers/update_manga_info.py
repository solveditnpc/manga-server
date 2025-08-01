import asyncio
from bs4 import BeautifulSoup
import re
from datetime import datetime
from typing import Any

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

import database

async def fetch_and_store_manga_details(manga_id: int):
    if database.manga_exists(manga_id):
        print(f"Manga ID {manga_id} is already in the database. Skipping.")
        return

    print(f"Manga ID {manga_id} not found in database. Starting scrape...")
    gallery_url = f"https://nhentai.xxx/g/{manga_id}/"
    html_content = None

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            print(f"Navigating to page: {gallery_url}")
            await page.goto(gallery_url, timeout=60000)

            print("Waiting for page content to render (waiting for '.info' class)...")
            await page.wait_for_selector(".info", timeout=30000)

            print("Content rendered. Extracting HTML.")
            html_content = await page.content()

        except PlaywrightTimeoutError:
            print("\n---")
            print("❌ Timeout Error: The expected content did not load in time.")
            print("This is likely due to a CAPTCHA page or an unknown page layout.")

            screenshot_path = "/data/debug_screenshot.png"
            html_path = "/data/debug_page.html"

            print(f"Saving a screenshot to {screenshot_path} for debugging...")
            await page.screenshot(path=screenshot_path, full_page=True)

            print(f"Saving the page's final HTML to {html_path}...")
            final_html = await page.content()
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(final_html)

            print("\nACTION REQUIRED: Please check the 'debug_screenshot.png' and 'debug_page.html' files")
            print("in your project's 'mangas' folder to see what the browser is stuck on.")
            print("---\n")
            await browser.close()
            return

        except Exception as e:
            print(f"An unexpected error occurred during browser navigation: {e}")
            await browser.close()
            return

        await browser.close()

    try:
        print("Parsing HTML content with BeautifulSoup...")
        soup = BeautifulSoup(html_content, 'html.parser')

        info_div = soup.find('div', class_='info')
        
        if not info_div:
            print(f"Error: Could not find the main info block for manga {manga_id} after rendering.")
            return

        title_element = info_div.find('h1')
        title = title_element.text.strip() if title_element else "N/A"
        print(f"Found Title: {title}")

        tags_data = {}
        author = None
        for li_tag in info_div.find_all('li', class_='tags'):
            category_span = li_tag.find('span', class_='text')
            if not category_span: continue
            
            category_name = category_span.text.strip().lower().replace(':', '')

            if category_name in ['parodies', 'characters', 'tags', 'artists', 'groups', 'languages', 'category']:
                tag_list = [tag.find('span', class_='tag_name').text for tag in li_tag.find_all('a', class_='tag_btn')]
                if tag_list:
                    db_category_name = 'categories' if category_name == 'category' else category_name
                    tags_data[db_category_name] = tag_list
                    print(f"Found Category '{db_category_name}': {', '.join(tag_list)}")
                    if db_category_name == 'artists' and not author:
                        author = tag_list[0]
                        print(f"Identified Author: {author}")

        total_pages = 0
        pages_li = info_div.find('span', class_='text', string=re.compile(r'Pages:', re.I))
        if pages_li:
            pages_span = pages_li.find_next_sibling('span', class_='tags')
            if pages_span:
                pages_text = pages_span.text.strip()
                page_match = re.search(r'\d+', pages_text)
                if page_match:
                    total_pages = int(page_match.group())
                    print(f"Found Total Pages: {total_pages}")

        upload_date_str = "N/A"
        upload_li = info_div.find('span', class_='text', string=re.compile(r'Uploaded:', re.I))
        if upload_li:
            time_span = upload_li.find_next_sibling('span', class_='tags')
            if time_span:
                upload_date_str = time_span.text.strip()
                print(f"Found Upload Date: {upload_date_str} (Note: exact timestamp not available in this layout)")


        print("Assembling data for database entry...")
        manga_data = {
            'manga_id': manga_id,
            'title': title,
            'url': gallery_url,
            'author': author,
            'total_pages': total_pages,
            'upload_date': upload_date_str,
            'tags': tags_data,
            'download_path': None, 
        }

        print(f"Calling database.add_manga for manga ID {manga_id}...")
        database.add_manga(manga_data)

    except Exception as e:
        print(f"An unexpected error occurred while parsing manga ID {manga_id}: {e}")


async def main():
    print("Initializing database connection...")
    database.init_db()
    
    try:
        manga_id_input = input("Enter the manga ID to fetch and store: ").strip()
        if manga_id_input.isdigit():
            await fetch_and_store_manga_details(int(manga_id_input))
        else:
            print("Invalid input. Please enter a numerical ID.")
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        print(f"A critical error occurred: {e}")

if __name__ == '__main__':
    asyncio.run(main())