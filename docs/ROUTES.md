# venuebook.in — Route Map

Generated from the App Router file tree (`app/`) on 2026-08-05. Source of truth is the file tree itself — regenerate this doc after adding/removing `page.jsx` files rather than hand-editing route lists.

## URL structure

Every public/app route is nested under two dynamic segments:

```
/{locale}/{country}/...
```

| Segment | Values | Source |
|---|---|---|
| `locale` | `en`, `hi`, `kn`, `ar` (`ar` renders RTL) | `config/i18n.js` |
| `country` | `in`, `ae` | `config/i18n.js` |

`GET /` has no page — `proxy.js` intercepts it, reads the `country` cookie (falling back to geo-IP header, then `IN`), and redirects to `/en/{country}/home` via `/{locale}/{country}` → `home` (see Root redirects below).

**Note:** `config/routes.js` (`HOME: "/"`, `LOGIN: "/login"`, `REGISTER: "/register"`, `DASHBOARD: "/dashboard"`) does not match any route below — none of those paths exist as pages in `app/`. It looks like a stale/unused stub. Flagging it rather than touching it, since the region/routing config is stable-foundation per project rules.

## Root-level redirects

| Path | Behavior | Source |
|---|---|---|
| `/` | 302 → `/en/{country}` → (root page) → `/en/{country}/home` | `proxy.js`, `[locale]/[country]/page.jsx` |
| `/{locale}/{country}` | Server redirect → `/{locale}/{country}/home` | `[locale]/[country]/page.jsx` |
| `/{locale}/{country}/wishlist(/*)` | 301 → `/{locale}/{country}/collections(/*)` | `next.config.js` `redirects()` |
| `/unauthorized` | Static, no locale prefix | `app/unauthorized/page.jsx` |

## Access control (`proxy.js`)

| Rule | Pattern | Effect |
|---|---|---|
| Protected (exact) | `/me`, `/manage-booking`, `/checkout` | No `token` cookie → redirect to `/unauthorized` |
| Protected (pattern) | `/{locale}/{country}/vendor/**` | No `token` cookie → redirect to `/unauthorized` |
| Public-only | `/login`, `/register` | Has `token` cookie → redirect to `/` |

Note: `/me` and `/manage-booking` are listed as protected but have no corresponding `page.jsx` in the current tree — likely legacy entries.

## Consumer routes

All paths below are relative to `/{locale}/{country}/`.

| Route | File | Notes |
|---|---|---|
| *(root)* | `page.jsx` | Redirects to `home` |
| `home` | `home/page.jsx` | Landing page (hero, categories, venue rails) |
| `list` | `list/page.jsx` | Property listing/browse view |
| `search/[type]` | `search/[type]/page.jsx` | Search results by category type |
| `search/[type]/[id]` | `search/[type]/[id]/page.jsx` | Single listing detail |
| `search/[type]/[id]/pax-enquiry` | `search/[type]/[id]/pax-enquiry/page.jsx` | Guest-count enquiry flow on a listing |
| `venue/[parentId]` | `venue/[parentId]/page.jsx` | Venue (parent property) detail page |
| `collections` | `collections/page.jsx` | Saved likes + user-organized collections (formerly `wishlist`) |
| `compare` | `compare/page.jsx` | Side-by-side property comparison |
| `profile` | `profile/page.jsx` | Consumer profile |
| `account/settings` | `account/settings/page.jsx` | Account settings |
| `messages` | `messages/page.jsx` | Consumer inbox (uses `?conversation=<id>` query param, not a route segment) |
| `checkout/[category]/[propertyId]` | `checkout/[category]/[propertyId]/page.jsx` | Checkout for a property (protected) |
| `checkout/[category]/[propertyId]/success` | `checkout/[category]/[propertyId]/success/page.jsx` | Post-checkout confirmation (protected) |

## Vendor onboarding — `start-listing`

| Route | File |
|---|---|
| `start-listing/[category]` | `start-listing/[category]/page.jsx` |
| `start-listing/[category]/property-type` | `start-listing/[category]/property-type/page.jsx` |
| `start-listing/[category]/parent-setup` | `start-listing/[category]/parent-setup/page.jsx` |
| `start-listing/[category]/[step]` | `start-listing/[category]/[step]/page.jsx` |
| `start-listing/[category]/payment` | `start-listing/[category]/payment/page.jsx` |
| `start-listing/[category]/subscription-success` | `start-listing/[category]/subscription-success/page.jsx` |

