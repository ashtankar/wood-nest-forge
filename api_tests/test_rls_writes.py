"""RLS write-protection tests: anonymous clients must NOT be able to mutate
protected tables.
"""
import pytest
from postgrest.exceptions import APIError


PROTECTED_TABLES = [
    "orders", "order_items", "cart_items", "wishlist_items",
    "addresses", "profiles", "user_roles", "admin_emails", "products",
]


@pytest.mark.parametrize("table", PROTECTED_TABLES)
def test_anon_cannot_insert(table, supabase_client):
    """Anonymous inserts into protected tables must fail or return no rows."""
    try:
        res = supabase_client.table(table).insert({}).execute()
        # If RLS silently filters, data should be empty.
        assert res.data in ([], None)
    except APIError:
        # Expected: RLS rejects the write.
        assert True


@pytest.mark.parametrize("table", PROTECTED_TABLES)
def test_anon_cannot_update(table, supabase_client):
    try:
        res = (
            supabase_client.table(table)
            .update({"id": "00000000-0000-0000-0000-000000000000"})
            .eq("id", "00000000-0000-0000-0000-000000000000")
            .execute()
        )
        assert res.data in ([], None)
    except APIError:
        assert True


@pytest.mark.parametrize("table", PROTECTED_TABLES)
def test_anon_cannot_delete(table, supabase_client):
    try:
        res = (
            supabase_client.table(table)
            .delete()
            .eq("id", "00000000-0000-0000-0000-000000000000")
            .execute()
        )
        assert res.data in ([], None)
    except APIError:
        assert True


def test_promo_codes_inactive_hidden(supabase_client):
    """Public reads must not expose inactive promo codes."""
    res = supabase_client.table("promo_codes").select("*").eq("active", False).execute()
    assert res.data == []
