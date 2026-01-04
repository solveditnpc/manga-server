import sqlite3
import os
from datetime import datetime

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

def increment_S_like(manga_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE S_mangas SET like_count = like_count + 1 WHERE manga_id = ?", (str(manga_id),))
        conn.commit()
        cursor.execute("SELECT like_count FROM S_mangas WHERE manga_id = ?", (str(manga_id),))
        row = cursor.fetchone()
        return row['like_count'] if row else 0
    except Exception as e:
        print(f"Error S_like: {e}")
        return 0
    finally: conn.close()

def decrement_S_like(manga_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE S_mangas SET like_count = like_count - 1 WHERE manga_id = ? AND like_count > 0", (str(manga_id),))
        conn.commit()
        cursor.execute("SELECT like_count FROM S_mangas WHERE manga_id = ?", (str(manga_id),))
        row = cursor.fetchone()
        return row['like_count'] if row else 0
    except: return 0
    finally: conn.close()
'''
def get_mangas_paginated(page=1, limit=24, search_terms=None, sort_by='date'):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * limit
    
    if search_terms:
        cleaned_terms = []
        for term in search_terms:
            if isinstance(term, str):
                cleaned_terms.extend(term.split())
        if not cleaned_terms:
            cleaned_terms = search_terms
            
        expanded_terms = list(cleaned_terms) 
        if len(cleaned_terms) > 1:
            combo = "".join(cleaned_terms)
            expanded_terms.append(combo)
            for i in range(len(cleaned_terms) - 1):
                bigram = cleaned_terms[i] + cleaned_terms[i+1]
                if bigram not in expanded_terms:
                    expanded_terms.append(bigram)

        final_search_terms = list(set(expanded_terms))

        term_queries = []
        params = []
        
        single_term_query = """
            SELECT * FROM (
                SELECT id FROM mangas 
                WHERE title LIKE ? 
                   OR author LIKE ? 
                   OR CAST(manga_id AS TEXT) LIKE ?
                   OR REPLACE(title, ' ', '') LIKE ? 
                   OR REPLACE(author, ' ', '') LIKE ?
                UNION
                SELECT manga_auto_id FROM manga_tags 
                JOIN tags ON manga_tags.tag_id = tags.id 
                WHERE tags.name LIKE ?
                   OR REPLACE(tags.name, ' ', '') LIKE ?
            )
        """
        
        for term in final_search_terms:
            term_queries.append(single_term_query)
            like_term = f'%{term}%'
            params.extend([like_term] * 7)
            
        full_union_query = " UNION ALL ".join(term_queries)
        
        cte_sql = f"""
            WITH match_scores AS (
                SELECT id, COUNT(*) as score 
                FROM (
                    {full_union_query}
                ) 
                GROUP BY id
            )
        """
        
        count_query = f"{cte_sql} SELECT COUNT(*) FROM match_scores"
        cursor.execute(count_query, params)
        total_items = cursor.fetchone()[0]
        
        if sort_by == 'likes':
            secondary_sort = "m.like_count DESC, m.download_timestamp DESC"
        else:
            secondary_sort = "m.download_timestamp DESC"

        data_query = f"""
            {cte_sql}
            SELECT 
                m.manga_id, m.title, m.author, m.total_pages, m.download_path, m.like_count,
                (SELECT json_group_array(json_object('type', t.type, 'name', t.name))
                 FROM manga_tags mt JOIN tags t ON mt.tag_id = t.id
                 WHERE mt.manga_auto_id = m.id) AS tags,
                s.score
            FROM mangas m
            JOIN match_scores s ON m.id = s.id
            ORDER BY s.score DESC, {secondary_sort}
            LIMIT ? OFFSET ?
        """
        
        cursor.execute(data_query, params + [limit, offset])
        mangas = [dict(row) for row in cursor.fetchall()]

    else:
        params = []
        if sort_by == 'likes':
            order_clause = "ORDER BY m.like_count DESC, m.download_timestamp DESC"
        else:
            order_clause = "ORDER BY m.download_timestamp DESC"

        count_query = "SELECT COUNT(*) FROM mangas WHERE download_path IS NOT NULL"
        cursor.execute(count_query)
        total_items = cursor.fetchone()[0]

        data_query = f"""
            SELECT 
                m.manga_id, m.title, m.author, m.total_pages, m.download_path, m.like_count,
                (SELECT json_group_array(json_object('type', t.type, 'name', t.name))
                 FROM manga_tags mt JOIN tags t ON mt.tag_id = t.id
                 WHERE mt.manga_auto_id = m.id) AS tags
            FROM mangas m
            WHERE m.download_path IS NOT NULL
            {order_clause}
            LIMIT ? OFFSET ?
        """
        cursor.execute(data_query, [limit, offset])
        mangas = [dict(row) for row in cursor.fetchall()]

    conn.close()
    
    return {
        "mangas": mangas,
        "total_items": total_items,
        "total_pages": (total_items + limit - 1) // limit,
        "current_page": page
    }
'''
'''
def get_mangas_paginated(page=1, limit=24, search_terms=None, sort_by='date', source=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * limit
    
    # Select which table to query based on source parameter
    if source == 'S':
        # Suwayomi Configuration
        table_name = "S_mangas"
        tag_link_table = "S_manga_tags"
        fk_column = "s_manga_id"
        # Map fields: chapter_count -> total_pages, last_synced -> download_timestamp
        # Suwayomi mangas don't have like_count yet, returning 0
        fields = """
            m.manga_id, m.title, m.author, m.chapter_count as total_pages, 
            m.download_path, m.last_synced as download_timestamp, 0 as like_count
        """
        # Suwayomi IDs are TEXT
        id_cast = "m.manga_id" 
    else:
        # Standard Configuration (Nhentai)
        table_name = "mangas"
        tag_link_table = "manga_tags"
        fk_column = "manga_auto_id"
        fields = """
            m.manga_id, m.title, m.author, m.total_pages, 
            m.download_path, m.download_timestamp, m.like_count
        """
        # Standard IDs are INTEGER, cast for search
        id_cast = "CAST(m.manga_id AS TEXT)"

    # Base query parts
    json_tags_query = f"""
        (SELECT json_group_array(json_object('type', t.type, 'name', t.name))
         FROM {tag_link_table} mt JOIN tags t ON mt.tag_id = t.id
         WHERE mt.{fk_column} = m.id) AS tags
    """

    if search_terms:
        cleaned_terms = []
        for term in search_terms:
            if isinstance(term, str):
                cleaned_terms.extend(term.split())
        if not cleaned_terms:
            cleaned_terms = search_terms
            
        expanded_terms = list(cleaned_terms) 
        if len(cleaned_terms) > 1:
            combo = "".join(cleaned_terms)
            expanded_terms.append(combo)
            for i in range(len(cleaned_terms) - 1):
                bigram = cleaned_terms[i] + cleaned_terms[i+1]
                if bigram not in expanded_terms:
                    expanded_terms.append(bigram)

        final_search_terms = list(set(expanded_terms))

        term_queries = []
        params = []
        
        single_term_query = f"""
            SELECT * FROM (
                SELECT id FROM {table_name} m
                WHERE title LIKE ? 
                   OR author LIKE ? 
                   OR {id_cast} LIKE ?
                   OR REPLACE(title, ' ', '') LIKE ? 
                   OR REPLACE(author, ' ', '') LIKE ?
                UNION
                SELECT {fk_column} FROM {tag_link_table} mt
                JOIN tags ON mt.tag_id = tags.id 
                WHERE tags.name LIKE ?
                   OR REPLACE(tags.name, ' ', '') LIKE ?
            )
        """
        
        for term in final_search_terms:
            term_queries.append(single_term_query)
            like_term = f'%{term}%'
            params.extend([like_term] * 7)
            
        full_union_query = " UNION ALL ".join(term_queries)
        
        cte_sql = f"""
            WITH match_scores AS (
                SELECT id, COUNT(*) as score 
                FROM (
                    {full_union_query}
                ) 
                GROUP BY id
            )
        """
        
        count_query = f"{cte_sql} SELECT COUNT(*) FROM match_scores"
        cursor.execute(count_query, params)
        total_items = cursor.fetchone()[0]
        
        # Sort logic
        if sort_by == 'likes':
            # Suwayomi doesn't have like_count, effectively sorts by date
            secondary_sort = "m.like_count DESC, m.download_timestamp DESC" if source != 'S' else "m.download_timestamp DESC"
        else:
            secondary_sort = "m.download_timestamp DESC"

        data_query = f"""
            {cte_sql}
            SELECT 
                {fields},
                {json_tags_query},
                s.score
            FROM {table_name} m
            JOIN match_scores s ON m.id = s.id
            ORDER BY s.score DESC, {secondary_sort}
            LIMIT ? OFFSET ?
        """
        
        cursor.execute(data_query, params + [limit, offset])
        mangas = [dict(row) for row in cursor.fetchall()]

    else:
        params = []
        if sort_by == 'likes':
            order_clause = "ORDER BY m.like_count DESC, m.download_timestamp DESC" if source != 'S' else "ORDER BY m.download_timestamp DESC"
        else:
            order_clause = "ORDER BY m.download_timestamp DESC"

        count_query = f"SELECT COUNT(*) FROM {table_name} m WHERE download_path IS NOT NULL"
        cursor.execute(count_query)
        total_items = cursor.fetchone()[0]

        data_query = f"""
            SELECT 
                {fields},
                {json_tags_query}
            FROM {table_name} m
            WHERE m.download_path IS NOT NULL
            {order_clause}
            LIMIT ? OFFSET ?
        """
        cursor.execute(data_query, [limit, offset])
        mangas = [dict(row) for row in cursor.fetchall()]

    conn.close()
    
    return {
        "mangas": mangas,
        "total_items": total_items,
        "total_pages": (total_items + limit - 1) // limit,
        "current_page": page
    }
'''
def get_mangas_paginated(page=1, limit=24, search_terms=None, sort_by='date', source=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * limit
    
    if source == 'S':
        table_name = "S_mangas"
        tag_link_table = "S_manga_tags"
        fk_column = "s_manga_id"
        
        fields = """
            m.manga_id, m.title, m.author, m.chapter_count as total_pages, 
            m.download_path, m.last_synced as download_timestamp, m.like_count
        """
        id_cast = "m.manga_id"
        
        time_col = "m.last_synced"
    else:
        table_name = "mangas"
        tag_link_table = "manga_tags"
        fk_column = "manga_auto_id"
        
        fields = """
            m.manga_id, m.title, m.author, m.total_pages, 
            m.download_path, m.download_timestamp, m.like_count
        """
        id_cast = "CAST(m.manga_id AS TEXT)"
        
        time_col = "m.download_timestamp"

    json_tags_query = f"""
        (SELECT json_group_array(json_object('type', t.type, 'name', t.name))
         FROM {tag_link_table} mt JOIN tags t ON mt.tag_id = t.id
         WHERE mt.{fk_column} = m.id) AS tags
    """

    if search_terms:
        cleaned_terms = []
        for term in search_terms:
            if isinstance(term, str):
                cleaned_terms.extend(term.split())
        if not cleaned_terms:
            cleaned_terms = search_terms
            
        expanded_terms = list(cleaned_terms) 
        if len(cleaned_terms) > 1:
            combo = "".join(cleaned_terms)
            expanded_terms.append(combo)
            for i in range(len(cleaned_terms) - 1):
                bigram = cleaned_terms[i] + cleaned_terms[i+1]
                if bigram not in expanded_terms:
                    expanded_terms.append(bigram)

        final_search_terms = list(set(expanded_terms))

        term_queries = []
        params = []
        
        single_term_query = f"""
            SELECT * FROM (
                SELECT id FROM {table_name} m
                WHERE title LIKE ? 
                   OR author LIKE ? 
                   OR {id_cast} LIKE ?
                   OR REPLACE(title, ' ', '') LIKE ? 
                   OR REPLACE(author, ' ', '') LIKE ?
                UNION
                SELECT {fk_column} FROM {tag_link_table} mt
                JOIN tags ON mt.tag_id = tags.id 
                WHERE tags.name LIKE ?
                   OR REPLACE(tags.name, ' ', '') LIKE ?
            )
        """
        
        for term in final_search_terms:
            term_queries.append(single_term_query)
            like_term = f'%{term}%'
            params.extend([like_term] * 7)
            
        full_union_query = " UNION ALL ".join(term_queries)
        
        cte_sql = f"""
            WITH match_scores AS (
                SELECT id, COUNT(*) as score 
                FROM (
                    {full_union_query}
                ) 
                GROUP BY id
            )
        """
        
        count_query = f"{cte_sql} SELECT COUNT(*) FROM match_scores"
        cursor.execute(count_query, params)
        res = cursor.fetchone()
        total_items = res[0] if res else 0
        
        if sort_by == 'likes':
            secondary_sort = f"m.like_count DESC, {time_col} DESC"
        else:
            secondary_sort = f"{time_col} DESC"

        data_query = f"""
            {cte_sql}
            SELECT 
                {fields},
                {json_tags_query},
                s.score
            FROM {table_name} m
            JOIN match_scores s ON m.id = s.id
            ORDER BY s.score DESC, {secondary_sort}
            LIMIT ? OFFSET ?
        """
        
        cursor.execute(data_query, params + [limit, offset])
        mangas = [dict(row) for row in cursor.fetchall()]

    else:
        params = []
        
        if sort_by == 'likes':
            order_clause = f"ORDER BY m.like_count DESC, {time_col} DESC"
        else:
            order_clause = f"ORDER BY {time_col} DESC"

        count_query = f"SELECT COUNT(*) FROM {table_name} m WHERE download_path IS NOT NULL"
        cursor.execute(count_query)
        total_items = cursor.fetchone()[0]

        data_query = f"""
            SELECT 
                {fields},
                {json_tags_query}
            FROM {table_name} m
            WHERE m.download_path IS NOT NULL
            {order_clause}
            LIMIT ? OFFSET ?
        """
        cursor.execute(data_query, [limit, offset])
        mangas = [dict(row) for row in cursor.fetchall()]

    conn.close()
    
    return {
        "mangas": mangas,
        "total_items": total_items,
        "total_pages": (total_items + limit - 1) // limit,
        "current_page": page
    }