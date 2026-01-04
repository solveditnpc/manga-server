import sqlite3
import os
import time
from datetime import datetime
from typing import Optional

DB_PATH = "/database/manga_database.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=DELETE;')
    conn.execute('PRAGMA busy_timeout = 5000;')
    return conn

def init_db():
    if os.path.exists(DB_PATH):
        print("Database already exists. Checking schema...")
    else:
        print("Creating new database...")
    
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mangas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manga_id INTEGER UNIQUE NOT NULL,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        author TEXT,
        total_pages INTEGER,
        upload_date TEXT,
        download_path TEXT,
        download_timestamp TEXT NOT NULL,
        like_count INTEGER DEFAULT 0
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        UNIQUE(name, type)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS manga_tags (
        manga_auto_id INTEGER,
        tag_id INTEGER,
        FOREIGN KEY (manga_auto_id) REFERENCES mangas (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id),
        PRIMARY KEY (manga_auto_id, tag_id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS S_mangas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manga_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        url TEXT,
        author TEXT,
        source TEXT,
        chapter_count INTEGER,
        download_path TEXT,
        last_synced TEXT,
        like_count INTEGER DEFAULT 0
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS S_manga_tags (
        s_manga_id INTEGER,
        tag_id INTEGER,
        FOREIGN KEY (s_manga_id) REFERENCES S_mangas (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id),
        PRIMARY KEY (s_manga_id, tag_id)
    )
    ''')

    try:
        cursor.execute("PRAGMA table_info(mangas)")
        cols = [i['name'] for i in cursor.fetchall()]
        if 'like_count' not in cols:
            cursor.execute("ALTER TABLE mangas ADD COLUMN like_count INTEGER DEFAULT 0")
            
        cursor.execute("PRAGMA table_info(S_mangas)")
        s_cols = [i['name'] for i in cursor.fetchall()]
        if 'like_count' not in s_cols:
            cursor.execute("ALTER TABLE S_mangas ADD COLUMN like_count INTEGER DEFAULT 0")
    except Exception as e:
        print(f"Migration check failed: {e}")

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def S_manga_exists(manga_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM S_mangas WHERE manga_id = ?", (str(manga_id),))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists

def add_S_manga(meta: dict, path: str, chapter_count: int, tags_list: list):
    """
    Inserts or Updates a Suwayomi manga in the S_mangas table.
    Uses UPSERT to preserve 'like_count'.
    """
    m_id = str(meta['id'])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO S_mangas (manga_id, title, url, author, source, chapter_count, download_path, last_synced, like_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        ON CONFLICT(manga_id) DO UPDATE SET
            title=excluded.title,
            url=excluded.url,
            author=excluded.author,
            source=excluded.source,
            chapter_count=excluded.chapter_count,
            download_path=excluded.download_path,
            last_synced=excluded.last_synced
            -- Notice we do NOT update like_count here, so it stays as it was
        ''', (
            m_id,
            meta['title'],
            meta.get('url'),
            meta.get('author'),
            meta.get('source'),
            chapter_count,
            path,
            datetime.now().isoformat()
        ))
        
        cursor.execute("SELECT id FROM S_mangas WHERE manga_id = ?", (m_id,))
        s_manga_pk = cursor.fetchone()['id']

        if tags_list:
            cursor.execute("DELETE FROM S_manga_tags WHERE s_manga_id = ?", (s_manga_pk,))
            for tag_name in tags_list:
                clean_tag = tag_name.strip()
                if not clean_tag: continue
                
                cursor.execute("SELECT id FROM tags WHERE name = ? AND type = 'suwayomi'", (clean_tag,))
                tag_row = cursor.fetchone()
                
                if tag_row:
                    tag_id = tag_row['id']
                else:
                    cursor.execute("INSERT INTO tags (name, type) VALUES (?, 'suwayomi')", (clean_tag,))
                    tag_id = cursor.lastrowid
                
                cursor.execute("INSERT OR IGNORE INTO S_manga_tags (s_manga_id, tag_id) VALUES (?, ?)", (s_manga_pk, tag_id))

        conn.commit()
        print(f"[Sync] Saved: {meta['title']} ({chapter_count} ch) -> {m_id}")
        
    except Exception as e:
        print(f"[Sync Error] Failed to save {m_id}: {e}")
        conn.rollback()
    finally:
        conn.close()

def manga_exists(manga_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM mangas WHERE manga_id = ?", (manga_id,))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists

def add_manga(manga_data: dict):
    if manga_exists(manga_data['manga_id']):
        print(f"Manga ID {manga_data['manga_id']} already in database. Skipping.")
        return

    max_retries = 5
    for attempt in range(max_retries):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
            INSERT INTO mangas (manga_id, title, url, author, total_pages, upload_date, download_path, download_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                manga_data['manga_id'],
                manga_data['title'],
                manga_data['url'],
                manga_data.get('author'),
                manga_data.get('total_pages'),
                manga_data.get('upload_date'),
                manga_data.get('download_path'),
                datetime.now().isoformat()
            ))
            manga_auto_id = cursor.lastrowid

            for tag_type, tag_list in manga_data.get('tags', {}).items():
                for tag_name in tag_list:
                    cursor.execute("SELECT id FROM tags WHERE name = ? AND type = ?", (tag_name, tag_type))
                    tag_row = cursor.fetchone()
                    if tag_row:
                        tag_id = tag_row['id']
                    else:
                        cursor.execute("INSERT INTO tags (name, type) VALUES (?, ?)", (tag_name, tag_type))
                        tag_id = cursor.lastrowid
                    
                    cursor.execute("INSERT INTO manga_tags (manga_auto_id, tag_id) VALUES (?, ?)", (manga_auto_id, tag_id))
            
            conn.commit()
            print(f"Successfully added manga ID {manga_data['manga_id']} to the database.")
            return
        except sqlite3.OperationalError as e:
            print(f"Database locked, retrying add_manga for {manga_data['manga_id']} (attempt {attempt + 1}/{max_retries}): {e}")
            conn.rollback()
            time.sleep(0.5 * (2**attempt))
        except sqlite3.IntegrityError as e:
            print(f"Database integrity error for manga ID {manga_data['manga_id']}: {e}")
            conn.rollback()
            break
        except Exception as e:
            print(f"An error occurred while adding manga ID {manga_data['manga_id']}: {e}")
            conn.rollback()
            break
        finally:
            if conn:
                conn.close()
    print(f"Failed to add manga ID {manga_data['manga_id']} after {max_retries} retries.")

def delete_manga_by_id(manga_id: int) -> dict:
    max_retries = 5
    for attempt in range(max_retries):
        conn = get_db_connection()
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT id, title, download_path FROM mangas WHERE manga_id = ?", (manga_id,))
            manga_record = cursor.fetchone()

            if not manga_record:
                conn.close()
                return None

            manga_info = {
                "title": manga_record["title"],
                "download_path": manga_record["download_path"]
            }
            manga_auto_id = manga_record["id"]

            cursor.execute("DELETE FROM manga_tags WHERE manga_auto_id = ?", (manga_auto_id,))
            
            cursor.execute("DELETE FROM mangas WHERE id = ?", (manga_auto_id,))
            
            conn.commit()
            print(f"Successfully deleted database entries for manga ID {manga_id}.")
            return manga_info
        except sqlite3.OperationalError as e:
            print(f"Database locked, retrying delete_manga_by_id for {manga_id} (attempt {attempt + 1}/{max_retries}): {e}")
            conn.rollback()
            time.sleep(0.5 * (2**attempt))
        except Exception as e:
            print(f"Failed to delete manga ID {manga_id} from database: {e}")
            conn.rollback()
            return None
        finally:
            if conn:
                conn.close()
    print(f"Failed to delete manga ID {manga_id} after {max_retries} retries.")
    return None

def update_manga_download_path(manga_id: int, download_path: str):
    if not download_path:
        print(f"No download path provided for manga ID {manga_id}. Skipping update.")
        return

    max_retries = 5
    for attempt in range(max_retries):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
            UPDATE mangas
            SET download_path = ?
            WHERE manga_id = ?
            ''', (download_path, manga_id))
            conn.commit()
            print(f"Successfully updated download path for manga ID {manga_id} to: {download_path}")
            return
        except sqlite3.OperationalError as e:
            print(f"Database locked, retrying update_manga_download_path for {manga_id} (attempt {attempt + 1}/{max_retries}): {e}")
            conn.rollback()
            time.sleep(0.5 * (2**attempt))
        except Exception as e:
            print(f"An error occurred while updating download path for manga ID {manga_id}: {e}")
            conn.rollback()
            break
        finally:
            if conn:
                conn.close()
    print(f"Failed to update download path for manga ID {manga_id} after {max_retries} retries.")

def get_all_mangas_with_tags() -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT
        m.manga_id,
        m.title,
        m.author,
        m.total_pages,
        m.download_path,
        GROUP_CONCAT(t.name, ', ') AS tags
    FROM mangas AS m
    LEFT JOIN manga_tags AS mt ON m.id = mt.manga_auto_id
    LEFT JOIN tags AS t ON mt.tag_id = t.id
    WHERE m.download_path IS NOT NULL
    GROUP BY m.id
    ORDER BY m.download_timestamp DESC
    """
    
    cursor.execute(query)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mangas

def get_all_mangas_for_repair() -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT manga_id, url, title, total_pages, download_path FROM mangas WHERE download_path IS NOT NULL"
    cursor.execute(query)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mangas
def get_manga_page_count(manga_id: int) -> Optional[int]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT total_pages FROM mangas WHERE manga_id = ?", (manga_id,))
    result = cursor.fetchone()
    conn.close()
    return result['total_pages'] if result else None

def get_manga_author(manga_id: int) -> Optional[str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT author FROM mangas WHERE manga_id = ?", (manga_id,))
    result = cursor.fetchone()
    conn.close()
    return result['author'] if result and result['author'] else None