## Vendor dashboard — `vendor/**` (all protected, require `token`)

| Route | File |
|---|---|
| `vendor/dashboard` | `vendor/dashboard/page.jsx` |
| `vendor/leads` | `vendor/leads/page.jsx` |
| `vendor/calendar` | `vendor/calendar/page.jsx` |
| `vendor/addons` | `vendor/addons/page.jsx` |
| `vendor/package` | `vendor/package/page.jsx` |
| `vendor/teams` | `vendor/teams/page.jsx` |
| `vendor/settings` | `vendor/settings/page.jsx` |
| `vendor/notifications` | `vendor/notifications/page.jsx` |
| `vendor/messages` | `vendor/messages/page.jsx` |
| `vendor/chat` | `vendor/chat/page.jsx` |
| `vendor/chat/[id]` | `vendor/chat/[id]/page.jsx` |
| `vendor/listing` | `vendor/listing/page.jsx` |
| `vendor/listing/[id]` | `vendor/listing/[id]/page.jsx` |
| `vendor/listing/[id]/venue_setting` | `vendor/listing/[id]/venue_setting/page.jsx` |
| `vendor/listing/parent_details` | `vendor/listing/parent_details/page.jsx` |
| `vendor/bookings` | `vendor/bookings/page.jsx` |
| `vendor/bookings/new` | `vendor/bookings/new/page.jsx` |
| `vendor/bookings/draft` | `vendor/bookings/draft/page.jsx` |
| `vendor/bookings/history` | `vendor/bookings/history/page.jsx` |
| `vendor/bookings/booking` | `vendor/bookings/booking/page.jsx` |
| `vendor/bookings/quotation` | `vendor/bookings/quotation/page.jsx` |
| `vendor/bookings/reserve` | `vendor/bookings/reserve/page.jsx` |
| `vendor/reservations` | `vendor/reservations/page.jsx` |
| `vendor/reservations/invoice/[id]` | `vendor/reservations/invoice/[id]/page.jsx` |
| `vendor/reservations/final_invoice/[id]` | `vendor/reservations/final_invoice/[id]/page.jsx` |
| `vendor/reservations/manage_reserve/[id]` | `vendor/reservations/manage_reserve/[id]/page.jsx` |
| `vendor/reports` | `vendor/reports/page.jsx` |
| `vendor/reports/revenue_report` | `vendor/reports/revenue_report/page.jsx` |
| `vendor/reports/aging_report` | `vendor/reports/aging_report/page.jsx` |

## API routes (`/api/**`, no locale/country prefix)

| Route | File |
|---|---|
| `api/kyc/aadhaar-otp` | `api/kyc/aadhaar-otp/route.js` |
| `api/kyc/aadhaar-verify` | `api/kyc/aadhaar-verify/route.js` |
| `api/kyc/verify-pan` | `api/kyc/verify-pan/route.js` |
| `api/kyc/verify-pan-doc` | `api/kyc/verify-pan-doc/route.js` |
| `api/kyc/verify-bank` | `api/kyc/verify-bank/route.js` |

## Layouts (scope, not routes)

| Scope | File |
|---|---|
| Root | `app/layout.jsx` — sets `dir` on `<html>` (RTL for `ar`) via `HtmlDirSync.jsx` |
| `[locale]` | `[locale]/layout.jsx` |
| `[locale]/[country]` | `[locale]/[country]/layout.jsx` |
| `[locale]/[country]/vendor` | `vendor/layout.jsx` |
| `[locale]/[country]/vendor/bookings` | `vendor/bookings/layout.js` |
| `[locale]/[country]/vendor/chat` | `vendor/chat/layout.jsx` |
| `[locale]/[country]/vendor/reports` | `vendor/reports/layout.js` |

## Example resolved URLs

- `https://venuebook.in/en/in/home` — India, English, home
- `https://venuebook.in/ar/ae/home` — UAE, Arabic (RTL), home
- `https://venuebook.in/en/in/vendor/dashboard` — vendor dashboard, protected
