/**
 * /app/[locale]/[country]/account/settings/data/mockAccountData.js
 *
 * Mock payloads for the sections of the Account Settings module that have
 * no confirmed backend endpoint yet (Payments, Addresses, Devices,
 * Connected Accounts, Rewards history, Host verification). Following the
 * same convention as /profile/data/mockProfileData.js: plain data values
 * here (bank names, device strings, coupon titles) are NOT translation
 * keys — same precedent as MOCK_OFFERS/MOCK_BOOKINGS in the Profile
 * feature, which are real-looking placeholder content, not localized UI
 * chrome. No API call in this file — every section that reads from here
 * shows the same honest "not connected yet" toast as the Profile page's
 * existing AccountSettingsGrid/PasswordCard/DangerZone when a mutation is
 * attempted, rather than faking a persisted change.
 */

export const MOCK_DEVICES = {
  current: {
    id: "dev-current",
    device: "Windows · Chrome",
    location: "Bengaluru, India",
    lastSeen: "Active now",
  },
  others: [
    { id: "dev-1", device: "iPhone 14 · Safari", location: "Bengaluru, India", lastSeen: "2 hours ago" },
    { id: "dev-2", device: "MacBook Pro · Chrome", location: "Mumbai, India", lastSeen: "3 days ago" },
    { id: "dev-3", device: "Android · App", location: "Dubai, UAE", lastSeen: "1 week ago" },
  ],
};

export const MOCK_LOGIN_ACTIVITY = [
  { id: "la-1", event: "Signed in", device: "Windows · Chrome", location: "Bengaluru, India", when: "Today, 9:42 AM" },
  { id: "la-2", event: "Signed in", device: "iPhone 14 · Safari", location: "Bengaluru, India", when: "2 days ago" },
  { id: "la-3", event: "Password changed", device: "Windows · Chrome", location: "Bengaluru, India", when: "3 weeks ago" },
];

export const MOCK_CARDS = [
  { id: "card-1", brand: "Visa", last4: "4242", expiry: "09/27" },
  { id: "card-2", brand: "Mastercard", last4: "8891", expiry: "01/26" },
];

export const MOCK_UPI = [{ id: "upi-1", vpa: "shawn@okhdfcbank" }];

export const MOCK_BANK_ACCOUNTS = [
  { id: "bank-1", bankName: "HDFC Bank", last4: "4521", ifsc: "HDFC0001234" },
];

export const MOCK_INVOICES = [
  { id: "inv-1", label: "Farmstay booking — Coorg Meadows", amount: 12500, date: "12 Jun 2026", status: "Paid" },
  { id: "inv-2", label: "Venue booking — Grand Ballroom", amount: 48000, date: "02 May 2026", status: "Paid" },
  { id: "inv-3", label: "Workspace day pass", amount: 1800, date: "18 Apr 2026", status: "Refunded" },
];

export const MOCK_ADDRESSES = [
  {
    id: "addr-home",
    type: "home",
    line1: "42, Palm Meadows Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    isDefault: true,
  },
  {
    id: "addr-office",
    type: "office",
    line1: "3rd Floor, WeWork Galaxy",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560025",
    isDefault: false,
  },
];

export const MOCK_CONNECTED_ACCOUNTS = [
  { id: "google", connected: true, value: "vb.develop2@gmail.com" },
  { id: "facebook", connected: false, value: null },
  { id: "apple", connected: false, value: null },
  { id: "phone", connected: true, value: "+91 98••••210" },
];

export const MOCK_REWARDS_HISTORY = [
  { id: "rw-1", label: "Booking reward — Coorg Meadows", points: 250, date: "12 Jun 2026" },
  { id: "rw-2", label: "Referral bonus", points: 500, date: "28 May 2026" },
  { id: "rw-3", label: "Redeemed on checkout", points: -300, date: "02 May 2026" },
];

export const MOCK_COUPONS = [
  { id: "cp-1", title: "10% off your next farmstay", tag: "FARM10", expiry: "31 Aug 2026" },
  { id: "cp-2", title: "Flat ₹500 off venues above ₹20,000", tag: "VENUE500", expiry: "15 Sep 2026" },
];

export const MOCK_HOST_BUSINESS = {
  legalName: "Shawn Ventures Pvt Ltd",
  gstin: "29ABCDE1234F1Z5",
  kycStatus: "verified",
  payoutAccount: "HDFC Bank •••• 4521",
};
