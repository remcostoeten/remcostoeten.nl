#!/usr/bin/env python3
"""Patched YTMusic wrapper that uses the correct SAPISIDHASH formula.

The official ytmusicapi uses sha1(ts + sapisid + origin) without
the user_session_id prefix and _u suffix that YouTube Music now requires.
"""
import hashlib
import json
import os
import re
import time
import urllib.request
from collections.abc import KeysView
from pathlib import Path
from typing import Any

import requests
from requests.structures import CaseInsensitiveDict

from ytmusicapi import YTMusic
from ytmusicapi.auth.auth_parse import parse_auth_str, determine_auth_type
from ytmusicapi.auth.types import AuthType
from ytmusicapi.helpers import (
    YTM_BASE_API,
    YTM_PARAMS,
    YTM_PARAMS_KEY,
    initialize_headers,
    get_visitor_id,
    sapisid_from_cookie,
    initialize_context,
    SUPPORTED_LANGUAGES,
    SUPPORTED_LOCATIONS,
)
from ytmusicapi.exceptions import YTMusicServerError, YTMusicUserError


class PatchedYTMusic(YTMusic):
    """YTMusic subclass with fixed browser auth hash formula."""

    def __init__(self, *args, **kwargs):
        self._user_session_id: str | None = None
        super().__init__(*args, **kwargs)

    @property
    def headers(self) -> CaseInsensitiveDict[str]:
        headers = self.base_headers

        if self.auth_type == AuthType.BROWSER:
            ts = str(int(time.time()))
            usid = self._user_session_id or ""
            sapisid = getattr(self, "sapisid", "")
            origin = getattr(self, "origin", "https://music.youtube.com")

            parts = self._generate_patched_auth(ts, usid, sapisid, origin)
            headers["authorization"] = " ".join(parts)

        elif self.auth_type == AuthType.OAUTH_CUSTOM_CLIENT:
            headers["authorization"] = self._token.as_auth()
            headers["X-Goog-Request-Time"] = str(int(time.time()))

        return headers

    def _generate_patched_auth(self, ts: str, usid: str, sapisid: str, origin: str) -> list[str]:
        """Generate the three-part SAPISIDHASH with user_session_id and _u suffix."""
        cookie_hdr = self.base_headers.get("cookie", "")

        cookies = {}
        for part in cookie_hdr.split(";"):
            if "=" in part:
                k, v = part.split("=", 1)
                cookies[k.strip()] = v.strip()

        sapisid3 = cookies.get("__Secure-3PAPISID", sapisid)
        sapisid1 = cookies.get("__Secure-1PAPISID", cookies.get("APISID", ""))
        if not sapisid1:
            sapisid1 = sapisid3

        def _hash(val: str) -> str:
            raw = hashlib.sha1(f"{usid} {ts} {val} {origin}".encode()).hexdigest()
            return f"{ts}_{raw}_u"

        return [
            f"SAPISIDHASH {_hash(sapisid)}",
            f"SAPISID1PHASH {_hash(sapisid1)}",
            f"SAPISID3PHASH {_hash(sapisid3)}",
        ]

    @classmethod
    def from_env(cls) -> "PatchedYTMusic":
        """Create instance from YTM_COOKIE env var with correct auth."""
        cookie = os.environ.get("YTM_COOKIE", "")
        auth_user = os.environ.get("YTM_AUTH_USER", "0")
        if not cookie:
            raise RuntimeError("YTM_COOKIE not set")

        ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"

        # Fetch homepage to get user_session_id and visitor_data
        cmap = {}
        for part in cookie.split(";"):
            if "=" in part:
                k, v = part.split("=", 1)
                cmap[k.strip()] = v.strip()
        cmap["SOCS"] = "CAI"
        cookie_hdr = "; ".join(f"{k}={v}" for k, v in cmap.items())

        req = urllib.request.Request(
            "https://music.youtube.com/",
            headers={
                "Cookie": cookie_hdr,
                "User-Agent": ua,
                "Accept": "text/html,*/*",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode("utf-8", errors="replace")

        ds_match = re.search(r'"DATASYNC_ID"\s*:\s*"([^"]+)"', html)
        if not ds_match:
            raise RuntimeError("Could not find DATASYNC_ID in YT Music page")
        ds_parts = ds_match.group(1).split("||")
        user_session_id = ds_parts[1] if len(ds_parts) > 1 else ds_parts[0]
        page_id = ds_parts[0]

        visitor_match = re.search(r'"VISITOR_DATA"\s*:\s*"([^"]+)"', html)
        visitor_data = visitor_match.group(1).replace("\\u003d", "=") if visitor_match else ""

        # Generate initial auth header for YTMusic constructor
        sapisid = cmap.get("__Secure-3PAPISID", cmap.get("SAPISID", ""))
        ts = str(int(time.time()))
        init_auth_hash = hashlib.sha1(f"{user_session_id} {ts} {sapisid} {ua}".encode()).hexdigest()
        init_auth = f"SAPISIDHASH {ts}_{init_auth_hash}_u"

        headers_dict = {
            "Cookie": cookie,
            "X-Goog-AuthUser": auth_user,
            "Authorization": init_auth,
            "Origin": "https://music.youtube.com",
            "X-Origin": "https://music.youtube.com",
            "User-Agent": ua,
            "X-Goog-Visitor-Id": visitor_data,
        }

        instance = cls(json.dumps(headers_dict))
        instance._user_session_id = user_session_id
        instance._page_id = page_id
        instance._visitor_data = visitor_data
        return instance
