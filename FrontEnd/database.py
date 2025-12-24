import sqlite3
import os
from datetime import datetime

DB_PATH = "/database/manga_database.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    #conn.execute('PRAGMA journal_mode=WAL;')
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

    cursor.execute("PRAGMA table_info(mangas)")
    columns = [info['name'] for info in cursor.fetchall()]

    if 'like_count' not in columns:
        print("Migration: Adding missing 'like_count' column...")
        try:
            cursor.execute("ALTER TABLE mangas ADD COLUMN like_count INTEGER DEFAULT 0")
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")

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

def increment_like(manga_id: int) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE mangas SET like_count = like_count + 1 WHERE manga_id = ?", (manga_id,))
        conn.commit()
        
        cursor.execute("SELECT like_count FROM mangas WHERE manga_id = ?", (manga_id,))
        row = cursor.fetchone()
        return row['like_count'] if row else 0
    except Exception as e:
        print(f"Error incrementing like: {e}")
        return 0
    finally:
        conn.close()

def decrement_like(manga_id: int) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE mangas SET like_count = like_count - 1 WHERE manga_id = ? AND like_count > 0", (manga_id,))
        conn.commit()
        
        cursor.execute("SELECT like_count FROM mangas WHERE manga_id = ?", (manga_id,))
        row = cursor.fetchone()
        return row['like_count'] if row else 0
    except Exception as e:
        print(f"Error decrementing like: {e}")
        return 0
    finally:
        conn.close()

def get_mangas_paginated(page=1, limit=24, search_terms=None, sort_by='date'):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * limit
    
    if search_terms:
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
            
        where_clause = f"AND m.id IN ({intersect_query})"
    else:
        where_clause = ""
        params = []

    if sort_by == 'likes':
        order_clause = "ORDER BY m.like_count DESC, m.manga_id DESC"
    else:
        order_clause = "ORDER BY m.download_timestamp DESC"

    count_query = f"SELECT COUNT(*) FROM mangas m WHERE m.download_path IS NOT NULL {where_clause}"
    cursor.execute(count_query, params)
    total_items = cursor.fetchone()[0]

    data_query = f"""
    SELECT
        m.manga_id,
        m.title,
        m.author,
        m.total_pages,
        m.download_path,
        m.like_count,
        (
            SELECT json_group_array(json_object('type', t.type, 'name', t.name))
            FROM manga_tags mt JOIN tags t ON mt.tag_id = t.id
            WHERE mt.manga_auto_id = m.id
        ) AS tags
    FROM mangas AS m
    WHERE m.download_path IS NOT NULL {where_clause}
    {order_clause}
    LIMIT ? OFFSET ?
    """
    
    params.extend([limit, offset])
    
    cursor.execute(data_query, params)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {
        "mangas": mangas,
        "total_items": total_items,
        "total_pages": (total_items + limit - 1) // limit,
        "current_page": page
    }
