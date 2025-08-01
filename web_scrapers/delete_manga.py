import os
import shutil
from database import delete_manga_by_id, init_db

def main():
    init_db()
    
    print("\n--- Manga Deletion Utility ---")
    print("Enter the manga ID (number from the URL) to delete.")
    print("Type 'exit' or 'quit' to close.")

    while True:
        user_input = input("\nManga ID to delete: ").strip().lower()

        if user_input in ['exit', 'quit']:
            print("Exiting utility.")
            break

        if not user_input.isdigit():
            print("Invalid input. Please enter a numeric manga ID.")
            continue

        manga_id = int(user_input)
        manga_info = delete_manga_by_id(manga_id)

        if not manga_info:
            print(f"No manga with ID {manga_id} found in the database.")
            continue
        title = manga_info.get("title")
        download_path = manga_info.get("download_path")

        print(f"\nFound: '{title}'")
        print(f"Path:  '{download_path}'")

        if download_path and os.path.exists(download_path):
            try:
                shutil.rmtree(download_path)
                print(f"Successfully deleted folder: {download_path}")
            except Exception as e:
                print(f"Error deleting folder {download_path}: {e}")
        else:
            print("No corresponding download folder found to delete.")

if __name__ == '__main__':
    main()