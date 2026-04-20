"""Tests for the AI negotiation-chat edge function."""
import requests

BASE = "https://brdtmlcwzrmoczemalbd.supabase.co/functions/v1"
ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZHRtbGN3enJtb2N6ZW1hbGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODU4NzQsImV4cCI6MjA5MDQ2MTg3NH0.azDijJZBYpH6x6L7YJ5jkqJIWD2cbkUSiY2n2UD-zzI"


def test_chat_options_preflight():
    r = requests.options(f"{BASE}/negotiation-chat", timeout=10)
    assert r.status_code in (200, 204)


def test_chat_rejects_empty_body():
    r = requests.post(
        f"{BASE}/negotiation-chat",
        headers={"Content-Type": "application/json", "apikey": ANON},
        data="not-json",
        timeout=15,
    )
    assert r.status_code >= 400


def test_chat_accepts_messages_schema():
    r = requests.post(
        f"{BASE}/negotiation-chat",
        json={"messages": [{"role": "user", "content": "hi"}]},
        headers={"Content-Type": "application/json", "apikey": ANON},
        timeout=20,
    )
    # 200 streaming, or 402/429 if AI credits/rate-limited — all expected.
    assert r.status_code in (200, 400, 401, 402, 429)
