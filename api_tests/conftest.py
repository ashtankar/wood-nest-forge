import pytest
import os
from supabase import create_client, Client

SUPABASE_URL = "https://brdtmlcwzrmoczemalbd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZHRtbGN3enJtb2N6ZW1hbGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODU4NzQsImV4cCI6MjA5MDQ2MTg3NH0.azDijJZBYpH6x6L7YJ5jkqJIWD2cbkUSiY2n2UD-zzI"

@pytest.fixture
def supabase_client() -> Client:
    """Create an anonymous Supabase client for public endpoint tests."""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

@pytest.fixture
def sample_contact_payload():
    return {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test Subject",
        "message": "This is a test message."
    }

@pytest.fixture
def sample_b2b_payload():
    return {
        "company_name": "Test Corp",
        "contact_name": "John Doe",
        "email": "john@testcorp.com",
        "phone": "+1234567890",
        "message": "Interested in bulk orders."
    }
