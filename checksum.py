import os
import sys
import platform
import subprocess

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
    """Checks if a command exists on the system's PATH."""
    try:
        subprocess.run(command_parts, check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def get_user_ids():
    """Gets UID and GID for the current user on Unix-like systems."""
    system = platform.system()
    if system == "Linux" or system == "Darwin": 
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
    """Checks for Docker and Docker Compose."""
    print_header("Checking Docker Installation")
    
    is_docker_ok = check_command(['docker', '--version'])
    print_status("Docker Engine", is_docker_ok)
    
    is_compose_ok = check_command(['docker', 'compose', 'version'])
    print_status("Docker Compose", is_compose_ok)

    if not is_docker_ok or not is_compose_ok:
        print(f"\n{BColors.FAIL}Docker Engine or Docker Compose is not installed.{BColors.ENDC}")
        sys.exit(1)

def update_docker_compose_file():
    """Updates the docker-compose.yml file with the current user's ID for all services."""
    print_header("Updating Docker Compose File")
    if not os.path.exists(DOCKER_COMPOSE_FILE):
        print(f"{BColors.FAIL}Error: '{DOCKER_COMPOSE_FILE}' not found.{BColors.ENDC}")
        sys.exit(1)

    user_id_str = get_user_ids()
    new_lines = []
    updated_count = 0
    
    # Services that need the user permission set (because they mount volumes)
    target_services = ['web-scraper:', 'server:', 'frontend:']
    current_service = None

    with open(DOCKER_COMPOSE_FILE, 'r') as f:
        lines = f.readlines()

    for line in lines:
        stripped = line.strip()
        
        # Detect which service block we are in
        if stripped in target_services:
            current_service = stripped
            new_lines.append(line)
            continue
        
        # Detect end of a service block (dedent) or start of another root key
        if current_service and (line.startswith('services:') or (not line.startswith(' ') and stripped != '')):
            current_service = None

        # Check for user line within a target service
        if current_service and stripped.startswith('user:'):
            new_user_line = f'    user: "{user_id_str}"\n'
            if line != new_user_line:
                new_lines.append(new_user_line)
                updated_count += 1
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    if updated_count > 0:
        with open(DOCKER_COMPOSE_FILE, 'w') as f:
            f.writelines(new_lines)
        print(f"  -> {BColors.OKGREEN}Updated 'user' to '{user_id_str}' for {updated_count} services.{BColors.ENDC}")
    else:
        print(f"  -> {BColors.OKGREEN}User IDs are already correctly set in {DOCKER_COMPOSE_FILE}.{BColors.ENDC}")

def check_project_structure():
    """Checks and creates necessary directories based on the new architecture."""
    print_header("Verifying Project Structure")

    # Defined based on your ls -R output
    required_directories = [
        './mangas', 
        './sqlite', 
        './server',        # Backend
        './frontend',      # New Frontend
        './web_scrapers'   # Scraper logic
    ]

    for path in required_directories:
        if not os.path.isdir(path):
            # Only create data directories. Code directories should exist via git.
            if path in ['./mangas', './sqlite']:
                os.makedirs(path)
                print(f"  -> Created directory: {path}")
            else:
                print(f"  -> {BColors.WARNING}Warning: Code directory '{path}' missing. You might need to 'git pull'.{BColors.ENDC}")
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

    print(f"  -> {BColors.OKGREEN}Project structure check complete.{BColors.ENDC}")

def main():
    print(f"{BColors.HEADER}{BColors.BOLD}=== Project Setup & Sanity Check ==={BColors.ENDC}")
    check_docker_installed()
    update_docker_compose_file()
    check_project_structure()
    print(f"\n{BColors.OKGREEN}{BColors.BOLD}Setup complete. Ready to run 'docker compose up --build'.{BColors.ENDC}")

if __name__ == "__main__":
    main()