#FRONTEND WILL BE AVALIABLE SOON


# nhentai.xxx Manga Downloader & Server

This project allows you to download manga from nhentai.xxx by author or from specific pages, and provides a web interface to view your collection.

## Prerequisites

Before you begin, ensure you have Docker and Docker Compose installed on your system. If you don't have them installed, follow the official installation guides below:

*   **Windows**: [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
*   **macOS**: [Install Docker Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
*   **Linux**: [Install Docker Desktop on Linux](https://docs.docker.com/desktop/setup/install/linux/) 

## How to Run

Follow these steps to get the project up and running:

### 1. Verify File Integrity (creates missing directories and files)

```bash
python3 checksum.py
```

### 2. Build the Docker Images

Before running the services for the first time, it's best to build the images separately. This can also be used to rebuild the images if you make changes to the Dockerfiles or the source code.

```bash
docker compose build
```

### 3. Start the Web Scraper Service

The web scraper is responsible for fetching manga from nhentai.xxx. Open a terminal in the project's root directory and run the following command:

```bash
docker compose up web-scraper
```

This command will build the Docker image for the scraper and start the service. You can leave this terminal running to see the scraper's logs.

### 4. Start the Frontend Service

Once the scraper is running, open a **new** terminal in the same directory and start the frontend service:

```bash
docker compose up frontend
```

This will build and start the web interface.

### 5. Access the Web Interface

After the frontend service has started, you can access the web interface by opening your browser and navigating to:

[http://localhost:5001](http://localhost:5001)

In order to access from a different device on teh same network, replace localhost with the ip address of the machine running the server.(192.x.x.x:5001)

From the web interface, you can queue downloads and view your manga collection.
This implementation is ready for hosting for public.(adjust the number of cores in docker-compose.yml to match your server's capabilities and link to a domain)