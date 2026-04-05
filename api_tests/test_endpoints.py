"""
Tests for ArgoForge Supabase endpoints.
These test public-facing (anon-key) operations against the live Supabase project.
"""
import uuid


# ── Products (public read) ──────────────────────────────────────────

def test_get_products(supabase_client):
    """Test retrieving the product list."""
    response = supabase_client.table("products").select("*").execute()
    assert isinstance(response.data, list), "Expected a list of products"


def test_products_have_required_fields(supabase_client):
    """Test that products contain all required fields."""
    response = supabase_client.table("products").select("*").limit(1).execute()
    if response.data:
        product = response.data[0]
        for field in ["id", "name", "slug", "price", "category", "image_url"]:
            assert field in product, f"Missing field: {field}"


def test_products_select_specific_columns(supabase_client):
    """Test selecting specific columns from products."""
    response = supabase_client.table("products").select("id, name, price").execute()
    assert isinstance(response.data, list)
    if response.data:
        assert "description" not in response.data[0]


def test_products_filter_by_category(supabase_client):
    """Test filtering products by category."""
    response = supabase_client.table("products").select("*").eq("category", "Furniture").execute()
    assert isinstance(response.data, list)
    for p in response.data:
        assert p["category"] == "Furniture"


def test_products_order_by_price(supabase_client):
    """Test ordering products by price ascending."""
    response = supabase_client.table("products").select("price").order("price", desc=False).execute()
    prices = [p["price"] for p in response.data]
    assert prices == sorted(prices)


def test_products_limit(supabase_client):
    """Test limiting the number of products returned."""
    response = supabase_client.table("products").select("*").limit(3).execute()
    assert len(response.data) <= 3


def test_product_by_slug(supabase_client):
    """Test retrieving a single product by slug."""
    all_products = supabase_client.table("products").select("slug").limit(1).execute()
    if all_products.data:
        slug = all_products.data[0]["slug"]
        response = supabase_client.table("products").select("*").eq("slug", slug).execute()
        assert len(response.data) == 1
        assert response.data[0]["slug"] == slug


def test_product_price_is_positive(supabase_client):
    """Test that all product prices are non-negative."""
    response = supabase_client.table("products").select("price").execute()
    for p in response.data:
        assert p["price"] >= 0


def test_product_stock_is_integer(supabase_client):
    """Test that stock values are integers."""
    response = supabase_client.table("products").select("stock").limit(5).execute()
    for p in response.data:
        assert isinstance(p["stock"], int)


def test_products_nonexistent_slug_returns_empty(supabase_client):
    """Test that a nonexistent slug returns no results."""
    response = supabase_client.table("products").select("*").eq("slug", "nonexistent-slug-xyz-999").execute()
    assert response.data == []


# ── Promo Codes (public read active) ────────────────────────────────

def test_get_active_promo_codes(supabase_client):
    """Test retrieving active promo codes."""
    response = supabase_client.table("promo_codes").select("*").eq("active", True).execute()
    assert isinstance(response.data, list)


def test_promo_codes_have_required_fields(supabase_client):
    """Test that promo codes have required fields."""
    response = supabase_client.table("promo_codes").select("*").limit(1).execute()
    if response.data:
        for field in ["id", "code", "type", "value", "active"]:
            assert field in response.data[0], f"Missing field: {field}"


def test_promo_codes_only_active_visible(supabase_client):
    """Test that RLS only returns active promo codes to public."""
    response = supabase_client.table("promo_codes").select("*").execute()
    for promo in response.data:
        assert promo["active"] is True, "Public should only see active promos"


def test_promo_code_value_positive(supabase_client):
    """Test that promo code values are non-negative."""
    response = supabase_client.table("promo_codes").select("value").execute()
    for p in response.data:
        assert p["value"] >= 0


# ── Reviews (public read) ───────────────────────────────────────────

def test_get_reviews(supabase_client):
    """Test retrieving reviews."""
    response = supabase_client.table("reviews").select("*").execute()
    assert isinstance(response.data, list)


def test_reviews_have_required_fields(supabase_client):
    """Test that reviews contain required fields."""
    response = supabase_client.table("reviews").select("*").limit(1).execute()
    if response.data:
        for field in ["id", "product_id", "user_id", "rating", "text"]:
            assert field in response.data[0], f"Missing field: {field}"


