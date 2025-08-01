import sys
import os
import shutil
import requests
from flask import Flask, jsonify, render_template, send_from_directory, request

import database

app = Flask(__name__)
MANGA_ROOT = '/data'

SCRAPER_API_URL = 'http://web-scraper:5002/api/queue'

def _add_file_details(mangas_list):
    for manga in mangas_list:
        manga['cover_image'] = None
        manga['page_files'] = []
        download_path = manga.get('download_path')
        total_pages = manga.get('total_pages', 0)

        if download_path and os.path.isdir(download_path) and total_pages > 0:
            try:
                found_pages = {}
                valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
                for f in os.listdir(download_path):
                    if f.lower().endswith(valid_extensions):
                        page_num_str = os.path.splitext(f)[0]
                        if page_num_str.isdigit():
                            found_pages[int(page_num_str)] = f

                page_list = []
                for i in range(1, total_pages + 1):
                    page_list.append(found_pages.get(i, None))

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

@app.route('/api/mangas')
def get_mangas():
    mangas = database.get_all_mangas_with_tags()
    return jsonify(_add_file_details(mangas))

@app.route('/api/search')
def search_mangas():
    query = request.args.get('q', '').strip()

    if not query:
        return get_mangas()

    search_terms = [term for term in query.split() if term]
    mangas = database.search_mangas_by_query(search_terms)
    return jsonify(_add_file_details(mangas))

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

@app.route('/mangas/<path:filename>')
def serve_manga_file(filename):
    return send_from_directory(MANGA_ROOT, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)