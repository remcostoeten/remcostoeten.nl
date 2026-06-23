#!/usr/bin/env python3
"""YouTube Music OAuth setup - polls until you authorize in browser."""
import json
import os
import time
import webbrowser
from pathlib import Path
from ytmusicapi.auth.oauth import OAuthCredentials, RefreshingToken

CLIENT_ID = os.environ.get("YTM_CLIENT_ID")
CLIENT_SECRET = os.environ.get("YTM_CLIENT_SECRET")
OAUTH_FILE = Path("oauth.json")

if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError("YTM_CLIENT_ID and YTM_CLIENT_SECRET are required.")

creds = OAuthCredentials(CLIENT_ID, CLIENT_SECRET)
code = creds.get_code()
url = f"{code['verification_url']}?user_code={code['user_code']}"

print("=" * 60)
print("YouTube Music OAuth Setup")
print("=" * 60)
print()
print(f"Visit this URL in your browser and sign in:")
print(f"  {url}")
print()
webbrowser.open(url)
print("Polling every 5 seconds for authorization...")
print()

for attempt in range(120):
    raw = creds.token_from_code(code["device_code"])
    if "access_token" in raw:
        break
    err = raw.get("error", "unknown")
    print(f"  [{attempt*5}s] {err}")
    time.sleep(5)
else:
    print("Timed out.")
    exit(1)

print(f"Access token obtained!")
OAUTH_FILE.write_text(json.dumps(raw, indent=2))
print(f"Saved to {OAUTH_FILE}")
