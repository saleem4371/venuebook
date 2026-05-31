/**
 * Messages — Mock Data
 * Replace with API integration when backend is ready.
 */

export const MOCK_CATEGORIES = [
  { key: "all",      label: "All"      },
  { key: "guests",   label: "Guests"   },
  { key: "leads",    label: "Leads"    },
  { key: "bookings", label: "Bookings" },
  { key: "team",     label: "Team"     },
  { key: "support",  label: "Support"  },
  { key: "system",   label: "System"   },
];

export const CATEGORY_STYLES = {
  guests:   { pill: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"               },
  leads:    { pill: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"   },
  bookings: { pill: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"       },
  team:     { pill: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"           },
  support:  { pill: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"                   },
  system:   { pill: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"                 },
};

export const MOCK_CONVERSATIONS = [
  /* ── GUESTS ─────────────────────────────────────────────────── */
  {
    id: "1",
    category: "guests",
    contact: { name: "Priya Sharma",     initials: "PS", color: "from-pink-500 to-rose-400",     isOnline: true  },
    venue:   "The Grand Pavilion",
    subject: "Wedding Reception – March 15",
    lastMessage: "Could you confirm the decoration setup time?",
    time:    "10:42 AM",
    unread:  3,
    pinned:  true,
    messages: [
      { id: "m1", role: "them", text: "Hi! I'm interested in booking The Grand Pavilion for my wedding reception.", time: "9:00 AM",  date: "Today" },
      { id: "m2", role: "me",   text: "Hello Priya! We'd love to help you celebrate at The Grand Pavilion. What date are you considering?", time: "9:05 AM", date: "Today" },
      { id: "m3", role: "them", text: "March 15th. We're expecting around 250 guests.", time: "9:08 AM",  date: "Today" },
      { id: "m4", role: "me",   text: "Wonderful! The Pavilion accommodates up to 400 guests with full catering and décor support.", time: "9:12 AM", date: "Today" },
      { id: "m5", role: "them", text: "That's perfect! Do you offer in-house catering?", time: "9:20 AM",  date: "Today" },
      { id: "m6", role: "me",   text: "Yes — our exclusive culinary team offers both Indian and Continental menus tailored to your event.", time: "9:25 AM", date: "Today" },
      { id: "m7", role: "them", text: "Could you confirm the decoration setup time?", time: "10:42 AM", date: "Today" },
    ],
  },
  {
    id: "2",
    category: "guests",
    contact: { name: "Arjun Mehta",      initials: "AM", color: "from-blue-500 to-indigo-500",   isOnline: false },
    venue:   "Sunset Gardens",
    subject: "Corporate Event – 50 Pax",
    lastMessage: "What's the AV setup like at Sunset Gardens?",
    time:    "Yesterday",
    unread:  1,
    pinned:  false,
    messages: [
      { id: "m1", role: "them", text: "We're planning a corporate offsite for 50 people at Sunset Gardens.", time: "2:00 PM", date: "Yesterday" },
      { id: "m2", role: "me",   text: "Great choice! Sunset Gardens has a dedicated conference hall for up to 80 guests.", time: "2:15 PM", date: "Yesterday" },
      { id: "m3", role: "them", text: "What's the AV setup like at Sunset Gardens?", time: "3:30 PM", date: "Yesterday" },
    ],
  },

  /* ── LEADS ──────────────────────────────────────────────────── */
  {
    id: "3",
    category: "leads",
    contact: { name: "Meera Kapoor",     initials: "MK", color: "from-emerald-500 to-teal-500",  isOnline: true  },
    venue:   "Crystal Ballroom",
    subject: "Birthday Celebration – Inquiry",
    lastMessage: "Is the Crystal Ballroom available on June 22nd?",
    time:    "Mon",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "them", text: "Hello! I'm planning a 30th birthday party for about 80 guests.", time: "11:00 AM", date: "Mon" },
      { id: "m2", role: "me",   text: "Hi Meera! Crystal Ballroom would be perfect for an 80-person celebration.", time: "11:30 AM", date: "Mon" },
      { id: "m3", role: "them", text: "Is the Crystal Ballroom available on June 22nd?", time: "12:00 PM", date: "Mon" },
    ],
  },
  {
    id: "8",
    category: "leads",
    contact: { name: "Kavya Nair",       initials: "KN", color: "from-cyan-500 to-sky-500",      isOnline: false },
    venue:   "Skyline Terrace",
    subject: "Engagement Ceremony Inquiry",
    lastMessage: "Do you have an outdoor area with a city view?",
    time:    "Fri",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "them", text: "Hello! We're looking for a venue for an engagement ceremony with a nice view.", time: "3:00 PM", date: "Fri" },
      { id: "m2", role: "me",   text: "Skyline Terrace is perfect — a rooftop space with panoramic city views.", time: "3:30 PM", date: "Fri" },
      { id: "m3", role: "them", text: "Do you have an outdoor area with a city view?", time: "4:00 PM", date: "Fri" },
    ],
  },

  /* ── BOOKINGS ───────────────────────────────────────────────── */
  {
    id: "4",
    category: "bookings",
    contact: { name: "Rahul Verma",      initials: "RV", color: "from-violet-500 to-purple-500", isOnline: false },
    venue:   "Heritage Hall",
    subject: "Booking #BK-2024-0892",
    lastMessage: "Payment confirmed. See you Saturday!",
    time:    "Mon",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "Hi Rahul, your booking for Heritage Hall on Saturday is confirmed!", time: "10:00 AM", date: "Mon" },
      { id: "m2", role: "them", text: "Thank you! What time should the caterer arrive?", time: "10:15 AM", date: "Mon" },
      { id: "m3", role: "me",   text: "The caterer can set up from 10 AM. The event starts at 7 PM.", time: "10:20 AM", date: "Mon" },
      { id: "m4", role: "them", text: "Payment confirmed. See you Saturday!", time: "11:00 AM", date: "Mon" },
    ],
  },
  {
    id: "9",
    category: "bookings",
    contact: { name: "Sunita Reddy",     initials: "SR", color: "from-rose-400 to-pink-500",     isOnline: true  },
    venue:   "The Grand Pavilion",
    subject: "Booking #BK-2024-0901 – Anniversary",
    lastMessage: "We've confirmed the floral arrangement. Thank you!",
    time:    "Today",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "them", text: "Hello! I wanted to check on the floral arrangements for our anniversary dinner.", time: "8:00 AM", date: "Today" },
      { id: "m2", role: "me",   text: "Hi Sunita! Our décor team has confirmed white orchids and candle centrepieces as requested.", time: "8:30 AM", date: "Today" },
      { id: "m3", role: "them", text: "We've confirmed the floral arrangement. Thank you!", time: "9:00 AM", date: "Today" },
    ],
  },

  /* ── TEAM ───────────────────────────────────────────────────── */
  {
    id: "5",
    category: "team",
    contact: { name: "Sales Team",       initials: "ST", color: "from-orange-400 to-amber-500",  isOnline: true  },
    venue:   null,
    subject: "Weekly Sales Standup",
    lastMessage: "Alice: Don't forget the EOD report today",
    time:    "9:30 AM",
    unread:  5,
    pinned:  true,
    messages: [
      { id: "m1", role: "them", sender: "Alice", text: "Good morning team! Reminder — 3 venue tours this week.", time: "9:00 AM", date: "Today" },
      { id: "m2", role: "me",                    text: "On it. I'll coordinate with The Grand Pavilion for Tuesday.", time: "9:10 AM", date: "Today" },
      { id: "m3", role: "them", sender: "Bob",   text: "Crystal Ballroom tour confirmed for Wednesday 2 PM.", time: "9:20 AM", date: "Today" },
      { id: "m4", role: "them", sender: "Alice", text: "Don't forget the EOD report today", time: "9:30 AM", date: "Today" },
    ],
  },

  /* ── SUPPORT ────────────────────────────────────────────────── */
  {
    id: "6",
    category: "support",
    contact: { name: "VenueBook Support", initials: "VS", color: "from-slate-500 to-gray-600",   isOnline: true  },
    venue:   null,
    subject: "Billing Issue – INV-2024-0341",
    lastMessage: "Our billing team will review within 24 hours.",
    time:    "Sun",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "Hi Support, I noticed a discrepancy in invoice INV-2024-0341.", time: "2:00 PM", date: "Sun" },
      { id: "m2", role: "them", text: "Thanks for reaching out! Can you share the invoice details?", time: "2:10 PM", date: "Sun" },
      { id: "m3", role: "me",   text: "The amount charged was ₹45,000 but the agreed amount was ₹42,000.", time: "2:15 PM", date: "Sun" },
      { id: "m4", role: "them", text: "Our billing team will review within 24 hours.", time: "2:30 PM", date: "Sun" },
    ],
  },

  /* ── SYSTEM ─────────────────────────────────────────────────── */
  {
    id: "7",
    category: "system",
    contact: { name: "VenueBook",        initials: "VB", color: "from-violet-600 to-indigo-600", isOnline: true  },
    venue:   null,
    subject: "New Booking Alert",
    lastMessage: "New booking request for The Grand Pavilion.",
    time:    "8:15 AM",
    unread:  2,
    pinned:  false,
    messages: [
      { id: "m1", role: "them", text: "🎉 New booking request received for The Grand Pavilion on April 5th.", time: "8:15 AM", date: "Today" },
      { id: "m2", role: "them", text: "Guest: Sunita Reddy · Event: Anniversary Dinner · Guests: 30 · Amount: ₹85,000", time: "8:15 AM", date: "Today" },
    ],
  },
];
