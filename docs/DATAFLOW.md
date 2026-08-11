# venuebook.in — Data Flow Architecture

Generated 2026-08-10 from the current source tree. This is an **architecture map** (how data moves), not a completion audit. A "Known gaps" section is included because several were surfaced incidentally while tracing the wiring — treat it as a lead list, not an exhaustive audit.

## 1. Layers, top to bottom

```
Backend REST API
      │
      ▼
lib/axios.js  ──►  single axios instance, request interceptor injects:
      │              - Authorization: Bearer <token>   (read from document.cookie)
      │              - x-country                        (read from localStorage["country"])
      │              - x-category                        (read from localStorage["activeCategory"])
      ▼
services/*.service.js  (22 files, one per domain — thin wrappers, api.get/post/put/patch/delete)
      │
      ▼
State layer
  ├─ Zustand stores (store/*.js) — cross-page/global state
  └─ React Context (context/*.jsx) — scoped/provider-tree state
      │
      ▼
hooks/*.js  (useAuth, useCurrency, useRegion, useLocale, usePackageManager, usePreferredLocation, useDiamondWelcome)
      │
      ▼
Pages & components (app/[locale]/[country]/**)
```

`config/api.js` only declares `AUTH.LOGIN` / `AUTH.REGISTER` — every other endpoint is a string literal inside its `.service.js` file, not centralized. Same stale-stub pattern as `config/routes.js` flagged in the routes doc. [Certain]

## 2. Service layer

| Service file | Domain | Endpoint count |
|---|---|---|
| `auth.service.js` | Login, register, OTP, password reset, social login, `/auth/me` | 9 |
| `account.service.js` | Consumer account profile, rewards | 3 |
| `home.service.js` | Home feed: recent views, tier, vendor category, recommendations, top destinations | 6 |
| `global.service.js` | Master data: events, categories, property lookups, countries, currencies, amenities, notifications | 9 |
| `venues.service.js` | Listings, wishlist, compare, liked properties, checkout token verification | 17 |
| `venue_details.service.js` | Venue detail page, addons, enquiry | 3 |
| `search` (via `venues`/`global`) | — | — |
| `compare.service.js` | Availability for comparison | 1 |
| `checkout.service.js` | Checkout success | 1 |
| `payment.service.js` | Cashfree, Stripe, Razorpay (order create/verify/cancel), booking edit | 12 |
| `cashfree.service.js` | Cashfree-specific call | 1 |
| `booking.service.js` | Vendor booking engine: invoices, shifts, packages, addons, reservations, leads, notifications | 22 |
| `listing.service.js` | Vendor listing creation/sync | 7 |
| `vendor.service.js` | Vendor venue editor: photos, capacity, amenities, pricing, addons, settings (patch-per-section pattern) | 29 |
| `parent.service.js` | Parent-property listing | 2 |
| `package.service.js` | Vendor packages — **note:** contains two parallel endpoint families, `/packages/*` and `/api/package/*` (see gap below) | 20 |
| `profile.service.js` | Consumer profile main page, booking history | 2 |
| `settings.service.js` | Vendor settings get/save/load | 3 |
| `report.service.js` | Vendor reports | 1 |
| `teams.service.js` | Vendor team members, roles, permissions, masking | 17 |
| `chat.service.js` | Conversations, messages | 6 |
| `loyalty.service.js` | Reward balance | 1 |
| `kyc.service.js` | KYC submit/status/subscription detail | 4 |
| `kycVerification.js` | Third-party PAN/Aadhaar/bank/GST verification | 7 (all mocked — see gap below) |

Roughly 175 endpoint calls across 22 files. [Certain, from grep count]

## 3. State layer

### 3a. Zustand stores (`store/`)

| Store | Persisted? | Purpose | Feeds from |
|---|---|---|---|
| `global.store.js` | No | Master `events` + `properties`, loaded once (`loaded` flag guards refetch) | `global.service.js` |
| `useCountryStore.js` | Yes (`zustand/persist`, key `selected-country`) | `selectedCountry` object (code/name/currency/locale/flag) | Set manually, not from a service |
| `useGlobalCountryStore.js` | No | Separate `selectedCountry` + a `countryChangeTrigger` counter used to force refetches app-wide | Set manually |

**Two independent "selected country" stores exist side by side** — `useCountryStore` (persisted) and `useGlobalCountryStore` (not persisted, plus a change-trigger). [Certain] Nothing in either file references the other, so it's not a intentional split I can see (e.g. "persisted default" vs "session override") — it reads like two implementations of the same concept from different points in time. [Likely] Given `useRegion`/`useCurrency`/`useLocale` are marked stable-foundation and out of scope, I'm flagging this rather than touching it.

### 3b. React Context (`context/`, 15 files)

