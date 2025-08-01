echo "--- Starting Gunicorn API Server (in background) ---"
gunicorn --workers 2 --bind 0.0.0.0:5002 --access-logfile - --error-logfile - api:app &
sleep 5
echo "--- Starting Queue Processor (in foreground) ---"
python -u processor.py
