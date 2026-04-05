import requests

def test_get_products(base_url):
    """Test retrieving the product list."""
    response = requests.get(f"{base_url}/products")
    assert response.status_code == 200, "Expected 200 OK"
    assert isinstance(response.json(), list), "Expected a list of products"

def test_add_to_cart(base_url, sample_cart_payload):
    """Test adding an item to the shopping cart."""
    response = requests.post(f"{base_url}/cart", json=sample_cart_payload)
    assert response.status_code in [200, 201], "Expected successful creation status"

def test_admin_orders_unauthorized(base_url):
    """Test that the admin endpoint is protected."""
    # Assuming no auth token is passed
    response = requests.get(f"{base_url}/admin/orders")
    assert response.status_code in [401, 403], "Expected Unauthorized or Forbidden"