def test_reviews_rating_range(supabase_client):
    """Test that review ratings are between 1 and 5."""
    response = supabase_client.table("reviews").select("rating").execute()
    for r in response.data:
        assert 1 <= r["rating"] <= 5, f"Rating {r['rating']} out of range"


def test_reviews_filter_by_product(supabase_client):
    """Test filtering reviews by product_id."""
    reviews = supabase_client.table("reviews").select("product_id").limit(1).execute()
    if reviews.data:
        pid = reviews.data[0]["product_id"]
        filtered = supabase_client.table("reviews").select("*").eq("product_id", pid).execute()
        for r in filtered.data:
            assert r["product_id"] == pid


# ── Complementary Products (public read) ────────────────────────────

def test_get_complementary_products(supabase_client):
    """Test retrieving complementary products."""
    response = supabase_client.table("complementary_products").select("*").execute()
    assert isinstance(response.data, list)


# ── Contact Messages (public insert) ────────────────────────────────

def test_insert_contact_message(supabase_client, sample_contact_payload):
    """Test submitting a contact message."""
    response = supabase_client.table("contact_messages").insert(sample_contact_payload).execute()
    assert len(response.data) == 1
    assert response.data[0]["email"] == sample_contact_payload["email"]


def test_contact_message_with_long_text(supabase_client):
    """Test submitting a contact message with a long message body."""
    payload = {
        "name": "Long Message User",
        "email": "long@example.com",
        "subject": "Detailed Inquiry",
        "message": "A" * 2000,
    }
    response = supabase_client.table("contact_messages").insert(payload).execute()
    assert len(response.data) == 1


def test_contact_message_defaults(supabase_client):
    """Test that default values are applied for contact messages."""
    payload = {"name": "Defaults Test", "email": "defaults@test.com"}
    response = supabase_client.table("contact_messages").insert(payload).execute()
    assert len(response.data) == 1
    assert "id" in response.data[0]
    assert "created_at" in response.data[0]


# ── B2B Inquiries (public insert) ───────────────────────────────────

def test_insert_b2b_inquiry(supabase_client, sample_b2b_payload):
    """Test submitting a B2B inquiry."""
    response = supabase_client.table("b2b_inquiries").insert(sample_b2b_payload).execute()
    assert len(response.data) == 1
    assert response.data[0]["company_name"] == sample_b2b_payload["company_name"]


def test_b2b_inquiry_default_status(supabase_client, sample_b2b_payload):
    """Test that B2B inquiry defaults to 'new' status."""
    response = supabase_client.table("b2b_inquiries").insert(sample_b2b_payload).execute()
    assert response.data[0]["status"] == "new"


# ── RLS: Auth-protected tables (anon blocked) ───────────────────────

def test_cart_requires_auth(supabase_client):
    """Test that cart_items is protected — anon users get empty."""
    response = supabase_client.table("cart_items").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated cart access"


def test_orders_require_auth(supabase_client):
    """Test that orders table is protected — anon users get empty."""
    response = supabase_client.table("orders").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated order access"


def test_order_items_require_auth(supabase_client):
    """Test that order_items table is protected — anon users get empty."""
    response = supabase_client.table("order_items").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated order_items access"


def test_admin_emails_require_auth(supabase_client):
    """Test that admin_emails table is protected from public access."""
    response = supabase_client.table("admin_emails").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated admin_emails access"


def test_user_roles_require_auth(supabase_client):
    """Test that user_roles table is protected from public access."""
    response = supabase_client.table("user_roles").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated user_roles access"


def test_profiles_require_auth(supabase_client):
    """Test that profiles table is protected from public access."""
    response = supabase_client.table("profiles").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated profiles access"


def test_wishlist_requires_auth(supabase_client):
    """Test that wishlist_items is protected — anon users get empty."""
    response = supabase_client.table("wishlist_items").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated wishlist access"


def test_addresses_require_auth(supabase_client):
    """Test that addresses table is protected from public access."""
    response = supabase_client.table("addresses").select("*").execute()
    assert response.data == [], "Expected empty result for unauthenticated addresses access"
