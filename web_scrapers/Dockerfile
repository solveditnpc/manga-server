FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install
COPY . .
RUN chmod +x ./start.sh
CMD ["./start.sh"]