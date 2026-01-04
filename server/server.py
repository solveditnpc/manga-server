import sys
import os
import re
import shutil
import requests
from flask import Flask, jsonify, render_template, send_from_directory, request

import database

app = Flask(__name__)

print("Checking database schema...")
database.init_db()

MANGA_ROOT = '/data'

SCRAPER_API_URL = 'http://web-scraper:5002/api/queue'

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split('([0-9]+)', s)]

def _add_file_details(mangas_list, source=None):
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')

    for manga in mangas_list:
        manga['cover_image'] = None
        manga['page_files'] = []
        manga['chapters'] = []
        
        download_path = manga.get('download_path')
        
        if not download_path or not os.path.exists(download_path):
            continue

        if source == 'S':
            try:
                # 1. Find all chapter folders (Layer 2)
                chapter_dirs = [d for d in os.listdir(download_path) if os.path.isdir(os.path.join(download_path, d))]
                chapter_dirs.sort(key=natural_sort_key)
                
                chapters_data = []
                
                # 2. Scan inside each chapter for images (Layer 3)
                for ch_name in chapter_dirs:
                    ch_path = os.path.join(download_path, ch_name)
                    images = [f for f in os.listdir(ch_path) if f.lower().endswith(valid_extensions)]
                    images.sort(key=natural_sort_key)
                    
                    chapters_data.append({
                        "title": ch_name,
                        "images": images
                    })

                manga['chapters'] = chapters_data
                
                # Look for ID.jpg in /suwayomi_data/downloads/thumbnails
                manga_id = str(manga.get('manga_id'))
                thumbnails_path = '/suwayomi_data/downloads/thumbnails'
                cover_found = False

                for ext in valid_extensions:
                    thumb_file = f"{manga_id}{ext}"
                    if os.path.exists(os.path.join(thumbnails_path, thumb_file)):
                        manga['cover_image'] = f"suwayomi_data/downloads/thumbnails/{thumb_file}"
                        cover_found = True
                        break
                
                # Fallback: If no thumbnail exists, use the first page of the first chapter
                if not cover_found and chapters_data and chapters_data[0]['images']:
                    first_ch = chapters_data[0]
                    manga['cover_image'] = f"{first_ch['title']}/{first_ch['images'][0]}"
                        
            except Exception as e:
                print(f"Error processing Suwayomi manga {manga.get('title')}: {e}")

        else:
            total_pages = manga.get('total_pages', 0)
            try:
                found_pages = {}
                for f in os.listdir(download_path):
                    if f.lower().endswith(valid_extensions):
                        page_num_str = os.path.splitext(f)[0]
                        if page_num_str.isdigit():
                            found_pages[int(page_num_str)] = f

                page_list = []
                if total_pages > 0:
                    for i in range(1, total_pages + 1):
                        page_list.append(found_pages.get(i, None))
                else:
                    sorted_keys = sorted(found_pages.keys())
                    page_list = [found_pages[k] for k in sorted_keys]

                manga['page_files'] = page_list
                
                for page_file in page_list:
                    if page_file is not None:
                        manga['cover_image'] = page_file
                        break
                        
            except Exception as e:
                print(f"Error processing files for manga {manga.get('title')}: {e}")

    return mangas_list

@app.route('/api/download', methods=['POST'])
def download_manga_request():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    payload = request.get_json()

    if not payload or ('author' not in payload and 'manga_id' not in payload):
        return jsonify({"error": "Request must include either 'author' or 'manga_id'"}), 400

    try:
        response = requests.post(SCRAPER_API_URL, json=payload, timeout=10)
        
        response.raise_for_status()

        return jsonify(response.json()), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({"error": "The request to the scraper service timed out."}), 504
    except requests.exceptions.RequestException as e:
        error_message = f"Failed to connect to the scraper service: {e}"
        print(error_message)
        if e.response is not None:
            try:
                return jsonify(e.response.json()), e.response.status_code
            except ValueError:
                 return jsonify({"error": error_message, "details": e.response.text}), 502
        else:
             return jsonify({"error": error_message}), 503

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/mangas/<int:manga_id>', methods=['DELETE'])
def delete_manga(manga_id):
    manga_info = database.delete_manga_by_id(manga_id)

    if not manga_info:
        return jsonify({"error": f"No manga with ID {manga_id} found"}), 404

    download_path = manga_info.get("download_path")
    title = manga_info.get("title")

    message = f"Successfully deleted '{title}' (ID: {manga_id}) from the database."

    if download_path and os.path.isdir(download_path):
        try:
            shutil.rmtree(download_path)
            message += f" and its folder '{download_path}'."
        except Exception as e:
            print(f"Error deleting folder {download_path}: {e}")
            return jsonify({
                "message": f"Deleted '{title}' from database, but failed to delete its folder.",
                "error": str(e)
            }), 500
    else:
        message += " No corresponding download folder was found to delete."

    return jsonify({"message": message}), 200

@app.route('/api/mangas/<int:manga_id>/like', methods=['POST'])
def like_manga(manga_id):
    new_count = database.increment_like(manga_id)
    return jsonify({"manga_id": manga_id, "like_count": new_count})

@app.route('/api/mangas/<int:manga_id>/unlike', methods=['POST'])
def unlike_manga(manga_id):
    new_count = database.decrement_like(manga_id)
    return jsonify({"manga_id": manga_id, "like_count": new_count})

@app.route('/api/s_mangas/<path:manga_id>/like', methods=['POST'])
def like_s_manga(manga_id):
    new_count = database.increment_S_like(manga_id)
    return jsonify({"manga_id": manga_id, "like_count": new_count})

@app.route('/api/s_mangas/<path:manga_id>/unlike', methods=['POST'])
def unlike_s_manga(manga_id):
    new_count = database.decrement_S_like(manga_id)
    return jsonify({"manga_id": manga_id, "like_count": new_count})

@app.route('/mangas/<path:filename>')
def serve_manga_file(filename):
    if filename.startswith('suwayomi_data'):
        return send_from_directory('/', filename)
    
    return send_from_directory(MANGA_ROOT, filename)

@app.route('/api/mangas')
def get_mangas_route():
    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('q', '').strip()
    sort_mode = request.args.get('sort', 'date')
    
    server_source = request.args.get('server') 
    
    search_terms = [t for t in search_query.split() if t] if search_query else None
    
    result = database.get_mangas_paginated(
        page=page, 
        limit=24, 
        search_terms=search_terms, 
        sort_by=sort_mode,
        source=server_source
    )
    
    result['mangas'] = _add_file_details(result['mangas'], source=server_source)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)