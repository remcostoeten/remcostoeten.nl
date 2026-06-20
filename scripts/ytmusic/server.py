#!/usr/bin/env python3
"""Persistent Innertube API server for YouTube Music history.

Maintains a session that regenerates SAPISIDHASH (with user_session_id + _u)
on each request. Reads YTM_COOKIE and YTM_AUTH_USER from environment.

GET /recent?limit=10  -> JSON array of tracks
GET /health           -> {"ok": true}
"""
import http.server
import json
import os
import re
import time
import urllib.request
from hashlib import sha1

PORT = 8370
YTM_ORIGIN = "https://music.youtube.com"
YTM_API_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30"

COOKIE = os.environ.get("YTM_COOKIE", "")
AUTH_USER = os.environ.get("YTM_AUTH_USER", "0")
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"

_user_session_id: str | None = None
_visitor_data: str | None = None
_page_id: str | None = None


def _parse_cookies(cookie_str: str) -> dict[str, str]:
    result = {}
    for part in cookie_str.split(";"):
        if "=" in part:
            k, v = part.split("=", 1)
            result[k.strip()] = v.strip()
    return result


def _rebuild_cookie(cmap: dict[str, str]) -> str:
    return "; ".join(f"{k}={v}" for k, v in cmap.items())


def _fetch_page_config() -> tuple[str, str, str]:
    cmap = _parse_cookies(COOKIE)
    cmap["SOCS"] = "CAI"
    cookie_hdr = _rebuild_cookie(cmap)

    req = urllib.request.Request(
        YTM_ORIGIN,
        headers={
            "Cookie": cookie_hdr,
            "User-Agent": USER_AGENT,
            "Accept": "text/html,*/*",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    ds_match = re.search(r'"DATASYNC_ID"\s*:\s*"([^"]+)"', html)
    if not ds_match:
        raise RuntimeError("Could not find DATASYNC_ID in YT Music page")
    ds_parts = ds_match.group(1).split("||")
    user_session_id = ds_parts[1] if len(ds_parts) > 1 else ds_parts[0]
    page_id = ds_parts[0]

    v_match = re.search(r'"VISITOR_DATA"\s*:\s*"([^"]+)"', html)
    visitor_data = v_match.group(1).replace("\\u003d", "=") if v_match else ""

    return user_session_id, visitor_data, page_id


def _ensure_config():
    global _user_session_id, _visitor_data, _page_id
    if _user_session_id is None:
        _user_session_id, _visitor_data, _page_id = _fetch_page_config()


def _sapisid_hash(ts: str, cookie_value: str, user_session_id: str) -> str:
    h = sha1(f"{user_session_id} {ts} {cookie_value} {YTM_ORIGIN}".encode()).hexdigest()
    return f"{ts}_{h}_u"


def _generate_auth(cmap: dict[str, str]) -> str:
    _ensure_config()
    ts = str(int(time.time()))
    sapisid = cmap.get("__Secure-3PAPISID", cmap.get("SAPISID", ""))
    sapisid1 = cmap.get("__Secure-1PAPISID", cmap.get("APISID", ""))
    sapisid3 = cmap.get("__Secure-3PAPISID", sapisid)
    parts = [
        f"SAPISIDHASH {_sapisid_hash(ts, sapisid, _user_session_id)}",
        f"SAPISID1PHASH {_sapisid_hash(ts, sapisid1, _user_session_id)}",
        f"SAPISID3PHASH {_sapisid_hash(ts, sapisid3, _user_session_id)}",
    ]
    return " ".join(parts)


def _innertube_post(endpoint: str, body: dict) -> dict:
    cmap = _parse_cookies(COOKIE)
    cmap["SOCS"] = "CAI"
    cookie_hdr = _rebuild_cookie(cmap)
    auth_hdr = _generate_auth(cmap)
    _ensure_config()

    payload = json.dumps({
        **body,
        "context": {
            "client": {
                "hl": "en",
                "gl": "US",
                "clientName": "WEB_REMIX",
                "clientVersion": "1.20260531.05.00",
                "visitorData": _visitor_data,
            },
            "user": {"lockedSafetyMode": False},
            "request": {
                "useSsl": True,
                "internalExperimentFlags": [],
                "consistencyTokenJars": [],
            },
        },
    }).encode()

    req = urllib.request.Request(
        f"{YTM_ORIGIN}/youtubei/v1/{endpoint}?alt=json&key={YTM_API_KEY}",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Cookie": cookie_hdr,
            "Authorization": auth_hdr,
            "Origin": YTM_ORIGIN,
            "X-Goog-AuthUser": AUTH_USER,
            "X-Goog-PageId": _page_id or "",
            "X-Origin": YTM_ORIGIN,
            "X-Youtube-Bootstrap-Logged-In": "true",
            "X-Youtube-Client-Name": "67",
            "X-Goog-Visitor-Id": _visitor_data or "",
            "User-Agent": USER_AGENT,
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def _extract_artist_names(runs: list) -> str:
    names = []
    for r in runs:
        t = r.get("text", "").strip()
        if (
            not t
            or t in ("•", " / ")
            or "/" in t
            or t.startswith("Album")
            or re.search(r'\d+K?\s*views?', t, re.I)
        ):
            continue
        names.append(t)
    return ", ".join(names)


def _extract_tracks(data: dict, limit: int) -> list[dict]:
    tracks = []
    try:
        sections = (
            data.get("contents", {})
            .get("singleColumnBrowseResultsRenderer", {})
            .get("tabs", [{}])[0]
            .get("tabRenderer", {})
            .get("content", {})
            .get("sectionListRenderer", {})
            .get("contents", [])
        )
    except (KeyError, IndexError, TypeError):
        return tracks

    for section in sections:
        shelf = section.get("musicShelfRenderer") or section.get("musicCarouselShelfRenderer")
        if not shelf:
            continue
        for item in shelf.get("contents", []):
            r = item.get("musicResponsiveListItemRenderer", {})
            if not r:
                continue

            video_id = (
                r.get("overlay", {})
                .get("musicItemThumbnailOverlayRenderer", {})
                .get("content", {})
                .get("musicPlayButtonRenderer", {})
                .get("playNavigationEndpoint", {})
                .get("watchEndpoint", {})
                .get("videoId")
            )

            flex = r.get("flexColumns", [])
            title = None
            if flex:
                title = (
                    flex[0]
                    .get("musicResponsiveListItemFlexColumnRenderer", {})
                    .get("text", {})
                    .get("runs", [{}])[0]
                    .get("text")
                )

            if not video_id or not title:
                continue

            artists = ""
            if len(flex) > 1:
                runs = (
                    flex[1]
                    .get("musicResponsiveListItemFlexColumnRenderer", {})
                    .get("text", {})
                    .get("runs", [])
                )
                artists = _extract_artist_names(runs)

            album = ""
            if len(flex) > 2:
                album = (
                    flex[2]
                    .get("musicResponsiveListItemFlexColumnRenderer", {})
                    .get("text", {})
                    .get("runs", [{}])[0]
                    .get("text", "")
                )

            thumbnail = ""
            thumb_data = (
                r.get("thumbnail", {})
                .get("musicThumbnailRenderer", {})
                .get("thumbnail", {})
                .get("thumbnails", [])
            )
            if thumb_data:
                thumbnail = thumb_data[-1].get("url", "")

            tracks.append({
                "id": video_id,
                "name": title,
                "artist": artists or "Unknown",
                "album": album or "",
                "url": f"{YTM_ORIGIN}/watch?v={video_id}",
                "image": thumbnail,
                "played_at": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
            })

            if len(tracks) >= limit:
                break
        if len(tracks) >= limit:
            break

    return tracks


def get_history(limit: int = 10) -> list[dict]:
    data = _innertube_post("browse", {"browseId": "FEmusic_history"})
    return _extract_tracks(data, limit)


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import parse_qs, urlparse

        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        limit = int(params.get("limit", [10])[0])

        if parsed.path == "/health":
            self._json({"ok": True})
        elif parsed.path == "/recent":
            try:
                history = get_history(limit=limit)
                self._json(history)
            except Exception as e:
                self._error(str(e))
        else:
            self._error("not found", 404)

    def _json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())

    def _error(self, msg, status=500):
        self._json({"error": msg}, status)

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", PORT), Handler)
    print(f"[YTM] Server listening on http://127.0.0.1:{PORT}", flush=True)
    server.serve_forever()
