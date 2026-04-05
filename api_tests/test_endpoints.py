"""
Tests for ArgoForge Supabase endpoints.
These test public-facing (anon-key) operations against the live Supabase project.
"""


def test_get_products(supabase_client):
    """Test retrieving the product list (public read)."""
    response = supabase_client.table("products").select("*").execute()
    assert isinstance(response.data, list), "Expected a list of products"


def test_get_active_promo_codes(supabase_client):
    """Test retrieving active promo codes (public read)."""
    response = supabase_client.table("promo_codes").select("*").eq("active", True).execute()
    assert isinstance(response.data, list), "Expected a list of promo codes"


def test_get_reviews(supabase_client):
    """Test retrieving reviews (public read)."""
    response = supabase_client.table("reviews").select("*").execute()
    assert isinstance(response.data, list), "Expected a list of reviews"


def test_insert_contact_message(supabase_client, sample_contact_payload):
    """Test submitting a contact message (public insert)."""
    response = supabase_client.table("contact_messages").insert(sample_contact_payload).execute()
    assert len(response.data) == 1, "Expected one inserted row"
    assert response.data[0]["email"] == sample_contact_payload["email"]


def test_insert_b2b_inquiry(supabase_client, sample_b2b_payload):
    """Test submitting a B2B inquiry (public insert)."""
    response = supabase_client.table("b2b_inquiries").insert(sample_b2b_payload).execute()
    assert len(response.data) == 1, "Expected one inserted row"
    assert response.data[0]["company_name"] == sample_b2b_payload["company_name"]


def test_cart_requires_auth(supabase_client):
    """Test that cart_items is protected — anon users get empty/blocked."""
    response = supabase_client.table("cart_items").select("*").execute()
    # RLS blocks anon access, so data should be empty
    assert response.data == [], "Expected empty result for unauthenticated cart access"


def test_orders_require_auth(supabase_client):
    """Test that orders table is protected — anon users get empty/blocked."""
    response = supabase_client.table("orders").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated order access"


def test_admin_emails_require_auth(supabase_client):
    """Test that admin_emails table is protected from public access."""
    response = supabase_client.table("admin_emails").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated admin_emails access"
