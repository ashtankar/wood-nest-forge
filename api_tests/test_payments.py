"""Tests for Razorpay payment edge functions (unauthenticated paths)."""
import requests

BASE = "https://brdtmlcwzrmoczemalbd.supabase.co/functions/v1"
ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZHRtbGN3enJtb2N6ZW1hbGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODU4NzQsImV4cCI6MjA5MDQ2MTg3NH0.azDijJZBYpH6x6L7YJ5jkqJIWD2cbkUSiY2n2UD-zzI"


def _post(path, body=None, token=None):
    headers = {"Content-Type": "application/json", "apikey": ANON}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return requests.post(f"{BASE}{path}", json=body or {}, headers=headers, timeout=15)


def test_create_order_requires_auth():
    r = _post("/razorpay-create-order", {"amount": 100})
    assert r.status_code in (401, 403)


def test_verify_payment_requires_auth():
    r = _post("/razorpay-verify-payment", {
        "razorpay_order_id": "x",
        "razorpay_payment_id": "y",
        "razorpay_signature": "z",
    })
    assert r.status_code in (401, 403)


def test_create_order_rejects_bad_amount():
    # Even when authed the function rejects non-positive amounts; without auth
    # we still expect a non-2xx response.
    r = _post("/razorpay-create-order", {"amount": -5})
    assert r.status_code >= 400


def test_options_preflight_create_order():
    r = requests.options(f"{BASE}/razorpay-create-order", timeout=10)
    assert r.status_code in (200, 204)


def test_options_preflight_verify_payment():
    r = requests.options(f"{BASE}/razorpay-verify-payment", timeout=10)
    assert r.status_code in (200, 204)
