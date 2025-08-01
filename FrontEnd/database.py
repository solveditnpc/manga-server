import sqlite3
import os
from datetime import datetime

DB_PATH = "/database/manga_database.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=WAL;')
    conn.execute('PRAGMA busy_timeout = 5000;')
    return conn

def init_db():
    if os.path.exists(DB_PATH):
        print("Database already exists.")
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
        download_timestamp TEXT NOT NULL
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

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

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

    except sqlite3.IntegrityError as e:
        print(f"Database integrity error for manga ID {manga_data['manga_id']}: {e}")
        conn.rollback()
    except Exception as e:
        print(f"An error occurred while adding manga ID {manga_data['manga_id']}: {e}")
        conn.rollback()
    finally:
        conn.close()

def delete_manga_by_id(manga_id: int) -> dict:
    conn = get_db_connection()
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
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

    try:
        cursor.execute("DELETE FROM manga_tags WHERE manga_auto_id = ?", (manga_auto_id,))
        
        cursor.execute("DELETE FROM mangas WHERE id = ?", (manga_auto_id,))
        
        conn.commit()
        print(f"Successfully deleted database entries for manga ID {manga_id}.")
        return manga_info
    except Exception as e:
        print(f"Failed to delete manga ID {manga_id} from database: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def update_manga_download_path(manga_id: int, download_path: str):
    if not download_path:
        print(f"No download path provided for manga ID {manga_id}. Skipping update.")
        return

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
    except Exception as e:
        print(f"An error occurred while updating download path for manga ID {manga_id}: {e}")
        conn.rollback()
    finally:
        conn.close()

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
        (
            SELECT json_group_array(json_object('type', t.type, 'name', t.name))
            FROM manga_tags mt
            JOIN tags t ON mt.tag_id = t.id
            WHERE mt.manga_auto_id = m.id
        ) AS tags
    FROM mangas AS m
    WHERE m.download_path IS NOT NULL
    ORDER BY m.download_timestamp DESC
    """
    
    cursor.execute(query)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mangas

def search_mangas_by_query(search_terms: list) -> list:
    if not search_terms:
        return []

    conn = get_db_connection()
    cursor = conn.cursor()

    base_search_query = """
    SELECT id FROM mangas WHERE title LIKE ? OR author LIKE ? OR CAST(manga_id AS TEXT) LIKE ?
    UNION
    SELECT manga_auto_id FROM manga_tags
    JOIN tags ON manga_tags.tag_id = tags.id
    WHERE tags.name LIKE ?
    """

    intersect_query = " INTERSECT ".join([base_search_query] * len(search_terms))

    params = []
    for term in search_terms:
        like_term = f'%{term}%'
        params.extend([like_term, like_term, like_term, like_term])

    final_query = f"""
    SELECT
        m.manga_id,
        m.title,
        m.author,
        m.total_pages,
        m.download_path,
        (
            SELECT json_group_array(json_object('type', t.type, 'name', t.name))
            FROM manga_tags mt JOIN tags t ON mt.tag_id = t.id
            WHERE mt.manga_auto_id = m.id
        ) AS tags
    FROM mangas AS m
    WHERE m.download_path IS NOT NULL AND m.id IN ({intersect_query})
    ORDER BY m.download_timestamp DESC
    """
    
    cursor.execute(final_query, params)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mangas