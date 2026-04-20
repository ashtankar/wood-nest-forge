

## Plan: Functional AI Chat Negotiation Widget

Replace the placeholder live-chat button (currently just shows a toast) with a fully functional AI chatbot powered by Lovable AI Gateway. The bot acts as a sales/negotiation assistant that can grant small discounts automatically and escalate larger requests to a human manager.

### Behavior

- Floating chat button (bottom-right) opens a polished chat panel.
- AI greets the user formally, can answer product/order questions, and handle discount negotiations.
- **Discount logic** (enforced server-side in the system prompt + tool calling):
  - Requests ≤ 5% → AI issues a one-time promo code politely.
  - Requests > 5% → AI formally declines and refers user to the manager with a sample contact number (e.g. **+1 (555) 010-2024**) and email.
- Conversation history kept in component state (per session).
- Markdown rendering for AI replies, streaming token-by-token, typing indicator, scroll-to-bottom.
- For logged-in users the chat can reference their cart total (passed in context); guests get generic help.

### Architecture

```text
StorefrontLayout
  └── ChatWidget (new)
        ├── Floating button → toggles panel
        ├── Chat panel (Sheet/Card, Sonner-style)
        │     ├── Message list (ReactMarkdown)
        │     ├── Streaming assistant bubble
        │     └── Input + send button
        └── streamChat() → /functions/v1/negotiation-chat (SSE)

Edge Function: supabase/functions/negotiation-chat/index.ts
  - System prompt encoding negotiation rules + manager contact
  - Calls Lovable AI Gateway (google/gemini-3-flash-preview)
  - Streams SSE back to client
  - verify_jwt = false (public widget)
```

### Files

**New**
- `supabase/functions/negotiation-chat/index.ts` — streaming edge function with negotiation system prompt.
- `src/components/storefront/ChatWidget.tsx` — chat UI, streaming client, markdown rendering.

**Edited**
- `src/components/storefront/StorefrontLayout.tsx` — replace toast button with `<ChatWidget />`.
- `supabase/config.toml` — register `negotiation-chat` with `verify_jwt = false`.
- `package.json` — add `react-markdown` (auto-installed).

### System Prompt (key rules baked into edge function)

- Persona: "Aria", formal sales associate for Wood Nest Forge.
- Rule 1: If customer requests a discount ≤ 5%, generate a code like `WELCOME5` / `THANKS3` and confirm.
- Rule 2: If > 5%, politely decline and provide manager contact: **+1 (555) 010-2024** / `manager@woodnestforge.com`.
- Rule 3: Never invent product prices or stock — defer to site data; suggest checking the product page.
- Tone: concise, professional, no emojis.

### Technical notes

- Streaming follows the line-by-line SSE pattern from the AI Gateway docs (handles partial JSON, `[DONE]`, CRLF, 429/402 errors with toasts).
- `LOVABLE_API_KEY` already provisioned — no secrets prompt.
- No DB schema changes needed; chat is ephemeral. (Future enhancement could persist `chat_messages`.)
- Discount codes are **conversational only** (AI suggests codes); they are NOT auto-inserted into `promo_codes` to avoid abuse. Plan note: if you want the AI to actually create real redeemable codes in the DB, we can add that as a follow-up using a service-role insert inside the edge function.

