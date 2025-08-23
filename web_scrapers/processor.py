import os
import json
import asyncio
from typing import List, Dict, Any, Set

from manga_download import process_single_manga
from author_download import download_all
from database import init_db

QUEUE_FILE = '/database/queue.json'
POLL_INTERVAL = 30
MAX_CONCURRENT_DOWNLOADS = 5

def get_task_from_queue() -> Any:
    """Safely reads and removes a single task from the queue file."""
    if not os.path.exists(QUEUE_FILE):
        return None
    
    try:
        with open(QUEUE_FILE, 'r+') as f:
            try:
                queue_data: List[Dict[str, Any]] = json.load(f)
            except json.JSONDecodeError:
                f.seek(0)
                f.truncate()
                json.dump([], f)
                return None

            if not queue_data:
                return None

            task_to_process = queue_data.pop(0)
            f.seek(0)
            json.dump(queue_data, f, indent=4)
            f.truncate()
            return task_to_process
    except (IOError, FileNotFoundError):
        return None

async def process_queue():
    print("--- Processor Script Started ---")
    print(f"[*] Watching for tasks in: {QUEUE_FILE}")
    print(f"[*] Max concurrent downloads set to: {MAX_CONCURRENT_DOWNLOADS}")
    print(f"[*] Re-checking queue for new tasks every {POLL_INTERVAL} seconds.")

    print("[*] Initializing database...")
    init_db()
    print("[+] Database ready.")

    running_tasks: Set[asyncio.Task] = set()

    while True:
        try:
            while len(running_tasks) < MAX_CONCURRENT_DOWNLOADS:
                task_details = get_task_from_queue()
                if not task_details:
                    break

                print("\n" + "="*50)
                print(f"[*] Picked up new task: {task_details}")
                print("="*50 + "\n")

                task_type = task_details.get("type")
                task_value = task_details.get("value")
                coro = None

                if task_type == "id":
                    coro = process_single_manga(int(task_value))
                elif task_type == "author":
                    coro = download_all(str(task_value))
                else:
                    print(f"[!] Unknown task type '{task_type}'. Discarding task.")
                
                if coro:
                    task = asyncio.create_task(coro)
                    running_tasks.add(task)
                    print(f"[*] Started new task. Running: {len(running_tasks)}/{MAX_CONCURRENT_DOWNLOADS}")

            if not running_tasks:
                print(f"[*] Queue is empty and no tasks running. Waiting {POLL_INTERVAL} seconds...")
                await asyncio.sleep(POLL_INTERVAL)
                continue

            done, pending = await asyncio.wait(
                running_tasks, 
                return_when=asyncio.FIRST_COMPLETED,
                timeout=POLL_INTERVAL
            )
            
            if not done:
                print(f"[*] Timeout reached. Re-checking queue for new tasks...")
            
            for task in done:
                try:
                    task.result() 
                    print(f"[+] A task has finished successfully.")
                except Exception as e:
                    print(f"\n[!!!] A task failed with an exception: {e}\n")

            running_tasks = pending
            if running_tasks and done:
                print(f"[*] A slot has freed up. Running: {len(running_tasks)}/{MAX_CONCURRENT_DOWNLOADS}")

        except Exception as e:
            print(f"\n[!!!] A critical error occurred in the main processing loop: {e}")
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