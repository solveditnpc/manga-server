import os
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

QUEUE_FILE = '/database/queue.json'

@app.route('/api/queue', methods=['POST'])
def add_to_queue():
    if not request.is_json:
        return jsonify({"error": "Invalid request: Content-Type must be application/json"}), 415

    data = request.get_json()
    
    author_name = data.get('author')
    manga_id = data.get('manga_id')

    if not author_name and not manga_id:
        return jsonify({"error": "Request must include either 'author' or 'manga_id'"}), 400

    if author_name and manga_id:
        return jsonify({"error": "Please provide either 'author' or 'manga_id', not both"}), 400

    if author_name:
        new_entry = {'type': 'author', 'value': author_name}
    else:
        if not isinstance(manga_id, int):
            return jsonify({"error": "'manga_id' must be an integer"}), 400
        new_entry = {'type': 'id', 'value': manga_id}

    try:
        if os.path.exists(QUEUE_FILE):
            with open(QUEUE_FILE, 'r') as f:
                try:
                    queue_data = json.load(f)
                    if not isinstance(queue_data, list):
                        queue_data = []
                except json.JSONDecodeError:
                    queue_data = []
        else:
            queue_data = []

        queue_data.append(new_entry)

        with open(QUEUE_FILE, 'w') as f:
            json.dump(queue_data, f, indent=4)

        return jsonify({
            "message": "Item added to queue successfully",
            "item": new_entry
        }), 201

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)