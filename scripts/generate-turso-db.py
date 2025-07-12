import subprocess
import re
import pyperclip
import argparse
import os
import sys
import time
import json
from datetime import datetime
from pathlib import Path
import math
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
try:
    from rich.console import Console
    from rich.text import Text
    from rich.panel import Panel
    from rich.table import Table
    from rich.prompt import Prompt
    from rich.live import Live
    from rich.layout import Layout
    from rich.align import Align
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("Note: Install 'rich' library for enhanced secret display features: pip install rich")

# Script metadata (automatically updated by pre-commit hook)
SCRIPT_VERSION = "1.1"
LAST_UPDATED_TIMESTAMP = "2025-07-03 16:39:47 UTC"

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    PURPLE = '\033[35m'
    YELLOW = '\033[33m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    GRAY = '\033[90m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'
    ORANGE = '\033[38;5;208m'
    LIGHT_BLUE = '\033[38;5;117m'

# Define a standard width for the content of all boxes
CONTENT_WIDTH = 60
STATE_FILE = Path.home() / ".turso_gen_state.json"
CONFIG_FILE = Path.home() / ".turso_gen_config.json"

class SecretDisplay:
    """Class to handle secret display with asterisks and reveal functionality."""
    
    def __init__(self, secret, name="secret"):
        self.secret = secret
        self.name = name
        self.is_revealed = False
    
    def get_masked_display(self):
        """Return the secret masked with asterisks."""
        if len(self.secret) <= 8:
            return "*" * len(self.secret)
        else:
            # Show first 4 and last 4 characters with asterisks in between
            return f"{self.secret[:4]}{'*' * (len(self.secret) - 8)}{self.secret[-4:]}"
    
    def get_full_display(self):
        """Return the full secret."""
        return self.secret
    
    def get_display(self, reveal=False):
        """Get the display version of the secret."""
        if reveal or self.is_revealed:
            return self.get_full_display()
        return self.get_masked_display()
    
    def toggle_reveal(self):
        """Toggle the reveal state."""
        self.is_revealed = not self.is_revealed
        return self.is_revealed
    
    def create_interactive_display(self):
        """Create an interactive display with reveal option."""
        if RICH_AVAILABLE:
            return self._create_rich_display()
        else:
            return self._create_simple_display()
    
    def _create_rich_display(self):
        """Create a rich-formatted interactive display."""
        from rich.text import Text
        from rich.panel import Panel
        from rich import print as rprint
        
        masked = self.get_masked_display()
        console = Console()
        
        # Create text with click instruction
        text = Text()
        text.append(f"{self.name.upper()}: ", style="bold white")
        text.append(masked, style="bright_cyan")
        text.append(" ", style="")
        text.append("[Press 'r' to reveal]", style="dim cyan")
        
        return Panel(text, title=f"🔐 {self.name.title()}", border_style="cyan")
    
    def _create_simple_display(self):
        """Create a simple text display."""
        masked = self.get_masked_display()
        return f"{Colors.BOLD}{Colors.ORANGE}{self.name.upper()}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{masked}{Colors.ENDC} {Colors.CYAN}[Press 'r' to reveal]{Colors.ENDC}"
    
    @staticmethod
    def interactive_reveal_prompt(secrets_dict):
        """Interactive prompt to reveal secrets."""
        if not secrets_dict:
            return
            
        print(f"\n{Colors.BOLD}{Colors.CYAN}Secret Management:{Colors.ENDC}")
        print(f"{Colors.GRAY}Press 'r' + Enter to reveal all secrets, or Enter to continue{Colors.ENDC}")
        
        try:
            user_input = input(f"{Colors.BOLD}{Colors.ORANGE}Action (r/Enter): {Colors.ENDC}").strip().lower()
            
            if user_input == 'r':
                print(f"\n{Colors.BOLD}{Colors.OKGREEN}🔓 Secrets Revealed:{Colors.ENDC}")
                for name, secret_obj in secrets_dict.items():
                    print(f"{Colors.BOLD}{Colors.ORANGE}{name.upper()}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{secret_obj.get_full_display()}{Colors.ENDC}")
                
                # Ask if they want to copy to clipboard
                copy_input = input(f"\n{Colors.BOLD}{Colors.ORANGE}Copy revealed secrets to clipboard? (y/N): {Colors.ENDC}").strip().lower()
                if copy_input == 'y':
                    try:
                        clipboard_content = "\n".join([f"{name.upper()}={secret_obj.get_full_display()}" for name, secret_obj in secrets_dict.items()])
                        pyperclip.copy(clipboard_content)
                        print_success("Revealed secrets copied to clipboard!")
                    except Exception as e:
                        print_warning(f"Could not copy to clipboard: {e}")
                        
                input(f"\n{Colors.BOLD}{Colors.GRAY}Press Enter to continue...{Colors.ENDC}")
                
        except KeyboardInterrupt:
            print_info("\nContinuing with masked secrets...")

def print_ascii_header():
    """Print a beautiful ASCII header with version and update info."""
    # Prepare the version and timestamp line
    version_text = f"Version: {SCRIPT_VERSION}"
    last_updated_text = f"Last Updated: {LAST_UPDATED_TIMESTAMP}"

    # Combine with colors for display, but keep plain text for length calculation
    info_line_plain = f"{version_text}  {last_updated_text}"
    info_line_colored = f"{Colors.BOLD}{Colors.WHITE}{version_text}{Colors.ENDC}  {Colors.GRAY}{last_updated_text}{Colors.ENDC}"

    # Calculate visible length (without ANSI codes)
    visible_length = len(info_line_plain)

    # Calculate padding needed for centering
    if visible_length < CONTENT_WIDTH:
        total_padding = CONTENT_WIDTH - visible_length
        left_padding = total_padding // 2
        right_padding = total_padding - left_padding # Handles odd/even padding
    else:
        left_padding = 0
        right_padding = 0
        # If the text is too long, it won't be centered but will start from left.
        # Optionally, truncate info_line_colored if it's too long.
        # For now, we'll let it overflow if it's drastically longer than CONTENT_WIDTH.

    centered_info_line = f"{' ' * left_padding}{info_line_colored}{' ' * right_padding}"

    # If the centered_info_line (with padding but without outer box colors) is longer than CONTENT_WIDTH due to color codes,
    # we might need to adjust. However, the primary goal is to center the *visible* text.
    # The re.sub method is more robust for calculating visible length if colors were within version_text etc.
    # For this specific structure, direct length of plain parts is fine.

    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════╗
║{centered_info_line}{Colors.CYAN}║
║                                                              ║
║  {Colors.BOLD}{Colors.WHITE}        ████████╗██╗   ██╗██████╗ ███████╗ ██████╗{Colors.ENDC}{Colors.CYAN}          ║
║  {Colors.BOLD}{Colors.WHITE}        ╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔═══██╗{Colors.ENDC}{Colors.CYAN}         ║
║  {Colors.BOLD}{Colors.WHITE}           ██║   ██║   ██║██████╔╝███████╗██║   ██║{Colors.ENDC}{Colors.CYAN}         ║
║  {Colors.BOLD}{Colors.WHITE}           ██║   ██║   ██║██╔══██╗╚════██║██║   ██║{Colors.ENDC}{Colors.CYAN}         ║
║  {Colors.BOLD}{Colors.WHITE}           ██║   ╚██████╔╝██║  ██║███████║╚██████╔╝{Colors.ENDC}{Colors.CYAN}         ║
║  {Colors.BOLD}{Colors.WHITE}          ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝{Colors.ENDC}{Colors.CYAN}           ║
║                                                              ║
║           {Colors.BOLD}{Colors.ORANGE}🚀 Database Generator & Token Creator 🚀{Colors.ENDC}{Colors.CYAN}           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝{Colors.ENDC}
""")

def print_step(step_num, total_steps, message):
    """Print a formatted step with progress indicator."""
    progress = "█" * step_num + "░" * (total_steps - step_num)
    print(f"\n{Colors.BOLD}{Colors.OKBLUE}[{step_num}/{total_steps}]{Colors.ENDC} {Colors.CYAN}[{progress}]{Colors.ENDC} {Colors.BOLD}{message}{Colors.ENDC}")

def print_success(message):
    """Print a success message with checkmark."""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    """Print an error message with X mark."""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")

def print_warning(message):
    """Print a warning message with warning icon."""
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    """Print an info message with info icon."""
    print(f"{Colors.OKCYAN}ℹ️  {message}{Colors.ENDC}")

def print_section_divider(title):
    """Print a section divider with title, respecting CONTENT_WIDTH."""
    divider = "═" * CONTENT_WIDTH
    print(f"\n{Colors.PURPLE}╔{divider}╗")
    print(f"║{Colors.BOLD}{Colors.WHITE}{title.center(CONTENT_WIDTH)}{Colors.ENDC}{Colors.PURPLE}║")
    print(f"╚{divider}╝{Colors.ENDC}")

def print_env_vars_box(DATABASE_URL, auth_token, db_name, url_var_name="DATABASE_URL", token_var_name="TURSO_AUTH_TOKEN"):
    """Print environment variables in a beautiful, perfectly aligned box."""
    print_section_divider("🔐 GENERATED CREDENTIALS")

    def create_padded_line(text_to_pad, total_width):
        # Calculate padding needed. Remove color codes for length calculation.
        plain_text = re.sub(r'\033\[[0-9;]*m', '', text_to_pad)
        padding = total_width - len(plain_text)
        return f"{text_to_pad}{' ' * max(0, padding)}" # Ensure padding is not negative

    line_title = create_padded_line(f"  {Colors.BOLD}{Colors.WHITE}DATABASE CREDENTIALS", CONTENT_WIDTH)
    line_db_name = create_padded_line(f" {Colors.BOLD}{Colors.WHITE}Database Name: {Colors.CYAN}{db_name}", CONTENT_WIDTH)
    line_created_at = create_padded_line(f" {Colors.BOLD}{Colors.WHITE}Created At:  {Colors.GRAY}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", CONTENT_WIDTH)

    # Create SecretDisplay objects for sensitive data
    db_url_secret = SecretDisplay(DATABASE_URL, "database_url")
    auth_token_secret = SecretDisplay(auth_token, "auth_token")
    
    # Get masked displays
    DATABASE_URL_display = db_url_secret.get_masked_display()
    if len(DATABASE_URL_display) > CONTENT_WIDTH - 1: # -1 for the leading space
        DATABASE_URL_display = DATABASE_URL_display[:CONTENT_WIDTH - 4] + "..."

    truncated_token = auth_token_secret.get_masked_display()
    if len(truncated_token) > CONTENT_WIDTH -1:
        truncated_token = truncated_token[:CONTENT_WIDTH-4] + "..."

    line_DATABASE_URL_val = create_padded_line(f" {Colors.BRIGHT_CYAN}{DATABASE_URL_display}{Colors.ENDC}", CONTENT_WIDTH)
    line_auth_token_val = create_padded_line(f" {Colors.BRIGHT_CYAN}{truncated_token}{Colors.ENDC}", CONTENT_WIDTH)
    
    # Store secrets for potential reveal
    secrets_dict = {
        "database_url": db_url_secret,
        "auth_token": auth_token_secret
    }


    print(f"""
{Colors.BOLD}{Colors.OKGREEN}┌{'─' * CONTENT_WIDTH}┐
│{line_title}│
├{'─' * CONTENT_WIDTH}┤{Colors.ENDC}
{Colors.BOLD}{Colors.WHITE}│{line_db_name}│{Colors.ENDC}
{Colors.BOLD}{Colors.WHITE}│{line_created_at}│{Colors.ENDC}
{Colors.BOLD}{Colors.OKGREEN}├{'─' * CONTENT_WIDTH}┤{Colors.ENDC}
{Colors.BOLD}{Colors.WHITE}│ {url_var_name}: {' ' * (CONTENT_WIDTH - len(f"{url_var_name}: "))}│{Colors.ENDC}
|{Colors.BOLD}{Colors.WHITE}│{line_DATABASE_URL_val}│{Colors.ENDC}
|{Colors.BOLD}{Colors.WHITE}│{' ' * CONTENT_WIDTH}│{Colors.ENDC}
|{Colors.BOLD}{Colors.WHITE}│ {token_var_name}: {' ' * (CONTENT_WIDTH - len(f"{token_var_name}: "))}│{Colors.ENDC}
|{Colors.BOLD}{Colors.WHITE}│{line_auth_token_val}│{Colors.ENDC}
{Colors.BOLD}{Colors.OKGREEN}└{'─' * CONTENT_WIDTH}┘{Colors.ENDC}
""")
    
    # Return the secrets dict for use in main function
    return secrets_dict


def print_footer(db_name):
    """Print a beautiful, perfectly aligned footer."""
    line1_raw = "🎉 SUCCESS! Your Turso database is ready to use! 🎉"
    line2_raw = "📋 Credentials copied to clipboard"
    line3_raw = "🔧 Ready to paste into your .env file"
    line4_raw = "Much love xxx remcostoeten 💖"

    line1 = f"{Colors.BOLD}{Colors.OKGREEN}{line1_raw}{Colors.ENDC}".center(CONTENT_WIDTH + len(f"{Colors.BOLD}{Colors.OKGREEN}{Colors.ENDC}") - len(line1_raw))
    line2 = f"{Colors.BOLD}{Colors.CYAN}{line2_raw}{Colors.ENDC}".center(CONTENT_WIDTH + len(f"{Colors.BOLD}{Colors.CYAN}{Colors.ENDC}") - len(line2_raw))
    line3 = f"{Colors.BOLD}{Colors.ORANGE}{line3_raw}{Colors.ENDC}".center(CONTENT_WIDTH + len(f"{Colors.BOLD}{Colors.ORANGE}{Colors.ENDC}") - len(line3_raw))
    line4 = f"{Colors.BOLD}{Colors.WHITE}{line4_raw}{Colors.ENDC}".center(CONTENT_WIDTH + len(f"{Colors.BOLD}{Colors.WHITE}{Colors.ENDC}") - len(line4_raw))

    # --- Logic for two-line delete command ---
    # Line 5a: Informational text
    text_5a_plain = "🗑️ To delete this DB, run:"
    text_5a_content_colored = f"{Colors.FAIL}{text_5a_plain}{Colors.ENDC}"
    padding_5a = CONTENT_WIDTH - len(text_5a_plain) # Use plain length for padding calculation
    # Construct the full content for line 5a to be placed between box borders
    # It starts with its own color, then padding, then PURPLE for the right border effect
    line5a_for_box = f"{text_5a_content_colored}{' ' * max(0, padding_5a)}{Colors.PURPLE}"

    # Line 5b: The command itself
    indent = "  " # Indentation for the command line
    script_name = os.path.basename(sys.argv[0])

    cmd_part1_plain = f"python {script_name}"
    cmd_part1_colored = f"{Colors.BOLD}{Colors.WHITE}{cmd_part1_plain}{Colors.ENDC}" # Command in bold white

    cmd_part2_plain = " --delete-generation"
    cmd_part2_colored = f"{Colors.FAIL}{cmd_part2_plain}{Colors.ENDC}" # Flag in fail color

    text_5b_plain_for_padding = f"{indent}{cmd_part1_plain}{cmd_part2_plain}" # Full plain text for padding
    text_5b_content_colored = f"{indent}{cmd_part1_colored}{cmd_part2_colored}" # Full colored command

    padding_5b = CONTENT_WIDTH - len(text_5b_plain_for_padding) # Use plain length for padding
    # Construct the full content for line 5b
    line5b_for_box = f"{text_5b_content_colored}{' ' * max(0, padding_5b)}{Colors.PURPLE}"
    # --- End of two-line delete command logic ---

    print(f"""
{Colors.PURPLE}╔{'═' * CONTENT_WIDTH}╗
║{line1}║
║{' ' * CONTENT_WIDTH}║
║{line2}║
║{line3}║
║{' ' * CONTENT_WIDTH}║
║{line5a_for_box}║
║{line5b_for_box}║
║{' ' * CONTENT_WIDTH}║
║{line4}║
╚{'═' * CONTENT_WIDTH}╝{Colors.ENDC}
""")

def run_command(command, timeout=30):
    """Run a shell command and return its output and error (if any)."""
    result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=timeout)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

def save_last_generated_db(db_name):
    """Saves the last generated database name to a state file."""
    try:
        with open(STATE_FILE, "w") as f:
            json.dump({"last_database_name": db_name}, f)
    except Exception as e:
        print_warning(f"Could not save state file: {e}")

def read_last_generated_db():
    """Reads the last generated database name from the state file."""
    if not STATE_FILE.exists():
        return None
    try:
        with open(STATE_FILE, "r") as f:
            data = json.load(f)
            return data.get("last_database_name")
    except (json.JSONDecodeError, IOError) as e:
        print_warning(f"Could not read state file: {e}")
        # Optionally, delete corrupted state file
        # STATE_FILE.unlink(missing_ok=True)
        return None

def load_config():
    """Load configuration from the config file."""
    default_config = {
        "prompts": {
            "delete_generation": True,
            "open_turso_web": True,
            "paste_to_env": True,
            "reveal_secrets": True
        },
        "env_file": {
            "default_path": ".env",
            "default_env_dir": "./"
        },
        "defaults": {
            "auto_reveal": "off",
            "no_clipboard": False,
            "default_db_prefix": "",
            "env_url_name": "DATABASE_URL",
            "env_token_name": "TURSO_AUTH_TOKEN"
        },
        "seeding": {
            "default_mode": "off",
            "confirm_before_seed": True,
            "drizzle_config_path": "",
            "sql_migration_path": ""
        },
        "display": {
            "show_version_info": True,
            "use_colors": True,
            "content_width": 60
        }
    }
    
    if not CONFIG_FILE.exists():
        return default_config
    
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
        # Merge with defaults to ensure all keys exist
        merged_config = default_config.copy()
        merged_config.update(config)
        return merged_config
    except (json.JSONDecodeError, IOError) as e:
        print_warning(f"Could not read config file: {e}")
        return default_config

def save_config(config):
    """Save configuration to the config file."""
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        print_success("Configuration saved successfully!")
    except IOError as e:
        print_error(f"Could not save config file: {e}")

def configure_script():
    """Interactive configuration of the script."""
    print_section_divider("⚙️ SCRIPT CONFIGURATION")
    
    config = load_config()
    
    print_info("Configure script settings:")
    print(f"\n{Colors.BOLD}{Colors.WHITE}Post-completion prompts:{Colors.ENDC}")
    print(f"  1. Delete generation prompt: {Colors.CYAN}{'Enabled' if config['prompts']['delete_generation'] else 'Disabled'}{Colors.ENDC}")
    print(f"  2. Open Turso shell prompt: {Colors.CYAN}{'Enabled' if config['prompts']['open_turso_web'] else 'Disabled'}{Colors.ENDC}")
    print(f"  3. Paste to .env prompt: {Colors.CYAN}{'Enabled' if config['prompts']['paste_to_env'] else 'Disabled'}{Colors.ENDC}")
    print(f"  4. Reveal secrets prompt: {Colors.CYAN}{'Enabled' if config['prompts']['reveal_secrets'] else 'Disabled'}{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}{Colors.WHITE}Environment file settings:{Colors.ENDC}")
    print(f"  5. Default .env path: {Colors.CYAN}{config['env_file']['default_path']}{Colors.ENDC}")
    print(f"  6. Default .env directory: {Colors.CYAN}{config['env_file']['default_env_dir']}{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}{Colors.WHITE}Default behavior:{Colors.ENDC}")
    print(f"  7. Auto-reveal secrets: {Colors.CYAN}{config['defaults']['auto_reveal']}{Colors.ENDC}")
    print(f"  8. Skip clipboard by default: {Colors.CYAN}{'Yes' if config['defaults']['no_clipboard'] else 'No'}{Colors.ENDC}")
    print(f"  9. Default database prefix: {Colors.CYAN}{config['defaults']['default_db_prefix'] or 'None'}{Colors.ENDC}")
    print(f" 10. Default URL env var name: {Colors.CYAN}{config['defaults']['env_url_name']}{Colors.ENDC}")
    print(f" 11. Default token env var name: {Colors.CYAN}{config['defaults']['env_token_name']}{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}{Colors.WHITE}Seeding settings:{Colors.ENDC}")
    print(f" 12. Default seeding mode: {Colors.CYAN}{config['seeding']['default_mode']}{Colors.ENDC}")
    print(f" 13. Confirm before seed: {Colors.CYAN}{'Enabled' if config['seeding']['confirm_before_seed'] else 'Disabled'}{Colors.ENDC}")
    print(f" 14. Default Drizzle config path: {Colors.CYAN}{config['seeding']['drizzle_config_path'] or 'None'}{Colors.ENDC}")
    print(f" 15. Default SQL migration path: {Colors.CYAN}{config['seeding']['sql_migration_path'] or 'None'}{Colors.ENDC}")

    print(f"\n{Colors.BOLD}{Colors.WHITE}Display settings:{Colors.ENDC}")
    print(f" 16. Show version info: {Colors.CYAN}{'Enabled' if config['display']['show_version_info'] else 'Disabled'}{Colors.ENDC}")
    print(f" 17. Use colors: {Colors.CYAN}{'Enabled' if config['display']['use_colors'] else 'Disabled'}{Colors.ENDC}")
    print(f" 18. Content width: {Colors.CYAN}{config['display']['content_width']}{Colors.ENDC}")
    
    print("\nEnter the number to toggle/change, or press Enter to finish:")
    
    while True:
        try:
            choice = input(f"{Colors.BOLD}{Colors.ORANGE}Choice (1-18 or Enter): {Colors.ENDC}").strip()
            
            if not choice:
                break
            
            choice = int(choice)
            
            if choice == 1:
                config['prompts']['delete_generation'] = not config['prompts']['delete_generation']
                status = "Enabled" if config['prompts']['delete_generation'] else "Disabled"
                print(f"Delete generation prompt: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 2:
                config['prompts']['open_turso_web'] = not config['prompts']['open_turso_web']
                status = "Enabled" if config['prompts']['open_turso_web'] else "Disabled"
                print(f"Open Turso shell prompt: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 3:
                config['prompts']['paste_to_env'] = not config['prompts']['paste_to_env']
                status = "Enabled" if config['prompts']['paste_to_env'] else "Disabled"
                print(f"Paste to .env prompt: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 4:
                config['prompts']['reveal_secrets'] = not config['prompts']['reveal_secrets']
                status = "Enabled" if config['prompts']['reveal_secrets'] else "Disabled"
                print(f"Reveal secrets prompt: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 5:
                new_path = input(f"Enter new default .env filename [{config['env_file']['default_path']}]: ").strip()
                if new_path:
                    config['env_file']['default_path'] = new_path
                    print(f"Default .env path set to: {Colors.CYAN}{new_path}{Colors.ENDC}")
            elif choice == 6:
                new_dir = input(f"Enter new default .env directory [{config['env_file']['default_env_dir']}]: ").strip()
                if new_dir:
                    config['env_file']['default_env_dir'] = new_dir
                    print(f"Default .env directory set to: {Colors.CYAN}{new_dir}{Colors.ENDC}")
            elif choice == 7:
                current = config['defaults']['auto_reveal']
                new_value = 'on' if current == 'off' else 'off'
                config['defaults']['auto_reveal'] = new_value
                print(f"Auto-reveal secrets set to: {Colors.CYAN}{new_value}{Colors.ENDC}")
            elif choice == 8:
                config['defaults']['no_clipboard'] = not config['defaults']['no_clipboard']
                status = "Yes" if config['defaults']['no_clipboard'] else "No"
                print(f"Skip clipboard by default: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 9:
                new_prefix = input(f"Enter new default database prefix [{config['defaults']['default_db_prefix'] or 'None'}]: ").strip()
                config['defaults']['default_db_prefix'] = new_prefix
                display_prefix = new_prefix or 'None'
                print(f"Default database prefix set to: {Colors.CYAN}{display_prefix}{Colors.ENDC}")
            elif choice == 10:
                new_url_name = input(f"Enter new default URL env var name [{config['defaults']['env_url_name']}]: ").strip()
                if new_url_name:
                    config['defaults']['env_url_name'] = new_url_name
                    print(f"Default URL env var name set to: {Colors.CYAN}{new_url_name}{Colors.ENDC}")
            elif choice == 11:
                new_token_name = input(f"Enter new default token env var name [{config['defaults']['env_token_name']}]: ").strip()
                if new_token_name:
                    config['defaults']['env_token_name'] = new_token_name
                    print(f"Default token env var name set to: {Colors.CYAN}{new_token_name}{Colors.ENDC}")
            elif choice == 12:
                config['seeding']['default_mode'] = 'on' if config['seeding']['default_mode'] == 'off' else 'off'
                status = config['seeding']['default_mode']
                print(f"Default seeding mode: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 13:
                config['seeding']['confirm_before_seed'] = not config['seeding']['confirm_before_seed']
                status = "Enabled" if config['seeding']['confirm_before_seed'] else "Disabled"
                print(f"Confirm before seed: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 14:
                new_drizzle_path = input(f"Enter default Drizzle config path [{config['seeding']['drizzle_config_path']}]: ").strip()
                config['seeding']['drizzle_config_path'] = new_drizzle_path
                print(f"Default Drizzle config path set to: {Colors.CYAN}{new_drizzle_path or 'None'}{Colors.ENDC}")
            elif choice == 15:
                new_sql_path = input(f"Enter default SQL migration path [{config['seeding']['sql_migration_path']}]: ").strip()
                config['seeding']['sql_migration_path'] = new_sql_path
                print(f"Default SQL migration path set to: {Colors.CYAN}{new_sql_path or 'None'}{Colors.ENDC}")
            elif choice == 16:
                config['display']['show_version_info'] = not config['display']['show_version_info']
                status = "Enabled" if config['display']['show_version_info'] else "Disabled"
                print(f"Show version info: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 17:
                config['display']['use_colors'] = not config['display']['use_colors']
                status = "Enabled" if config['display']['use_colors'] else "Disabled"
                print(f"Use colors: {Colors.CYAN}{status}{Colors.ENDC}")
            elif choice == 18:
                try:
                    new_width = int(input(f"Enter new content width [{config['display']['content_width']}]: ").strip())
                    if 40 <= new_width <= 120:  # Reasonable bounds
                        config['display']['content_width'] = new_width
                        print(f"Content width set to: {Colors.CYAN}{new_width}{Colors.ENDC}")
                    else:
                        print_warning("Width must be between 40 and 120 characters.")
                except ValueError:
                    print_warning("Please enter a valid number.")
            else:
                print_warning("Invalid choice. Please enter 1-18.")
                
        except ValueError:
            print_warning("Invalid input. Please enter a number 1-18.")
        except KeyboardInterrupt:
            print_error("\nConfiguration cancelled.")
            return
    
    save_config(config)


def run_drizzle_seeding(db_name, DATABASE_URL, auth_token):
    """Run Drizzle seeding operations."""
    print_section_divider("🌱 DRIZZLE SEEDING")
    print_info("Checking for Drizzle configuration...")
    
    config = load_config()
    
    # Check if drizzle-kit is available
    drizzle_check, _, drizzle_code = run_command("npx drizzle-kit --version")
    if drizzle_code != 0:
        print_error("drizzle-kit not found. Please install it first:")
        print_info("npm install -g drizzle-kit")
        return False
    
    print_success("Drizzle-kit found.")
    
    # Determine Drizzle config file path
    drizzle_config_path = config['seeding']['drizzle_config_path']
    if drizzle_config_path:
        if not Path(drizzle_config_path).exists():
            print_warning(f"Configured Drizzle config path '{drizzle_config_path}' not found. Searching common locations...")
            drizzle_config_path = ""
    
    config_files = ["drizzle.config.ts", "drizzle.config.js", "drizzle.config.json"]
    if drizzle_config_path:
        config_files.insert(0, drizzle_config_path) # Prioritize configured path

    config_found = False
    for config_file in config_files:
        if Path(config_file).exists():
            print_success(f"Found Drizzle config: {Colors.CYAN}{config_file}{Colors.ENDC}")
            config_found = True
            break
    
    if not config_found:
        print_warning("No Drizzle config file found. Looking for schema files...")
        schema_patterns = ["**/schema.ts", "**/schema.js", "**/*schema*.ts", "**/*schema*.js"]
        schema_found = False
        for pattern in schema_patterns:
            import glob
            if glob.glob(pattern, recursive=True):
                schema_found = True
                break
        
        if not schema_found:
            print_error("No Drizzle schema files found. Please ensure you have a proper Drizzle setup.")
            return False
    
    # Ask user which operation to perform
    print(f"\n{Colors.BOLD}{Colors.WHITE}Choose Drizzle operation:{Colors.ENDC}")
    print(f"  1. {Colors.CYAN}drizzle-kit push{Colors.ENDC} - Push schema to database")
    print(f"  2. {Colors.CYAN}drizzle-kit migrate{Colors.ENDC} - Run migrations")
    print(f"  3. {Colors.CYAN}Both{Colors.ENDC} - Run push first, then migrate")
    
    try:
        choice = input(f"{Colors.BOLD}{Colors.ORANGE}Select option (1-3): {Colors.ENDC}").strip()
        
        # Set environment variables for the operations
        env_vars = os.environ.copy()
        env_vars['DATABASE_URL'] = DATABASE_URL
        env_vars['TURSO_AUTH_TOKEN'] = auth_token
        
        success = True
        
        if choice in ['1', '3']:
            print_info("Running drizzle-kit push...")
            push_output, push_error, push_code = run_command("npx drizzle-kit push")
            if push_code == 0:
                print_success("Drizzle push completed successfully!")
                if push_output:
                    print_info(f"Output: {push_output}")
            else:
                print_error(f"Drizzle push failed: {push_error}")
                success = False
        
        if choice in ['2', '3'] and success:
            print_info("Running drizzle-kit migrate...")
            migrate_output, migrate_error, migrate_code = run_command("npx drizzle-kit migrate")
            if migrate_code == 0:
                print_success("Drizzle migrate completed successfully!")
                if migrate_output:
                    print_info(f"Output: {migrate_output}")
            else:
                print_error(f"Drizzle migrate failed: {migrate_error}")
                success = False
        
        return success
        
    except KeyboardInterrupt:
        print_info("\nDrizzle seeding cancelled.")
        return False

def run_sql_seeding(db_name):
    """Run SQL file seeding operations."""
    print_section_divider("📄 SQL SEEDING")
    print_info("Looking for SQL migration files...")
    
    config = load_config()
    sql_migration_path = config['seeding']['sql_migration_path']

    sql_files = []
    if sql_migration_path:
        if Path(sql_migration_path).is_dir():
            import glob
            files = glob.glob(f"{sql_migration_path}/*.sql")
            sql_files.extend(files)
            if not sql_files:
                print_warning(f"No SQL files found in configured path: {Colors.CYAN}{sql_migration_path}{Colors.ENDC}")
        else:
            print_warning(f"Configured SQL migration path '{sql_migration_path}' is not a directory. Searching common locations...")

    # Look for SQL files in common directories if no specific path was configured or found
    if not sql_files:
        sql_patterns = [
            "migrations/*.sql",
            "db/migrations/*.sql",
            "database/migrations/*.sql",
            "sql/*.sql",
            "*.sql"
        ]
        
        for pattern in sql_patterns:
            import glob
            files = glob.glob(pattern, recursive=True)
            sql_files.extend(files)
    
    if not sql_files:
        print_warning("No SQL files found in common directories.")
        try:
            custom_path = input(f"{Colors.BOLD}{Colors.ORANGE}Enter path to SQL files (or Enter to skip): {Colors.ENDC}").strip()
            if custom_path:
                import glob
                custom_files = glob.glob(f"{custom_path}/*.sql")
                sql_files.extend(custom_files)
        except KeyboardInterrupt:
            print_info("\nSQL seeding cancelled.")
            return False
    
    if not sql_files:
        print_error("No SQL files found to apply.")
        return False
    
    # Sort files to ensure proper order
    sql_files.sort()
    
    print_success(f"Found {len(sql_files)} SQL file(s):")
    for i, file in enumerate(sql_files, 1):
        print(f"  {i}. {Colors.CYAN}{file}{Colors.ENDC}")
    
    try:
        confirm = input(f"\n{Colors.BOLD}{Colors.ORANGE}Apply these SQL files to {db_name}? (y/N): {Colors.ENDC}").strip().lower()
        if confirm != 'y':
            print_info("SQL seeding cancelled.")
            return False
        
        # Apply each SQL file using turso db shell
        success_count = 0
        for sql_file in sql_files:
            print_info(f"Applying {Colors.CYAN}{sql_file}{Colors.ENDC}...")
            try:
                with open(sql_file, 'r') as f:
                    sql_content = f.read()
                
                # Use turso db shell with the SQL content
                shell_cmd = f'echo "{sql_content}" | turso db shell {db_name}'
                output, error, code = run_command(shell_cmd)
                
                if code == 0:
                    print_success(f"Applied {sql_file}")
                    success_count += 1
                else:
                    print_error(f"Failed to apply {sql_file}: {error}")
                    
            except Exception as e:
                print_error(f"Error reading {sql_file}: {e}")
        
        if success_count == len(sql_files):
            print_success(f"All {success_count} SQL files applied successfully!")
            return True
        else:
            print_warning(f"Applied {success_count}/{len(sql_files)} files successfully.")
            return success_count > 0
            
    except KeyboardInterrupt:
        print_info("\nSQL seeding cancelled.")
        return False

def run_interactive_seeding(db_name, DATABASE_URL, auth_token):
    """Interactive seeding mode - let user choose."""
    print_section_divider("🎯 INTERACTIVE SEEDING")
    print_info("Choose your seeding method:")
    
    print(f"\n{Colors.BOLD}{Colors.WHITE}Available seeding options:{Colors.ENDC}")
    print(f"  1. {Colors.CYAN}Drizzle{Colors.ENDC} - Run drizzle-kit push/migrate")
    print(f"  2. {Colors.CYAN}SQL{Colors.ENDC} - Apply local SQL migration files")
    print(f"  3. {Colors.CYAN}Both{Colors.ENDC} - Run Drizzle first, then SQL")
    print(f"  4. {Colors.CYAN}Skip{Colors.ENDC} - Skip seeding")
    
    try:
        choice = input(f"\n{Colors.BOLD}{Colors.ORANGE}Select option (1-4): {Colors.ENDC}").strip()
        
        if choice == '1':
            return run_drizzle_seeding(db_name, DATABASE_URL, auth_token)
        elif choice == '2':
            return run_sql_seeding(db_name)
        elif choice == '3':
            drizzle_success = run_drizzle_seeding(db_name, DATABASE_URL, auth_token)
            if drizzle_success:
                return run_sql_seeding(db_name)
            else:
                print_warning("Skipping SQL seeding due to Drizzle failure.")
                return False
        elif choice == '4':
            print_info("Seeding skipped.")
            return True
        else:
            print_warning("Invalid choice. Skipping seeding.")
            return True
            
    except KeyboardInterrupt:
        print_info("\nSeeding cancelled.")
        return True

def handle_seeding(seed_mode, db_name, DATABASE_URL, auth_token):
    """Handle seeding based on the provided mode."""
    if not seed_mode:
        return True  # No seeding requested
    
    print_info(f"Starting database seeding with mode: {Colors.CYAN}{seed_mode}{Colors.ENDC}")
    
    if seed_mode == 'drizzle':
        return run_drizzle_seeding(db_name, DATABASE_URL, auth_token)
    elif seed_mode == 'sql':
        return run_sql_seeding(db_name)
    elif seed_mode == 'interactive':
        return run_interactive_seeding(db_name, DATABASE_URL, auth_token)
    else:
        print_error(f"Unknown seeding mode: {seed_mode}")
        return False

def post_completion_prompts(db_name, DATABASE_URL, auth_token):
    """Handle post-completion prompts based on configuration."""
    config = load_config()
    
    # Show a beautifully styled options panel
    options_title = "💡 ADDITIONAL OPTIONS AVAILABLE"
    option1 = "🗑️  Delete this database"
    option2 = "🔧 Open database shell"
    option3 = "💾 Save to .env file"
    
    # Calculate padding for centering
    title_padding = (CONTENT_WIDTH - len(options_title)) // 2
    option_padding = 3  # Left padding for options
    
    print(f"""
{Colors.PURPLE}╔{'═' * CONTENT_WIDTH}╗
║{' ' * title_padding}{Colors.BOLD}{Colors.WHITE}{options_title}{Colors.ENDC}{Colors.PURPLE}{' ' * (CONTENT_WIDTH - title_padding - len(options_title))}║
║{' ' * CONTENT_WIDTH}║
║{' ' * option_padding}{Colors.CYAN}{option1}{Colors.ENDC}{Colors.PURPLE}{' ' * (CONTENT_WIDTH - option_padding - len(option1))}║
║{' ' * option_padding}{Colors.CYAN}{option2}{Colors.ENDC}{Colors.PURPLE}{' ' * (CONTENT_WIDTH - option_padding - len(option2))}║
║{' ' * option_padding}{Colors.CYAN}{option3}{Colors.ENDC}{Colors.PURPLE}{' ' * (CONTENT_WIDTH - option_padding - len(option3))}║
║{' ' * CONTENT_WIDTH}║
╚{'═' * CONTENT_WIDTH}╝{Colors.ENDC}""")
    
    try:
        options_choice = input(f"\n{Colors.BOLD}{Colors.ORANGE}Press 'o' to access options or Enter to finish: {Colors.ENDC}").strip().lower()
        
        if options_choice != 'o':
            return  # Exit if user doesn't want options
            
    except KeyboardInterrupt:
        print_info("\nFinishing...")
        return
    
    # Only show the options section if user pressed 'o'
    print_section_divider("🎯 POST-COMPLETION OPTIONS")
    
    # Delete generation prompt
    if config['prompts']['delete_generation']:
        try:
            delete_choice = input(f"{Colors.BOLD}{Colors.ORANGE}Delete this generation? (y/N): {Colors.ENDC}").strip().lower()
            if delete_choice == 'y':
                if delete_database(db_name):
                    print_success("Database deleted successfully!")
                    try:
                        STATE_FILE.unlink(missing_ok=True)
                        print_info("State file cleared.")
                    except OSError as e:
                        print_warning(f"Could not remove state file: {e}")
                    return  # Exit early if database was deleted
        except KeyboardInterrupt:
            print_info("\nSkipping delete prompt.")
    
    # Open Turso shell prompt
    if config['prompts']['open_turso_web']:
        try:
            shell_choice = input(f"{Colors.BOLD}{Colors.ORANGE}Open database shell connection? (y/N): {Colors.ENDC}").strip().lower()
            if shell_choice == 'y':
                try:
                    print_success("Opening Turso database shell...")
                    print_info(f"Connecting to database: {Colors.CYAN}{db_name}{Colors.ENDC}")
                    print_info("Type '.quit' or '.exit' to close the shell.")
                    print("\n" + "="*60)
                    
                    # Use subprocess.call for interactive shell
                    import subprocess
                    result = subprocess.call(["turso", "db", "shell", db_name])
                    
                    print("\n" + "="*60)
                    if result == 0:
                        print_success("Shell session completed.")
                    else:
                        print_warning("Shell session ended with non-zero exit code.")
                        
                except Exception as e:
                    print_error(f"Could not open database shell: {e}")
                    print_info(f"Manual command: {Colors.CYAN}turso db shell {db_name}{Colors.ENDC}")
        except KeyboardInterrupt:
            print_info("\nSkipping shell prompt.")
    
    # Paste to .env prompt
    if config['prompts']['paste_to_env']:
        try:
            env_choice = input(f"{Colors.BOLD}{Colors.ORANGE}Paste credentials to .env file? (y/N): {Colors.ENDC}").strip().lower()
            if env_choice == 'y':
                # Get the default path from config
                default_env_path = config['env_file']['default_path']
                default_env_dir = config['env_file']['default_env_dir']
                
                suggested_path = f"{default_env_dir.rstrip('/')}/{default_env_path}"
                env_path = input(f"{Colors.BOLD}{Colors.ORANGE}Enter .env file path [{suggested_path}]: {Colors.ENDC}").strip()
                
                if not env_path:
                    env_path = suggested_path
                
                try:
                    env_file_path = Path(env_path)
                    env_file_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Check if file exists and ask for overwrite
                    if env_file_path.exists():
                        overwrite = input(f"{Colors.BOLD}{Colors.ORANGE}File exists. Append to existing file? (Y/n): {Colors.ENDC}").strip().lower()
                        mode = 'a' if overwrite != 'n' else 'w'
                    else:
                        mode = 'w'
                    
                    with open(env_file_path, mode) as f:
                        if mode == 'a':
                            f.write("\n\n# Turso Credentials (added by script)\n")
                        else:
                            f.write("# Turso Credentials (generated by script)\n")
                        f.write(f"# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                        f.write(f"DATABASE_URL={DATABASE_URL}\n")
                        f.write(f"TURSO_AUTH_TOKEN={auth_token}\n")
                    
                    print_success(f"Credentials {'appended to' if mode == 'a' else 'written to'} {Colors.CYAN}{env_file_path}{Colors.ENDC}")
                    
                except IOError as e:
                    print_error(f"Could not write to {env_path}: {e}")
                    
        except KeyboardInterrupt:
            print_info("\nSkipping .env prompt.")

def check_database_exists(db_name):
    """Check if a database with the given name already exists."""
    print_info(f"Checking if database '{Colors.CYAN}{db_name}{Colors.ENDC}' already exists...")
    
    output, error, code = run_command("turso db list")
    if code != 0:
        print_warning("Could not fetch database list for existence check.")
        if error: print_warning(f"Turso CLI Error: {error}")
        return False  # Assume it doesn't exist if we can't check
    
    # Parse the table output to check for database name
    lines = output.strip().split('\n')
    if len(lines) < 2:  # No databases
        return False
    
    # Skip header line and check each database entry
    for line in lines[1:]:
        line = line.strip()
        if not line:  # Skip empty lines
            continue
        
        # Skip duplicate header lines that sometimes appear
        if line.startswith("NAME") and "GROUP" in line and "URL" in line:
            continue
            
        # Split by whitespace and get the first column (database name)
        parts = line.split()
        if len(parts) >= 1:
            existing_name = parts[0]
            if existing_name == db_name:
                return True
    
    return False

def delete_database(db_name):
    """Deletes a Turso database."""
    print_info(f"Attempting to delete database: {Colors.CYAN}{db_name}{Colors.ENDC}")
    command = f"turso db destroy {db_name} --yes" # --yes confirms deletion

    output, error, code = run_command(command, timeout=60)

    # Turso CLI might change its output format slightly.
    # Check for common success indicators.
    if code == 0 and (f"Destroyed database {db_name}" in output or "successfully deleted" in output.lower()):
        print_success(f"Successfully deleted database '{Colors.CYAN}{db_name}{Colors.ENDC}'")
        return True
    else:
        print_error(f"Failed to delete database '{Colors.CYAN}{db_name}{Colors.ENDC}'")
        # Provide more detailed error output from Turso CLI
        if error: print_error(f"Turso CLI Error: {error}")
        if output: print_info(f"Turso CLI Output: {output}")
        return False

def delete_last_generated_db():
    """Handler for the --delete-generation flag."""
    print_section_divider("🗑️ Delete Last Generated Database")
    db_name = read_last_generated_db()
    if not db_name:
        print_error("No previously generated database found to delete.")
        print_info(f"State file ({STATE_FILE}) not found, empty, or unreadable.")
        sys.exit(1)

    if delete_database(db_name):
        try:
            STATE_FILE.unlink() # Remove state file after successful deletion
            print_info("Cleared state file for the deleted database.")
        except OSError as e:
            print_warning(f"Could not remove state file {STATE_FILE}: {e}")
    else:
        sys.exit(1) # Exit if deletion failed

def fetch_all_database_details(lazy=False, page_size=25):
    """Fetch details for all databases with optional lazy loading."""
    print_info("Fetching database list...")
    output, error, code = run_command("turso db list")
    if code != 0:
        print_error("Failed to fetch database list.")
        if error: print_error(f"Turso CLI Error: {error}")
        return []
    
    # Parse the table output to get database names
    lines = output.strip().split('\n')
    if len(lines) < 2:  # No databases (just header or empty)
        print_warning("No databases found.")
        return []
    
    db_list = []
    # Skip header line and parse each database entry
    for line in lines[1:]:
        line = line.strip()
        if not line:  # Skip empty lines
            continue
        
        # Skip duplicate header lines that sometimes appear
        if line.startswith("NAME") and "GROUP" in line and "URL" in line:
            continue
            
        # Split by whitespace - Turso output format is: NAME GROUP URL
        parts = line.split()
        if len(parts) >= 3:  # We need at least name, group, and URL
            db_name = parts[0]
            db_group = parts[1]
            
            db_list.append({
                "name": db_name,
                "selected": False,
                "group": db_group,
                "size": "Loading...",
                "details_loaded": False
            })
    
    if not db_list:
        print_warning("No databases found.")
        return []
    
    print_info(f"Found {Colors.CYAN}{len(db_list)}{Colors.ENDC} databases.")
    
    if not lazy:
        # Load all details at once (original behavior)
        print_info("Loading database details...")
        load_database_details_batch(db_list, 0, len(db_list))
    else:
        # Only load details for the first page
        print_info(f"Loading details for first {page_size} databases...")
        load_database_details_batch(db_list, 0, min(page_size, len(db_list)))
    
    return db_list

def load_database_details_batch(db_list, start_idx, end_idx):
    """Load database details for a specific batch of databases."""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    batch = db_list[start_idx:end_idx]
    unloaded = [db for db in batch if not db.get("details_loaded", False)]
    
    if not unloaded:
        return  # All details already loaded
    
    def fetch_db_details(db_data):
        if db_data.get("details_loaded", False):
            return db_data
            
        name = db_data["name"]
        output, error, code = run_command(f"turso db show {name}")
        if code == 0:
            try:
                # Parse the text output to extract size
                size_match = re.search(r'Size:\s+([\d.]+\s*[KMGTP]?B)', output)
                size = size_match.group(1) if size_match else "Unknown"
                
                # Parse group if available in output
                group_match = re.search(r'Group:\s+(\w+)', output)
                group = group_match.group(1) if group_match else db_data.get("group", "default")
                
                db_data["group"] = group
                db_data["size"] = size
                db_data["details_loaded"] = True
            except Exception as e:
                db_data["group"] = db_data.get("group", "Error")
                db_data["size"] = "Error"
                db_data["details_loaded"] = True
        else:
            db_data["group"] = db_data.get("group", "Error")
            db_data["size"] = "Error"
            db_data["details_loaded"] = True
        return db_data
    
    # Use thread pool to fetch details in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_db_details, db): db for db in unloaded}
        
        completed = 0
        for future in as_completed(futures):
            completed += 1
            # Update progress
            print(f"\r{Colors.GRAY}Loading: [{completed}/{len(unloaded)}]{Colors.ENDC}", end='', flush=True)
    
    print("\r" + " " * 50 + "\r", end='')  # Clear progress line

def get_database_details(db_name):
    """Get detailed information about a database including size."""
    show_output, show_error, show_code = run_command(f"turso db show {db_name}", timeout=30)
    if show_code != 0:
        return None
    
    # Extract size from output
    size_match = re.search(r'Size:\s+([\d.]+\s*[KMGTP]?B)', show_output)
    size = size_match.group(1) if size_match else "Unknown"
    
    return {"size": size}

    """Interactive deletion with lazy loading support."""
    databases = fetch_all_database_details(lazy=True, page_size=25)

    if not databases:
        print_warning("No databases available to delete.")
        return

    # Pagination setup
    page_size = 25
    current_page = 0
    total_pages = math.ceil(len(databases) / page_size)

    print_info("\nUse the following controls:")
    print(f"  {Colors.CYAN}↑/↓{Colors.ENDC} or {Colors.CYAN}j/k{Colors.ENDC} - Navigate")
    print(f"  {Colors.CYAN}SPACE{Colors.ENDC} - Toggle selection")
    print(f"  {Colors.CYAN}a{Colors.ENDC} - Select all on page")
    print(f"  {Colors.CYAN}d{Colors.ENDC} - Deselect all on page")
    print(f"  {Colors.CYAN}n/p{Colors.ENDC} - Next/Previous page")
    print(f"  {Colors.CYAN}ENTER{Colors.ENDC} - Confirm deletion")
    print(f"  {Colors.CYAN}q{Colors.ENDC} or {Colors.CYAN}ESC{Colors.ENDC} - Cancel")

    current_index = 0

    def display_page():
        # Load details for current page if not already loaded
        start_idx = current_page * page_size
        end_idx = min(start_idx + page_size, len(databases))
        load_database_details_batch(databases, start_idx, end_idx)

        os.system('clear' if os.name == 'posix' else 'cls')
        print_section_divider("🗑️  INTERACTIVE DATABASE DELETION")

        start_idx = current_page * page_size
        end_idx = min(start_idx + page_size, len(databases))

        # Header
        print(f"\n{Colors.BOLD}{Colors.WHITE}Page {current_page + 1}/{total_pages} - {len(databases)} total databases{Colors.ENDC}")
        print(f"{Colors.GRAY}{'─' * 80}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.WHITE}{'':4} {'Database Name':<25} {'Group':<12} {'Size':<10}{Colors.ENDC}")
        print(f"{Colors.GRAY}{'─' * 80}{Colors.ENDC}")

        # Display databases
        for i in range(start_idx, end_idx):
            db = databases[i]
            is_current = (i == current_index)
            is_selected = db["selected"]

            # Selection indicator
            selection = "[✓]" if is_selected else "[ ]"
            
            # Truncate long names if necessary
            db_name = db['name'][:24] if len(db['name']) > 24 else db['name']
            db_group = db['group'][:11] if len(db['group']) > 11 else db['group']
            db_size = db['size'][:9] if len(db['size']) > 9 else db['size']

            # Format the line
            if is_current:
                # Current selection - highlight entire line
                if is_selected:
                    print(f"{Colors.OKGREEN}▶ {selection} {db_name:<25} {db_group:<12} {db_size:<10}{Colors.ENDC}")
                else:
                    print(f"{Colors.YELLOW}▶ {selection} {db_name:<25} {db_group:<12} {db_size:<10}{Colors.ENDC}")
            else:
                # Regular line
                if is_selected:
                    print(f"  {Colors.CYAN}{selection} {db_name:<25} {db_group:<12} {db_size:<10}{Colors.ENDC}")
                else:
                    print(f"  {selection} {db_name:<25} {Colors.GRAY}{db_group:<12} {db_size:<10}{Colors.ENDC}")

        # Footer with selected count and instructions
        selected_count = sum(1 for db in databases if db["selected"])
        print(f"{Colors.GRAY}{'─' * 80}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.ORANGE}Selected: {selected_count} database(s){Colors.ENDC}")
        
        if selected_count > 0:
            print(f"\n{Colors.WARNING}⚠️  Press ENTER to delete {selected_count} selected database(s){Colors.ENDC}")
        else:
            print(f"\n{Colors.GRAY}Use SPACE to select databases, ENTER to delete selected{Colors.ENDC}")

    # Enable raw input mode for single keypress detection
    import termios, tty
    old_settings = termios.tcgetattr(sys.stdin)

    try:
        tty.setraw(sys.stdin.fileno())

        while True:
            display_page()

            # Read single character
            char = sys.stdin.read(1)

            if char == '\x1b':  # ESC sequence
                next_char = sys.stdin.read(1)
                if next_char == '[':  # Arrow keys
                    arrow = sys.stdin.read(1)
                    if arrow == 'A':  # Up arrow
                        if current_index > 0:
                            current_index -= 1
                            if current_index < current_page * page_size:
                                current_page -= 1
                    elif arrow == 'B':  # Down arrow
                        if current_index < len(databases) - 1:
                            current_index += 1
                            if current_index >= (current_page + 1) * page_size:
                                current_page += 1
                else:
                    # Just ESC pressed - quit
                    break

            elif char == ' ':  # Space - toggle selection
                databases[current_index]["selected"] = not databases[current_index]["selected"]

            elif char == 'j' or char == 'J':  # Move down
                if current_index < len(databases) - 1:
                    current_index += 1
                    if current_index >= (current_page + 1) * page_size:
                        current_page += 1

            elif char == 'k' or char == 'K':  # Move up
                if current_index > 0:
                    current_index -= 1
                    if current_index < current_page * page_size:
                        current_page -= 1

            elif char == 'n' or char == 'N':  # Next page
                if current_page < total_pages - 1:
                    current_page += 1
                    current_index = current_page * page_size
                    # Pre-load next page details
                    next_start = (current_page + 1) * page_size
                    if next_start < len(databases):
                        next_end = min(next_start + page_size, len(databases))
                        load_database_details_batch(databases, next_start, next_end)

            elif char == 'p' or char == 'P':  # Previous page
                if current_page > 0:
                    current_page -= 1
                    current_index = current_page * page_size

            elif char == 'a' or char == 'A':  # Select all on page
                start_idx = current_page * page_size
                end_idx = min(start_idx + page_size, len(databases))
                for i in range(start_idx, end_idx):
                    databases[i]["selected"] = True

            elif char == 'd' or char == 'D':  # Deselect all on page
                start_idx = current_page * page_size
                end_idx = min(start_idx + page_size, len(databases))
                for i in range(start_idx, end_idx):
                    databases[i]["selected"] = False

            elif char == '\r' or char == '\n':  # Enter - confirm deletion
                selected_dbs = [db for db in databases if db["selected"]]
                if selected_dbs:
                    # Restore terminal settings temporarily for input
                    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)

                    os.system('clear' if os.name == 'posix' else 'cls')
                    print_section_divider("🚨 CONFIRM DELETION")
                    print_warning("You are about to PERMANENTLY delete the following databases:")
                    for db in selected_dbs:
                        print(f"  - {Colors.BOLD}{Colors.FAIL}{db['name']}{Colors.ENDC} (Size: {db['size']})")

                    confirm = input(f"\n{Colors.BOLD}{Colors.ORANGE}Type 'DELETE' to confirm deletion: {Colors.ENDC}").strip()

                    if confirm == 'DELETE':
                        print_info("\nProceeding with deletion...")
                        all_successful = True
                        for db in selected_dbs:
                            if not delete_database(db['name']):
                                all_successful = False

                        if all_successful:
                            print_success("\nAll selected databases have been deleted.")
                        else:
                            print_warning("\nSome databases could not be deleted. Check messages above.")

                        input(f"\n{Colors.BOLD}{Colors.GRAY}Press Enter to exit...{Colors.ENDC}")
                        break
                    else:
                        print_info("\nDeletion cancelled.")
                        # Re-enable raw mode
                        tty.setraw(sys.stdin.fileno())

            elif char == 'q' or char == 'Q':  # Quit
                break

            elif char == '\x03':  # Ctrl+C
                raise KeyboardInterrupt

    except KeyboardInterrupt:
        print_error("\n\nOperation cancelled by user.")
    finally:
        # Restore terminal settings
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
        print("\n")  # Ensure we're on a new line


def check_dependencies():
    """Check if required dependencies are installed with comprehensive safety guards."""
    print_step(1, 6, "Checking system dependencies...")
    
    missing_deps = []
    warnings = []
    
    # Check Turso CLI
    turso_output, turso_error, turso_code = run_command("turso --version")
    if turso_code != 0:
        missing_deps.append({
            "name": "Turso CLI",
            "install_cmd": "curl -sSfL https://get.tur.so/install.sh | bash",
            "docs": "https://docs.turso.tech/reference/turso-cli",
            "reason": "Required for database operations"
        })
    else:
        turso_version = turso_output.split('\n')[0] if turso_output else "Unknown version"
        print_success(f"Turso CLI found: {Colors.CYAN}{turso_version}{Colors.ENDC}")
    
    # Check pyperclip functionality
    clipboard_available = False
    try:
        pyperclip.copy("test_clipboard_turso_gen")
        if pyperclip.paste() == "test_clipboard_turso_gen":
            print_success("Clipboard functionality available.")
            clipboard_available = True
        else:
            raise pyperclip.PyperclipException("Paste check failed")
    except Exception as e:
        warnings.append({
            "message": f"Clipboard functionality limited: {e}",
            "solutions": get_clipboard_solutions()
        })
    
    # Check Python version
    python_version = sys.version_info
    if python_version < (3, 6):
        missing_deps.append({
            "name": "Python 3.6+",
            "install_cmd": "Please upgrade Python",
            "docs": "https://python.org/downloads",
            "reason": "Script requires Python 3.6 or higher"
        })
    else:
        print_success(f"Python version: {Colors.CYAN}{python_version.major}.{python_version.minor}.{python_version.micro}{Colors.ENDC}")
    
    # Handle missing dependencies
    if missing_deps:
        print_section_divider("❌ MISSING DEPENDENCIES")
        print_error("Some required dependencies are missing:")
        
        for dep in missing_deps:
            print(f"\n{Colors.BOLD}{Colors.FAIL}• {dep['name']}{Colors.ENDC}")
            print(f"  {Colors.GRAY}Reason: {dep['reason']}{Colors.ENDC}")
            print(f"  {Colors.CYAN}Install: {dep['install_cmd']}{Colors.ENDC}")
            print(f"  {Colors.GRAY}Docs: {dep['docs']}{Colors.ENDC}")
        
        print(f"\n{Colors.BOLD}{Colors.ORANGE}Please install the missing dependencies and try again.{Colors.ENDC}")
        
        # Offer to create installation script
        try:
            create_installer = input(f"\n{Colors.BOLD}{Colors.ORANGE}Create installation script? (y/N): {Colors.ENDC}").strip().lower()
            if create_installer == 'y':
                create_installation_script(missing_deps)
        except KeyboardInterrupt:
            pass
        
        sys.exit(1)
    
    # Handle warnings (non-fatal issues)
    if warnings:
        for warning in warnings:
            print_warning(warning["message"])
            for solution in warning["solutions"]:
                print_info(solution)
    
    return clipboard_available

def get_clipboard_solutions():
    """Get platform-specific clipboard solutions."""
    import platform
    system = platform.system().lower()
    
    if system == "linux":
        return [
            "For Linux, install xclip: sudo apt-get install xclip",
            "Or install xsel: sudo apt-get install xsel",
            "For Wayland: sudo apt-get install wl-clipboard"
        ]
    elif system == "darwin":  # macOS
        return [
            "macOS clipboard should work by default",
            "If issues persist, try: pip install pyobjc-framework-Cocoa"
        ]
    elif system == "windows":
        return [
            "Windows clipboard should work by default",
            "If issues persist, try running as administrator"
        ]
    else:
        return ["Please check your system's clipboard manager"]

def create_installation_script(missing_deps):
    """Create a platform-specific installation script."""
    import platform
    system = platform.system().lower()
    
    if system == "linux":
        script_name = "install_dependencies.sh"
        script_content = "#!/bin/bash\nset -e\necho 'Installing Turso DB Creator CLI dependencies...'\n\n"
        
        for dep in missing_deps:
            if "Turso CLI" in dep["name"]:
                script_content += "# Install Turso CLI\n"
                script_content += dep["install_cmd"] + "\n\n"
        
        script_content += "# Install Python dependencies\n"
        script_content += "pip install pyperclip rich\n\n"
        script_content += "# Install clipboard dependencies\n"
        script_content += "sudo apt-get update\n"
        script_content += "sudo apt-get install -y xclip xsel\n\n"
        script_content += "echo 'Dependencies installed successfully!'\n"
        
    elif system == "darwin":  # macOS
        script_name = "install_dependencies.sh"
        script_content = "#!/bin/bash\nset -e\necho 'Installing Turso DB Creator CLI dependencies...'\n\n"
        
        for dep in missing_deps:
            if "Turso CLI" in dep["name"]:
                script_content += "# Install Turso CLI\n"
                script_content += dep["install_cmd"] + "\n\n"
        
        script_content += "# Install Python dependencies\n"
        script_content += "pip install pyperclip rich\n\n"
        script_content += "echo 'Dependencies installed successfully!'\n"
        
    else:  # Windows or others
        script_name = "install_dependencies.bat"
        script_content = "@echo off\necho Installing Turso DB Creator CLI dependencies...\n\n"
        script_content += "pip install pyperclip rich\n\n"
        script_content += "echo Please install Turso CLI manually from: https://docs.turso.tech/reference/turso-cli\n"
        script_content += "pause\n"
    
    try:
        with open(script_name, 'w') as f:
            f.write(script_content)
        
        if system != "windows":
            os.chmod(script_name, 0o755)
        
        print_success(f"Installation script created: {Colors.CYAN}{script_name}{Colors.ENDC}")
        print_info(f"Run it with: {Colors.BOLD}./{script_name}{Colors.ENDC}")
        
    except IOError as e:
        print_error(f"Could not create installation script: {e}")









def main():
    script_name = os.path.basename(sys.argv[0])
    parser = argparse.ArgumentParser(
        description=f'{Colors.BOLD}{Colors.ORANGE}Turso Database & Token Generator{Colors.ENDC} - Automate Turso DB tasks.',
        formatter_class=argparse.RawTextHelpFormatter, # Allows for better formatting in help
        epilog=f"""
{Colors.BOLD}{Colors.WHITE}Examples:{Colors.ENDC}
  {Colors.CYAN}python {script_name}{Colors.ENDC}
    {Colors.GRAY}# Generate a new database, display credentials, and copy to clipboard.{Colors.ENDC}

  {Colors.CYAN}python {script_name} --overwrite .env.local{Colors.ENDC}
    {Colors.GRAY}# Generate a new database and update/create '.env.local' in the project root.{Colors.ENDC}

  {Colors.CYAN}python {script_name} --no-clipboard{Colors.ENDC}
    {Colors.GRAY}# Generate a new database but do not copy credentials to clipboard.{Colors.ENDC}

{Colors.BOLD}{Colors.OKGREEN}Database Seeding:{Colors.ENDC}
  {Colors.CYAN}python {script_name} --seed{Colors.ENDC}
    {Colors.GRAY}# Generate database and prompt for seeding method (interactive mode).{Colors.ENDC}

  {Colors.CYAN}python {script_name} --seed drizzle{Colors.ENDC}
    {Colors.GRAY}# Generate database and run Drizzle migrations (drizzle-kit push/migrate).{Colors.ENDC}

  {Colors.CYAN}python {script_name} --seed sql{Colors.ENDC}
    {Colors.GRAY}# Generate database and apply local SQL migration files via Turso shell.{Colors.ENDC}

{Colors.BOLD}{Colors.ORANGE}Configuration:{Colors.ENDC}
  {Colors.CYAN}python {script_name} --configure{Colors.ENDC}
    {Colors.GRAY}# Open interactive configuration menu to set preferences and disable prompts.{Colors.ENDC}

{Colors.BOLD}{Colors.FAIL}Deletion Commands:{Colors.ENDC}
  {Colors.CYAN}python {script_name} --delete-generation{Colors.ENDC}
    {Colors.GRAY}# Delete the last database specifically created by this script (if tracked).{Colors.ENDC}

  {Colors.CYAN}python {script_name} --delete-interactive{Colors.ENDC}
    {Colors.GRAY}# Show an interactive menu to select and delete any of your Turso databases.{Colors.ENDC}

{Colors.BOLD}{Colors.GRAY}Note: The --seed flag replaces previous --migrate-* variants.{Colors.ENDC}
        """
    )
    parser.add_argument('--name', metavar='DB_NAME',
                       help='Custom name for the database. If not provided, Turso will generate a random name.')
    parser.add_argument('--overwrite', metavar='FILENAME',
                       help='Filename (e.g., .env or .env.production) to update/create in project root.')
    parser.add_argument('--no-clipboard', action='store_true',
                       help='Skip copying credentials to the clipboard.')
    parser.add_argument('--auto-reveal', choices=['on', 'off'], default='off',
                       help='Automatically reveal secrets without prompting. Default: off')
    parser.add_argument('--env-url-name', metavar='VAR_NAME', default='DATABASE_URL',
                       help='Custom name for the database URL environment variable. Default: DATABASE_URL')
    parser.add_argument('--env-token-name', metavar='VAR_NAME', default='TURSO_AUTH_TOKEN',
                       help='Custom name for the auth token environment variable. Default: TURSO_AUTH_TOKEN')
    parser.add_argument('--configure', action='store_true',
                       help='Open configuration menu to set preferences.')
    parser.add_argument('--seed', nargs='?', const='interactive', 
                       choices=['drizzle', 'sql', 'interactive'], metavar='MODE',
                       help='Run database seeding after creation. MODE can be: drizzle (run drizzle-kit push/migrate), sql (apply local SQL files), or interactive (choose method). If no mode specified, falls back to configuration or prompts user.')

    delete_group = parser.add_argument_group(f'{Colors.BOLD}{Colors.FAIL}Deletion Options{Colors.ENDC} (use one at a time)')
    delete_group.add_argument('--delete-generation', action='store_true',
                              help='Delete the last database created by THIS script (uses state file).')

    args = parser.parse_args()
    
    # Load configuration and apply defaults if arguments weren't explicitly provided
    config = load_config()
    
    # Apply configuration defaults if arguments weren't explicitly set
    if '--auto-reveal' not in sys.argv:
        args.auto_reveal = config['defaults']['auto_reveal']
    
    if '--no-clipboard' not in sys.argv and config['defaults']['no_clipboard']:
        args.no_clipboard = True
    
    # Apply database prefix if name wasn't provided and prefix is configured
    if not args.name and config['defaults']['default_db_prefix']:
        prefix = config['defaults']['default_db_prefix']
        args.name = f"{prefix}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    # Apply display settings
    global CONTENT_WIDTH
    CONTENT_WIDTH = config['display']['content_width']

    if args.delete_generation:
        print_section_divider("🗑️  DELETE LAST GENERATION")
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE, 'r') as f:
                    state = json.load(f)
                    last_db_name = state.get('last_database_name')
                    if last_db_name:
                        if delete_database(last_db_name):
                            print_success(f"Database '{last_db_name}' deleted successfully!")
                            STATE_FILE.unlink(missing_ok=True)
                            print_info("State file cleared.")
                        else:
                            print_error(f"Failed to delete database '{last_db_name}'.")
                    else:
                        print_warning("No database name found in state file.")
            except (json.JSONDecodeError, KeyError) as e:
                print_error(f"Could not read state file: {e}")
        else:
            print_warning("No previous generation found (state file doesn't exist).")
        sys.exit(0)

    if hasattr(args, 'delete') and args.delete:
        print_section_divider("🗑️  DELETE DATABASE")
        # Handle comma-separated list of databases
        db_names = [name.strip() for name in args.delete.split(',')]

        if len(db_names) == 1:
            # Single database deletion
            if delete_database(db_names[0]):
                print_success(f"Database '{db_names[0]}' deleted successfully!")
            else:
                print_error(f"Failed to delete database '{db_names[0]}'.")
        else:
            # Multiple database deletion
            print_info(f"Deleting {len(db_names)} databases...")
            success_count = 0
            for db_name in db_names:
                if delete_database(db_name):
                    success_count += 1
                    print_success(f"✓ Deleted: {db_name}")
                else:
                    print_error(f"✗ Failed: {db_name}")

            print_info(f"\nDeleted {success_count}/{len(db_names)} databases.")

        sys.exit(0)

    if args.configure:
        os.system('clear' if os.name == 'posix' else 'cls')
        print_ascii_header()
        configure_script()
        sys.exit(0)

    os.system('clear' if os.name == 'posix' else 'cls')
    print_ascii_header()

    try:
        check_dependencies() # Checks Turso CLI and pyperclip

        # (Original script's find_project_root() and check_turso_auth() can be integrated here if needed)
        # For simplicity, assuming Turso auth is handled externally by user for now.
        # A basic auth check:
        print_step(2, 6, "Verifying Turso CLI authentication...")
        auth_output, auth_error, auth_code = run_command("turso auth status")
        if auth_code != 0 or "You are not logged in" in auth_output or "not authenticated" in auth_output.lower():
            print_error("Turso CLI authentication failed or you are not logged in.")
            print_info(f"Please run: {Colors.BOLD}turso auth login{Colors.ENDC}")
            sys.exit(1)
        whoami_output, _, _ = run_command("turso auth whoami")
        print_success(f"Turso CLI authentication verified (Logged in as: {Colors.CYAN}{whoami_output or 'user'}{Colors.ENDC}).")


        print_step(3, 6, "Creating new Turso database...")
        # Using retry_operation for robustness, assuming it's defined as in the original script
        # For now, direct call:
        db_create_command = f"turso db create"
        if args.name:
            db_create_command += f" {args.name}"
        create_output, create_error, create_code = run_command(db_create_command, timeout=90) # Increased timeout
        if create_code != 0:
            print_error(f"Database creation failed: {create_error or 'Unknown error'}")
            sys.exit(1)

        db_name_match = re.search(r'(?:Created database|Database)\s+([\w-]+)', create_output) # More flexible regex
        if not db_name_match:
            print_error("Could not extract database name from Turso output.")
            print_info(f"Output: {create_output}")
            sys.exit(1)
        db_name = db_name_match.group(1)
        print_success(f"Database '{Colors.CYAN}{db_name}{Colors.ENDC}' created successfully!")
        # Save the database name to state file for potential deletion
        try:
            with open(STATE_FILE, "w") as f:
                json.dump({"last_database_name": db_name}, f)
        except Exception as e:
            print_warning(f"Could not save state file: {e}")

        print_step(4, 6, "Retrieving database connection details...")
        show_output, show_error, show_code = run_command(f"turso db show {db_name}", timeout=60)
        if show_code != 0:
            print_error(f"Failed to get database details for {db_name}: {show_error}")
            sys.exit(1)

        url_match = re.search(r'URL:\s+(libsql://[\w.-]+)', show_output)
        if not url_match:
            print_error("Could not extract database URL from Turso output.")
            print_info(f"Output: {show_output}")
            sys.exit(1)
        DATABASE_URL = url_match.group(1)
        print_success("Database URL retrieved.")

        print_step(5, 6, "Generating authentication token...")
        token_output, token_error, token_code = run_command(f"turso db tokens create {db_name}", timeout=60)
        if token_code != 0:
            print_error(f"Token creation failed for {db_name}: {token_error}")
            sys.exit(1)
        auth_token = token_output.strip() # Token is the direct output
        if not auth_token or len(auth_token) < 10: # Basic sanity check for token
            print_error("Generated token appears invalid or empty.")
            print_info(f"Output: {token_output}")
            sys.exit(1)
        print_success("Authentication token generated.")

        # Use custom environment variable names
        url_var_name = args.env_url_name
        token_var_name = args.env_token_name
        
        new_vars = {url_var_name: DATABASE_URL, token_var_name: auth_token}
        env_vars_string_for_clipboard = f"{url_var_name}={DATABASE_URL}\n{token_var_name}={auth_token}"

        # Show credentials box with masked secrets
        secrets_dict = print_env_vars_box(DATABASE_URL, auth_token, db_name, url_var_name, token_var_name)

        print_step(6, 6, "Finalizing setup...")
        
        # Copy to clipboard first
        if not args.no_clipboard:
            try:
                pyperclip.copy(env_vars_string_for_clipboard)
                print_success("🔗 URL and auth token copied to clipboard!")
                
                # Handle auto-reveal or ask if they want to reveal the secrets
                if args.auto_reveal == 'on':
                    print(f"\n{Colors.BOLD}{Colors.OKGREEN}🔓 Secrets Revealed (auto-reveal enabled):{Colors.ENDC}")
                    print(f"{Colors.BOLD}{Colors.ORANGE}{url_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{DATABASE_URL}{Colors.ENDC}")
                    print(f"{Colors.BOLD}{Colors.ORANGE}{token_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{auth_token}{Colors.ENDC}")
                    input(f"{Colors.BOLD}{Colors.GRAY}Press Enter to continue...{Colors.ENDC}")
                else:
                    try:
                        reveal_choice = input(f"\n{Colors.BOLD}{Colors.ORANGE}Do you want to reveal them? (y/N): {Colors.ENDC}").strip().lower()
                        if reveal_choice == 'y':
                            print(f"\n{Colors.BOLD}{Colors.OKGREEN}🔓 Secrets Revealed:{Colors.ENDC}")
                            print(f"{Colors.BOLD}{Colors.ORANGE}{url_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{DATABASE_URL}{Colors.ENDC}")
                            print(f"{Colors.BOLD}{Colors.ORANGE}{token_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{auth_token}{Colors.ENDC}")
                            input(f"\n{Colors.BOLD}{Colors.GRAY}Press Enter to continue...{Colors.ENDC}")
                        else:
                            print_info("Continuing with masked secrets...")
                    except KeyboardInterrupt:
                        print_info("\nContinuing with masked secrets...")
                    
            except Exception as e: # Catch broader pyperclip errors
                print_warning(f"Could not copy to clipboard: {e}")
                print_info("You can manually copy the credentials from the box above.")
                # Still offer to reveal secrets even if clipboard failed
                try:
                    reveal_choice = input(f"\n{Colors.BOLD}{Colors.ORANGE}Do you want to reveal the secrets? (y/N): {Colors.ENDC}").strip().lower()
                    if reveal_choice == 'y':
                        print(f"\n{Colors.BOLD}{Colors.OKGREEN}🔓 Secrets Revealed:{Colors.ENDC}")
                        print(f"{Colors.BOLD}{Colors.ORANGE}{url_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{DATABASE_URL}{Colors.ENDC}")
                        print(f"{Colors.BOLD}{Colors.ORANGE}{token_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{auth_token}{Colors.ENDC}")
                        input(f"\n{Colors.BOLD}{Colors.GRAY}Press Enter to continue...{Colors.ENDC}")
                except KeyboardInterrupt:
                    print_info("\nContinuing...")
        else:
            # If --no-clipboard is used, still offer to reveal secrets
            try:
                reveal_choice = input(f"\n{Colors.BOLD}{Colors.ORANGE}Do you want to reveal the secrets? (y/N): {Colors.ENDC}").strip().lower()
                if reveal_choice == 'y':
                    print(f"\n{Colors.BOLD}{Colors.OKGREEN}🔓 Secrets Revealed:{Colors.ENDC}")
                    print(f"{Colors.BOLD}{Colors.ORANGE}{url_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{DATABASE_URL}{Colors.ENDC}")
                    print(f"{Colors.BOLD}{Colors.ORANGE}{token_var_name}: {Colors.ENDC}{Colors.BRIGHT_CYAN}{auth_token}{Colors.ENDC}")
                    input(f"\n{Colors.BOLD}{Colors.GRAY}Press Enter to continue...{Colors.ENDC}")
            except KeyboardInterrupt:
                print_info("\nContinuing...")
        
        if args.overwrite:
            # Using a simplified version of original script's project root detection
            project_root = Path.cwd() # Default to current directory
            # Try to find a .git directory to define project root
            current_dir_check = Path.cwd()
            while current_dir_check != current_dir_check.parent: # Stop at system root
                if (current_dir_check / ".git").is_dir():
                    project_root = current_dir_check
                    print_info(f"Project root identified at: {Colors.CYAN}{project_root}{Colors.ENDC}")
                    break
                current_dir_check = current_dir_check.parent

            env_file_path = project_root / args.overwrite

            # Simplified update/append logic (original script's update_env_file is more robust)
            try:
                # Ensure directory exists
                env_file_path.parent.mkdir(parents=True, exist_ok=True)

                mode = 'a' if env_file_path.exists() else 'w'
                with open(env_file_path, mode) as f:
                    if mode == 'a': f.write("\n\n# Turso Credentials (added by script)\n")
                    else: f.write("# Turso Credentials (generated by script)\n")
                    f.write(f"# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"DATABASE_URL={DATABASE_URL}\n")
                    f.write(f"TURSO_AUTH_TOKEN={auth_token}\n")
                print_success(f"Environment variables {'appended to' if mode == 'a' else 'written to'} {Colors.CYAN}{env_file_path}{Colors.ENDC}")
            except IOError as e:
                print_error(f"Could not write to {env_file_path}: {e}")
        else:
            print_info(f"To save credentials to a file, use: {Colors.BOLD}--overwrite FILENAME{Colors.ENDC}")

        # Handle database seeding if requested
        if args.seed:
            seeding_success = handle_seeding(args.seed, db_name, DATABASE_URL, auth_token)
            if seeding_success:
                print_success("Database seeding completed successfully!")
            else:
                print_warning("Database seeding completed with some issues.")

        print_footer(db_name)
        
        # Post-completion prompts
        post_completion_prompts(db_name, DATABASE_URL, auth_token)

    except KeyboardInterrupt:
        print_error("\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print_error(f"An unexpected error occurred: {e}")
        # For debugging, you might want to print the full traceback
        # import traceback
        # print_error(f"Traceback: {traceback.format_exc()}")
        sys.exit(1)

if __name__ == "__main__":
    main()