| Context | Role | Backend-wired? |
|---|---|---|
| `AuthContext.jsx` | Session/user identity | Yes — calls `lib/axios.js` directly |
| `RegionContext.jsx` | Region/currency/locale resolution (stable foundation) | Reads `config/i18n.js` + `lib/region.js`, not a service |
| `GlobalProvider.jsx` | Wraps `global.service.js` calls for provider-tree consumers | Yes |
| `SocketContext.jsx` | Socket.io connection lifecycle | Yes — `lib/socket.js` |
| `RealtimeContext.jsx` | Realtime events on top of the socket, gated by `AuthContext` | Yes |
| `CategoryContext.jsx` / `VendorCategoryContext.jsx` | Active category selection | Local state only |
| `DictionaryContext.jsx` | i18n dictionary access (stable foundation) | `lib/getDictionary.js` |
| `DropdownContext.jsx`, `UIContext.jsx`, `VendorUIContext.jsx`, `MobileReelsContext.jsx`, `ReelViewerContext.jsx`, `PropertyTypeModalContext.jsx` | Pure UI state (open/closed, active tab, modal state) | No — local only, by design |
| `GeoContext.jsx` | — | **Empty file (0 lines).** Its provider import is commented out in `app/[locale]/layout.jsx` (`// import { GeoProvider } from "@/context/GeoContext";`). Dead code, not currently wired into the tree. [Certain] |

## 4. Persistence & cross-cutting reads

- `lib/cookie.js` + raw `document.cookie` parsing (in `lib/axios.js`) — `token`, used for auth header.
- `localStorage` — `country`, `activeCategory`, read **directly inside the axios interceptor**, not through `useRegion`/`useCountryStore`. [Certain] That means the header values can drift from whatever the stores/contexts currently hold if something updates state without also touching localStorage — worth a targeted check if you ever see a request going out with a stale `x-country`.
- Zustand `persist` middleware — only `useCountryStore` uses it.

## 5. Realtime layer

`lib/socket.js` → connection factory → consumed by `SocketContext.jsx` (raw connection) and `RealtimeContext.jsx` (auth-gated event handling, wraps `SocketContext`). Used by chat/messages and vendor notification surfaces.

## 6. Page consumption

Pages import directly from `services/*.service.js` (most common), or read from Context/Zustand for shared/cross-page state. Full route-to-file map is in `docs/ROUTES.md` — **that doc is now stale**: three pages exist in the tree that weren't there when it was generated — `vendor/account`, `vendor/pax-management/[id]`, `profile/pax-management/[id]`. [Certain] Say the word and I'll regenerate it.

## 7. Known gaps (observed while mapping — not an exhaustive audit)

| Area | File(s) | Status |
|---|---|---|
| Third-party KYC verification (PAN/Aadhaar/bank/GST) | `services/kycVerification.js` | Explicitly mocked — file docstring says "CURRENT MODE: Mock — returns realistic data after a simulated delay," with the real fetch call left commented for a future swap. [Certain] |
| Vendor account → Finance tab | `vendor/account/components/sections/FinanceSection.jsx`, `data/financeMockData.js` | No service import at all — fully static mock data. [Certain] |
| Vendor account → Subscription tab | `vendor/account/components/sections/SubscriptionSection.jsx`, `data/subscriptionMockData.js` | Mixed: `suscription_detail()` from `kyc.service.js` is real, but `PLAN_FEATURE_MATRIX`/`INVOICE_LEDGER` are static mocks. [Certain] |
| Vendor packages | `vendor/package/data/mockData.js` alongside `services/package.service.js` | `package.service.js` itself has two parallel endpoint families (`/packages/*` and `/api/package/*`) — suggests an in-progress migration between two backend API shapes, not just a frontend mock. Worth confirming with backend which one is current. [Guessing] |
| Consumer profile | `profile/page.jsx`, `data/mockProfileData.js` | Mixed: core profile/bookings pull from real services (`venues`, `profile`, `home`); wallet points, reels, and a "soonest booking" fallback are mocked. [Certain] |
| Consumer + vendor messages | `messages/page.jsx` imports both `MOCK_CONVERSATIONS` (`./_data.js`) and real `chat.service.js` calls; `vendor/messages/page.jsx` imports only the real service | Consumer messages list looks partially seeded with mock conversations; vendor side looks fully wired. [Likely] |
| Consumer pax-management | `profile/pax-management/[id]/page.jsx` | Comment in the file references a "mocked payment flow" with `loadLead()` flagged to be swapped for a real call. [Certain] |
| `GeoContext.jsx` | `context/GeoContext.jsx` | Empty file, provider commented out at the call site — dead code. [Certain] |
| Duplicate country stores | `store/useCountryStore.js` vs `store/useGlobalCountryStore.js` | See §3a. [Likely — duplication; not fully confirmed as unintentional] |

## 8. Suggested next step

If you want the "pending vs completed" read you originally asked for, the natural follow-up is a proper completion audit built on top of this map: go module by module (I'd start with vendor/account, packages, and profile since they already show mixed wiring above) and confirm, function by function, whether each service call hits a real, tested backend endpoint or a stub. That's a heavier pass than this one — happy to scope it if useful.
