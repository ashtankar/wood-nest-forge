import pytest
import requests

@pytest.fixture
def base_url():
    # Replace with your actual backend URL or mock server
    return "http://localhost:8000/api"

@pytest.fixture
def sample_cart_payload():
    return {
        "productId": "prod_123",
        "quantity": 1
    }