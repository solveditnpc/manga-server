import os
import sys
import platform
import subprocess
import getpass

# --- Configuration ---
DOCKER_COMPOSE_FILE = 'docker-compose.yml'

# --- Helper Classes and Functions ---
class BColors:
    """ANSI color codes for pretty printing."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    print(f"\n{BColors.HEADER}{BColors.BOLD}--- {message} ---{BColors.ENDC}")

def print_status(message, is_ok):
    status = f"{BColors.OKGREEN}OK{BColors.ENDC}" if is_ok else f"{BColors.FAIL}MISSING{BColors.ENDC}"
    print(f"  -> {message}: [{status}]")

def check_command(command_parts):
    """Checks if a command (as a list of parts) exists on the system's PATH."""
    try:
        subprocess.run(command_parts, check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def get_user_ids():
    """Gets UID and GID for the current user on Unix-like systems."""
    system = platform.system()
    if system == "Linux" or system == "Darwin": # Darwin is macOS
        try:
            uid = os.getuid()
            gid = os.getgid()
            return f"{uid}:{gid}"
        except AttributeError:
            return "1000:1000"
    elif system == "Windows":
        print(f"{BColors.WARNING}Info: On Windows, file permissions are handled by WSL2. Using default user '1000:1000'.{BColors.ENDC}")
        return "1000:1000"
    return "1000:1000"

# --- Main Check Functions ---

def check_docker_installed():
    """Checks for Docker and Docker Compose, provides installation instructions if missing."""
    print_header("Checking Docker Installation")
    
    is_docker_ok = check_command(['docker', '--version'])
    print_status("Docker Engine", is_docker_ok)
    
    # NEW: Check for Docker Compose (v2)
    is_compose_ok = check_command(['docker', 'compose', 'version'])
    print_status("Docker Compose", is_compose_ok)

    if not is_docker_ok or not is_compose_ok:
        print(f"\n{BColors.FAIL}Docker Engine or Docker Compose is not installed or not in the system's PATH.{BColors.ENDC}")
        print("Modern Docker installations include Docker Compose. Please follow the official guide for your OS.")
        system = platform.system()
        if system == "Linux":
            print("Please download and install Docker Desktop for linux from the official website:")
            print(f"{BColors.OKBLUE}https://docs.docker.com/desktop/setup/install/linux/{BColors.ENDC}")
        elif system == "Darwin":
            print("Please download and install Docker Desktop for Mac from the official website:")
            print(f"{BColors.OKBLUE}https://docs.docker.com/desktop/setup/install/mac-install/{BColors.ENDC}")
        elif system == "Windows":
            print("Please download and install Docker Desktop for Windows from the official website:")
            print(f"{BColors.OKBLUE}https://docs.docker.com/desktop/setup/install/windows-install/{BColors.ENDC}")
        sys.exit(1)

def update_docker_compose_file():
    """Updates the docker-compose.yml file with the current user's ID."""
    print_header("Updating Docker Compose File")
    if not os.path.exists(DOCKER_COMPOSE_FILE):
        print(f"{BColors.FAIL}Error: '{DOCKER_COMPOSE_FILE}' not found. Cannot proceed.{BColors.ENDC}")
        sys.exit(1)

    user_id_str = get_user_ids()
    new_lines = []
    updated = False

    with open(DOCKER_COMPOSE_FILE, 'r') as f:
        lines = f.readlines()

    in_scraper_service = False
    for line in lines:
        if "web-scraper:" in line:
            in_scraper_service = True
        elif in_scraper_service and (not line.startswith(' ') and not line.strip() == ""):
            in_scraper_service = False
        
        if in_scraper_service and "user:" in line:
            new_user_line = f'    user: "{user_id_str}"\n'
            if line.strip() != new_user_line.strip():
                new_lines.append(new_user_line)
                updated = True
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    if updated:
        with open(DOCKER_COMPOSE_FILE, 'w') as f:
            f.writelines(new_lines)
        print(f"  -> {BColors.OKGREEN}Updated 'user' in web-scraper service to '{user_id_str}'.{BColors.ENDC}")
    else:
        print(f"  -> {BColors.OKGREEN}User ID is already correctly set.{BColors.ENDC}")


def check_project_structure():
    """Checks and creates necessary directories and files."""
    print_header("Verifying Project Structure")

    # Check directories
    directories = ['./mangas', './sqlite', './FrontEnd', './web_scrapers']
    for path in directories:
        if not os.path.isdir(path):
            os.makedirs(path)
            print(f"  -> Created directory: {path}")
        else:
            print(f"  -> Directory exists: {path}")

    # Check for queue.json
    queue_file = './sqlite/queue.json'
    if not os.path.exists(queue_file):
        with open(queue_file, 'w') as f:
            f.write('[]')
        print(f"  -> Created file: {queue_file}")
    else:
        print(f"  -> File exists: {queue_file}")

    print(f"  -> {BColors.OKGREEN}Project structure is OK.{BColors.ENDC}")


def main():
    """Main function to run all checks."""
    print(f"{BColors.HEADER}{BColors.BOLD}=== Project Setup & Sanity Check ==={BColors.ENDC}")
    check_docker_installed()
    update_docker_compose_file()
    check_project_structure()
    print(f"\n{BColors.OKGREEN}{BColors.BOLD}Setup complete. You are ready to run 'docker compose build' and 'docker compose up frontend' and 'docker compose up web-scraper'!{BColors.ENDC}")

if __name__ == "__main__":
    main()