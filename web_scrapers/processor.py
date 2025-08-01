import os
import json
import asyncio
import time
from typing import List, Dict, Any

from manga_download import process_single_manga
from author_download import download_all
from database import init_db

QUEUE_FILE = '/database/queue.json'
POLL_INTERVAL = 30

async def process_queue():
    print("--- Processor Script Started ---")
    print(f"[*] Watching for tasks in: {QUEUE_FILE}")

    print("[*] Initializing database...")
    init_db()
    print("[+] Database ready.")

    while True:
        try:
            if not os.path.exists(QUEUE_FILE):
                print(f"[*] Queue file not found. Waiting {POLL_INTERVAL} seconds...")
                await asyncio.sleep(POLL_INTERVAL)
                continue

            with open(QUEUE_FILE, 'r+') as f:
                try:
                    queue_data: List[Dict[str, Any]] = json.load(f)
                except json.JSONDecodeError:
                    print("[!] Queue file is empty or corrupt. Clearing and waiting...")
                    f.seek(0)
                    f.truncate()
                    json.dump([], f)
                    await asyncio.sleep(POLL_INTERVAL)
                    continue

                if not queue_data:
                    print(f"[*] Queue is empty. Waiting {POLL_INTERVAL} seconds...")
                    await asyncio.sleep(POLL_INTERVAL)
                    continue

                task_to_process = queue_data.pop(0)

                f.seek(0)
                json.dump(queue_data, f, indent=4)
                f.truncate()
            
            print("\n" + "="*50)
            print(f"[*] Picked up new task: {task_to_process}")
            print("="*50 + "\n")

            task_type = task_to_process.get("type")
            task_value = task_to_process.get("value")

            if task_type == "id":
                print(f"--- Starting processing for Manga ID: {task_value} ---")
                await process_single_manga(int(task_value))
                print(f"--- Finished processing for Manga ID: {task_value} ---")

            elif task_type == "author":
                print(f"--- Starting download for Author: {task_value} ---")
                await download_all(str(task_value))
                print(f"--- Finished download for Author: {task_value} ---")
                
            else:
                print(f"[!] Unknown task type '{task_type}'. Discarding task.")

        except FileNotFoundError:
            print(f"[*] Queue file disappeared. Waiting {POLL_INTERVAL} seconds...")
            await asyncio.sleep(POLL_INTERVAL)

        except Exception as e:
            print(f"\n[!!!] A critical error occurred in the processing loop: {e}")
            print(f"[!!!] Waiting for {POLL_INTERVAL} seconds before retrying...")
            await asyncio.sleep(POLL_INTERVAL)


async def main():
    try:
        await process_queue()
    except KeyboardInterrupt:
        print("\n--- Processor Script Shutting Down ---")
    except Exception as e:
        print(f"A fatal, unhandled error occurred: {e}")

if __name__ == '__main__':
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    asyncio.run(main())