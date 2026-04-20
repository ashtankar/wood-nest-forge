# ArgoForge API Test Suite

Pytest suite that validates the ArgoForge Supabase REST endpoints, RLS
policies and supporting Edge Functions (Razorpay payments, AI negotiation
chat).

## Layout

```
api_tests/
├── conftest.py              # Shared fixtures (anon Supabase client, sample payloads)
├── pytest.ini               # Pytest config
├── requirements.txt         # Python deps
├── test_endpoints.py        # CRUD/read tests for public + RLS-protected tables
├── test_rls_writes.py       # Anonymous mutation must be blocked on protected tables
├── test_payments.py         # Razorpay create-order / verify-payment edge functions
└── test_negotiation_chat.py # AI negotiation chat edge function
```

## Setup

```bash
cd api_tests
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
# everything
pytest

# only one file
pytest test_payments.py

# match by name
pytest -k "promo"
```

## What's covered

| Area | File | Highlights |
|---|---|---|
| Catalog reads | `test_endpoints.py` | products, complementary, reviews, promo_codes |
| Public writes | `test_endpoints.py` | contact_messages + b2b_inquiries inserts |
| RLS read protection | `test_endpoints.py` | cart, orders, profiles, addresses, etc. |
| RLS write protection | `test_rls_writes.py` | anon insert/update/delete must be blocked |
| Payments | `test_payments.py` | auth gating + CORS preflight on Razorpay funcs |
| AI chat | `test_negotiation_chat.py` | schema validation + tolerant of 402/429 |

## Notes

- All credentials in `conftest.py` are the **public anon key** — safe to commit.
- Tests are read-mostly; the few inserts target tables (`contact_messages`,
  `b2b_inquiries`) where public insert is an explicit feature.
- Edge-function tests do not require Razorpay test keys — they exercise the
  auth + validation surface, not the upstream Razorpay API.
