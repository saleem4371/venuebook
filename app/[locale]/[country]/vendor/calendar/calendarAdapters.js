/**
 * calendarAdapters.js
 * ──────────────────────────────────────────────────────────────────────────
 * Per-category configuration engine for VenueBook's adaptive calendar.
 *
 * TO ADD A NEW CATEGORY:
 *   1. Add an entry to CALENDAR_ADAPTERS below.
 *   2. Provide: defaultView, label, gradient, accent, resources, metrics,
 *               sidebarSections, listings, bookingLabel, guestLabel.
 *   3. Add mock bookings.  No other file changes needed.
 */

import dayjs from "dayjs";

const today = dayjs();
const f     = (d) => d.format("YYYY-MM-DD");

/* ─────────────────────────── RESOURCES ─────────────────────────────────── */
const RESOURCES = {
  venues: [
    { id: "hall-a",  label: "Grand Ballroom",   icon: "🏛️", capacity: 500 },
    { id: "hall-b",  label: "Crystal Hall",     icon: "💎", capacity: 300 },
    { id: "outdoor", label: "Outdoor Lawn",     icon: "🌿", capacity: 800 },
    { id: "lounge",  label: "Executive Lounge", icon: "🛋️", capacity: 80  },
  ],
  farmstays: [
    { id: "cottage", label: "Riverside Cottage", icon: "🏡", capacity: 4 },
    { id: "villa",   label: "Forest Villa",      icon: "🌲", capacity: 8 },
    { id: "tent-a",  label: "Glamping Tent A",   icon: "⛺", capacity: 2 },
    { id: "tent-b",  label: "Glamping Tent B",   icon: "⛺", capacity: 2 },
  ],
  studios: [
    { id: "studio-1",  label: "Studio A",         icon: "🎬", capacity: 10 },
    { id: "recording", label: "Recording Suite",  icon: "🎙️", capacity: 4  },
    { id: "photo",     label: "Photo Studio",     icon: "📸", capacity: 6  },
    { id: "podcast",   label: "Podcast Room",     icon: "🎧", capacity: 3  },
  ],
  workspaces: [
    { id: "conf-a",   label: "Conference A",  icon: "🏢", capacity: 12 },
    { id: "conf-b",   label: "Conference B",  icon: "🏢", capacity: 8  },
    { id: "desk-hot", label: "Hot Desks",     icon: "💻", capacity: 20 },
    { id: "phone",    label: "Phone Booths",  icon: "📞", capacity: 2  },
  ],
  rentals: [
    { id: "cam-1",    label: "Camera Kit A",  icon: "📷", capacity: 1 },
    { id: "drone",    label: "Drone DJI Pro", icon: "🚁", capacity: 1 },
    { id: "lighting", label: "Lighting Rig",  icon: "💡", capacity: 1 },
    { id: "van",      label: "Cargo Van",     icon: "🚐", capacity: 1 },
  ],
  experiences: [
    { id: "trek",  label: "Mountain Trek",      icon: "🏔️", capacity: 15 },
    { id: "cook",  label: "Cooking Class",      icon: "👨‍🍳", capacity: 12 },
    { id: "yoga",  label: "Yoga Session",       icon: "🧘", capacity: 20 },
    { id: "paint", label: "Painting Workshop",  icon: "🎨", capacity: 10 },
  ],
};

/* ─────────────────────────── MOCK BOOKINGS ─────────────────────────────── */
const MOCK_BOOKINGS = {
  venues: [
    {
      id: "v1", resourceId: "hall-a",
      title: "Sharma Wedding",
      date: f(today), startTime: "10:00", endTime: "22:00",
      status: "confirmed", guests: 450, type: "Wedding",
      amount: 285000,
      customer: { name: "Raj Sharma", phone: "+91 98765 43210", email: "raj@example.com" },
      notes: "Requires floral arch setup by 9am. Catering by Royal Feast.",
      team: ["Priya (Coordinator)", "Akash (Decor)"],
    },
    {
      id: "v2", resourceId: "hall-b",
      title: "TechCorp Annual Meet",
      date: f(today), startTime: "09:00", endTime: "18:00",
      status: "confirmed", guests: 250, type: "Corporate",
      amount: 125000,
      customer: { name: "Anita Mehta", phone: "+91 87654 32109", email: "anita@techcorp.com" },
      notes: "AV setup required. 10 breakout tables.",
      team: ["Raj (AV Tech)"],
    },
    {
      id: "v3", resourceId: "outdoor",
      title: "Setup Buffer",
      date: f(today), startTime: "07:00", endTime: "10:00",
      status: "buffer", guests: 0, type: "Setup",
      amount: 0, customer: null, notes: "Pre-event setup time", team: [],
    },
    {
      id: "v4", resourceId: "hall-a",
      title: "Gupta Engagement",
      date: f(today.add(1, "day")), startTime: "17:00", endTime: "23:00",
      status: "tentative", guests: 180, type: "Engagement",
      amount: 95000,
      customer: { name: "Suresh Gupta", phone: "+91 77777 88888", email: "suresh@gmail.com" },
      notes: "Awaiting advance payment confirmation.",
      team: ["Priya (Coordinator)"],
    },
    {
      id: "v5", resourceId: "lounge",
      title: "Product Launch Night",
      date: f(today.add(2, "day")), startTime: "14:00", endTime: "20:00",
      status: "confirmed", guests: 75, type: "Corporate",
      amount: 45000,
      customer: { name: "Deepa Nair", phone: "+91 99999 00000", email: "deepa@startup.in" },
      notes: "Cocktail evening setup. Premium AV.",
      team: ["Raj (AV)", "Meera (Catering)"],
    },
    {
      id: "v6", resourceId: "hall-a",
      title: "Kumar Birthday Gala",
      date: f(today.add(5, "day")), startTime: "19:00", endTime: "23:59",
      status: "confirmed", guests: 320, type: "Birthday",
      amount: 165000,
      customer: { name: "Vinod Kumar", phone: "+91 88888 11111", email: "vinod@gmail.com" },
      notes: "DJ required. Cake from Theobroma.",
      team: [],
    },
    {
      id: "v7", resourceId: "hall-b",
      title: "MedTech Conference 2026",
      date: f(today.add(7, "day")), startTime: "09:00", endTime: "17:00",
      status: "confirmed", guests: 280, type: "Conference",
      amount: 140000,
      customer: { name: "Dr. Sharma", phone: "+91 77777 22222", email: "dr.sharma@medtech.com" },
      notes: "Projector + podium required.",
      team: [],
    },
    {
      id: "v8", resourceId: "outdoor",
      title: "Patel Reception",
      date: f(today.add(3, "day")), startTime: "18:00", endTime: "23:00",
      status: "confirmed", guests: 600, type: "Wedding Reception",
      amount: 220000,
      customer: { name: "Ravi Patel", phone: "+91 88888 99999", email: "ravi@patel.com" },
      notes: "Outdoor fairy lights + stage setup.",
      team: ["Stage Crew", "Lighting Team"],
    },
  ],

  farmstays: [
    {
      id: "f1", resourceId: "cottage",
      title: "Mehta Family Stay",
      date: f(today.subtract(1, "day")), endDate: f(today.add(2, "day")),
      status: "occupied", guests: 4, nights: 3, amount: 18000,
      customer: { name: "Anil Mehta", phone: "+91 98765 00000", email: "anil@gmail.com" },
      notes: "Early check-in requested. Vegetarian meals only.",
      team: [],
    },
    {
      id: "f2", resourceId: "villa",
      title: "Patel Anniversary",
      date: f(today), endDate: f(today.add(3, "day")),
      status: "checkin", guests: 6, nights: 3, amount: 36000,
      customer: { name: "Rakesh Patel", phone: "+91 99999 11111", email: "rakesh@patel.com" },
      notes: "Anniversary decoration in room.",
      team: ["Sunita (Housekeeping)"],
    },
    {
      id: "f3", resourceId: "tent-a",
      title: "Cleaning",
      date: f(today), endDate: f(today),
      status: "cleaning", guests: 0, nights: 0, amount: 0,
      customer: null, notes: "Post-checkout deep clean", team: ["Cleaning Crew"],
    },
    {
      id: "f4", resourceId: "tent-b",
      title: "Shah Couple Getaway",
      date: f(today.add(2, "day")), endDate: f(today.add(4, "day")),
      status: "confirmed", guests: 2, nights: 2, amount: 8000,
      customer: { name: "Nikhil Shah", phone: "+91 88888 22222", email: "nikhil@shah.com" },
      notes: "Campfire + bonfire requested.",
      team: [],
    },
    {
      id: "f5", resourceId: "cottage",
      title: "Singh Family Retreat",
      date: f(today.add(4, "day")), endDate: f(today.add(7, "day")),
      status: "confirmed", guests: 4, nights: 3, amount: 18000,
      customer: { name: "Harjit Singh", phone: "+91 77777 33333", email: "harjit@singh.com" },
      notes: "",
      team: [],
    },
    {
      id: "f6", resourceId: "villa",
      title: "Corporate Off-site",
      date: f(today.add(8, "day")), endDate: f(today.add(10, "day")),
      status: "confirmed", guests: 8, nights: 2, amount: 48000,
      customer: { name: "Priya Verma", phone: "+91 99999 44444", email: "priya@corp.com" },
      notes: "Team building activities required.",
      team: [],
    },
  ],

  studios: [
    {
      id: "s1", resourceId: "studio-1",
      title: "Zara Brand Shoot",
      date: f(today), startTime: "09:00", endTime: "13:00",
      status: "session", guests: 8, equipment: ["Softbox x4", "Backdrop"],
      amount: 12000,
      customer: { name: "Zara India PR", phone: "+91 99999 44444", email: "pr@zara.in" },
      notes: "Fashion shoot. 3 outfit changes.",
      team: ["Suresh (DP)", "Priya (Stylist)"],
    },
    {
      id: "s2", resourceId: "recording",
      title: "Podcast: TechTalks Ep. 48",
      date: f(today), startTime: "14:00", endTime: "17:00",
      status: "recording", guests: 3, equipment: ["Mics x4", "Audio Interface"],
      amount: 6000,
      customer: { name: "Dev Kapoor", phone: "+91 88888 55555", email: "dev@techtalk.in" },
      notes: "Live streaming to YouTube.",
      team: [],
    },
    {
      id: "s3", resourceId: "photo",
      title: "Setup Buffer",
      date: f(today), startTime: "08:00", endTime: "09:00",
      status: "setup", guests: 0, equipment: [],
      amount: 0, customer: null, notes: "Pre-shoot setup", team: [],
    },
    {
      id: "s4", resourceId: "studio-1",
      title: "Music Video – Aryan",
      date: f(today.add(1, "day")), startTime: "10:00", endTime: "18:00",
      status: "session", guests: 12, equipment: ["Full Lighting Rig", "Drone"],
      amount: 32000,
      customer: { name: "Aryan Malhotra", phone: "+91 77777 66666", email: "aryan@music.com" },
      notes: "Dance crew of 8. Pyro clearance needed.",
      team: ["Vikram (Director)"],
    },
    {
      id: "s5", resourceId: "podcast",
      title: "The Finance Show",
      date: f(today.add(2, "day")), startTime: "11:00", endTime: "13:00",
      status: "recurring", guests: 2, equipment: ["Podcast Kit"],
      amount: 3000,
      customer: { name: "Money Matters Media", phone: "+91 99999 77777", email: "mm@finance.in" },
      notes: "Weekly recurring session (every Wed).",
      team: [],
    },
  ],

  workspaces: [
    {
      id: "w1", resourceId: "conf-a",
      title: "Acme Corp – Quarterly Review",
      date: f(today), startTime: "10:00", endTime: "13:00",
      status: "meeting", guests: 10, amount: 3000,
      customer: { name: "Priya Verma", phone: "+91 99999 77777", email: "priya@acme.com" },
      notes: "Video conferencing setup needed.",
      team: [],
    },
    {
      id: "w2", resourceId: "conf-b",
      title: "Startup Pitching Session",
      date: f(today), startTime: "14:00", endTime: "17:00",
      status: "booked", guests: 6, amount: 1800,
      customer: { name: "Rohan Agarwal", phone: "+91 88888 88888", email: "rohan@startup.io" },
      notes: "",
      team: [],
    },
    {
      id: "w3", resourceId: "desk-hot",
      title: "Freelancer Day Pass",
      date: f(today), startTime: "09:00", endTime: "18:00",
      status: "booked", guests: 15, amount: 7500,
      customer: { name: "Multiple Members", phone: "", email: "" },
      notes: "15 day passes sold.",
      team: [],
    },
    {
      id: "w4", resourceId: "conf-a",
      title: "BrightMind – Weekly Standup",
      date: f(today.add(1, "day")), startTime: "09:00", endTime: "10:00",
      status: "recurring", guests: 8, amount: 800,
      customer: { name: "Rahul Dev", phone: "+91 77777 99999", email: "rahul@brightmind.io" },
      notes: "Recurring every Tuesday.",
      team: [],
    },
    {
      id: "w5", resourceId: "phone",
      title: "Interview Slots",
      date: f(today.add(2, "day")), startTime: "10:00", endTime: "16:00",
      status: "booked", guests: 4, amount: 1200,
      customer: { name: "InnovateTech HR", phone: "+91 88888 00000", email: "hr@innovate.in" },
      notes: "4 × 90-min interview blocks.",
      team: [],
    },
  ],

  rentals: [
    {
      id: "r1", resourceId: "cam-1",
      title: "Wedding Shoot – Mehra",
      date: f(today), endDate: f(today.add(2, "day")),
      status: "rented", guests: 1, amount: 4500,
      customer: { name: "Karan Mehra", phone: "+91 98765 12345", email: "karan@photo.com" },
      notes: "Camera Kit A. Return by Sunday 6pm.",
      team: [],
    },
    {
      id: "r2", resourceId: "drone",
      title: "Corporate Aerial",
      date: f(today), endDate: f(today.add(1, "day")),
      status: "pickup", guests: 1, amount: 3000,
      customer: { name: "Vista Films", phone: "+91 88888 12345", email: "vista@films.in" },
      notes: "Pickup at 8am. FAA clearance provided.",
      team: [],
    },
    {
      id: "r3", resourceId: "lighting",
      title: "Maintenance Check",
      date: f(today.add(3, "day")), endDate: f(today.add(3, "day")),
      status: "maintenance", guests: 0, amount: 0,
      customer: null, notes: "Annual calibration + bulb replacement", team: [],
    },
    {
      id: "r4", resourceId: "van",
      title: "Event Equipment Delivery",
      date: f(today.add(1, "day")), endDate: f(today.add(1, "day")),
      status: "dropoff", guests: 1, amount: 2000,
      customer: { name: "Royal Events", phone: "+91 77777 12345", email: "royal@events.in" },
      notes: "Delivery to Grand Palace. 2-hour window.",
      team: [],
    },
  ],

  experiences: [
    {
      id: "e1", resourceId: "trek",
      title: "Himalayan Sunrise Trek",
      date: f(today.add(2, "day")), startTime: "05:00", endTime: "12:00",
      status: "confirmed", guests: 12, capacity: 15, amount: 18000,
      customer: { name: "Group Booking", phone: "+91 99999 55555", email: "" },
      notes: "12 of 15 slots filled. Includes breakfast pack.",
      team: ["Arjun (Trek Guide)"],
    },
    {
      id: "e2", resourceId: "cook",
      title: "Rajasthani Cooking Masterclass",
      date: f(today.add(3, "day")), startTime: "10:00", endTime: "13:00",
      status: "full", guests: 12, capacity: 12, amount: 14400,
      customer: { name: "Group Booking", phone: "+91 88888 55555", email: "" },
      notes: "Fully booked. Waitlist: 3 people.",
      team: ["Chef Meera"],
    },
    {
      id: "e3", resourceId: "yoga",
      title: "Morning Yoga Immersion",
      date: f(today), startTime: "07:00", endTime: "09:00",
      status: "confirmed", guests: 14, capacity: 20, amount: 7000,
      customer: { name: "Group Booking", phone: "", email: "" },
      notes: "Mats & blocks provided.",
      team: ["Sia (Yoga Instructor)"],
    },
    {
      id: "e4", resourceId: "paint",
      title: "Abstract Painting Workshop",
      date: f(today.add(5, "day")), startTime: "16:00", endTime: "19:00",
      status: "few_left", guests: 8, capacity: 10, amount: 8000,
      customer: { name: "Group Booking", phone: "", email: "" },
      notes: "2 seats remaining.",
      team: ["Riya (Art Instructor)"],
    },
  ],
};

/* ─────────────────────────── SIDEBAR SECTIONS ─────────────────────────── */
const SIDEBAR_SECTIONS = {
  venues: [
    {
      id: "spaces", label: "Spaces",
      items: [
        { id: "hall-a",  label: "Grand Ballroom",   color: "#a44bf3", dot: true },
        { id: "hall-b",  label: "Crystal Hall",     color: "#499ce8", dot: true },
        { id: "outdoor", label: "Outdoor Lawn",     color: "#10b981", dot: true },
        { id: "lounge",  label: "Executive Lounge", color: "#f59e0b", dot: true },
      ],
    },
    {
      id: "shifts", label: "Shift Templates",
      items: [
        { id: "morning",   label: "Morning  6am–12pm", color: "#f59e0b", dot: false },
        { id: "afternoon", label: "Noon  12pm–6pm",    color: "#f97316", dot: false },
        { id: "evening",   label: "Evening  6pm–12am", color: "#a44bf3", dot: false },
        { id: "fullday",   label: "Full Day",           color: "#499ce8", dot: false },
      ],
    },
    {
      id: "vendors", label: "Vendors On-call",
      items: [
        { id: "feast",  label: "Royal Feast (Catering)", color: "#10b981", dot: false },
        { id: "bloom",  label: "Bloom Decor",            color: "#ec4899", dot: false },
        { id: "sound",  label: "SoundMax AV",            color: "#3b82f6", dot: false },
        { id: "flash",  label: "FlashStudio Photo",      color: "#f59e0b", dot: false },
      ],
    },
  ],
  farmstays: [
    {
      id: "units", label: "Room Units",
      items: [
        { id: "cottage", label: "Riverside Cottage", color: "#22c55e", dot: true },
        { id: "villa",   label: "Forest Villa",      color: "#14b8a6", dot: true },
        { id: "tent-a",  label: "Glamping Tent A",   color: "#84cc16", dot: true },
        { id: "tent-b",  label: "Glamping Tent B",   color: "#10b981", dot: true },
      ],
    },
    {
      id: "housekeeping", label: "Housekeeping",
      items: [
        { id: "cleaning",  label: "Cleaning Crew",  color: "#8b5cf6", dot: false },
        { id: "laundry",   label: "Laundry Service",color: "#6366f1", dot: false },
        { id: "roomsvc",   label: "Room Service",   color: "#f59e0b", dot: false },
      ],
    },
    {
      id: "rates", label: "Seasonal Pricing",
      items: [
        { id: "peak",     label: "Peak Season",      color: "#ef4444", dot: false },
        { id: "offpeak",  label: "Off-Peak Season",  color: "#10b981", dot: false },
        { id: "weekend",  label: "Weekend Premium",  color: "#f97316", dot: false },
      ],
    },
  ],
  studios: [
    {
      id: "studios", label: "Studio Spaces",
      items: [
        { id: "studio-1",  label: "Studio A",         color: "#f59e0b", dot: true },
        { id: "recording", label: "Recording Suite",  color: "#ef4444", dot: true },
        { id: "photo",     label: "Photo Studio",     color: "#f97316", dot: true },
        { id: "podcast",   label: "Podcast Room",     color: "#8b5cf6", dot: true },
      ],
    },
    {
      id: "equipment", label: "Equipment",
      items: [
        { id: "lighting", label: "Lighting Rigs",  color: "#f59e0b", dot: false },
        { id: "camera",   label: "Camera Systems", color: "#ef4444", dot: false },
        { id: "audio",    label: "Audio Gear",     color: "#8b5cf6", dot: false },
        { id: "drone",    label: "Drone Kit",      color: "#3b82f6", dot: false },
      ],
    },
    {
      id: "crew", label: "Available Crew",
      items: [
        { id: "suresh",  label: "Suresh (DP)",      color: "#10b981", dot: false },
        { id: "priya",   label: "Priya (Stylist)",  color: "#ec4899", dot: false },
        { id: "vikram",  label: "Vikram (Director)",color: "#f59e0b", dot: false },
      ],
    },
  ],
  workspaces: [
    {
      id: "rooms", label: "Meeting Rooms",
      items: [
        { id: "conf-a",  label: "Conference A",  color: "#3b82f6", dot: true },
        { id: "conf-b",  label: "Conference B",  color: "#06b6d4", dot: true },
        { id: "phone",   label: "Phone Booths",  color: "#6366f1", dot: true },
      ],
    },
    {
      id: "desks", label: "Desk Types",
      items: [
        { id: "hot",    label: "Hot Desks (20)",       color: "#10b981", dot: false },
        { id: "ded",    label: "Dedicated Desks (10)", color: "#3b82f6", dot: false },
        { id: "office", label: "Private Office (2)",   color: "#8b5cf6", dot: false },
      ],
    },
    {
      id: "teams", label: "Registered Teams",
      items: [
        { id: "acme",    label: "Acme Corp",    color: "#f59e0b", dot: false },
        { id: "bright",  label: "BrightMind",   color: "#10b981", dot: false },
        { id: "startup", label: "StartupHub",   color: "#ec4899", dot: false },
      ],
    },
  ],
  rentals: [
    {
      id: "inventory", label: "Inventory",
      items: [
        { id: "cam-1",    label: "Camera Kit A",   color: "#ec4899", dot: true },
        { id: "drone",    label: "Drone DJI Pro",  color: "#8b5cf6", dot: true },
        { id: "lighting", label: "Lighting Rig",   color: "#f59e0b", dot: true },
        { id: "van",      label: "Cargo Van",      color: "#3b82f6", dot: true },
      ],
    },
    {
      id: "status", label: "Item Status",
      items: [
        { id: "avail",  label: "Available",      color: "#10b981", dot: false },
        { id: "rented", label: "Rented Out",     color: "#ec4899", dot: false },
        { id: "maint",  label: "Maintenance",    color: "#ef4444", dot: false },
      ],
    },
  ],
  experiences: [
    {
      id: "sessions", label: "Session Types",
      items: [
        { id: "trek",  label: "Mountain Trek",      color: "#f97316", dot: true },
        { id: "cook",  label: "Cooking Class",      color: "#eab308", dot: true },
        { id: "yoga",  label: "Yoga Session",       color: "#10b981", dot: true },
        { id: "paint", label: "Painting Workshop",  color: "#ec4899", dot: true },
      ],
    },
    {
      id: "hosts", label: "Hosts",
      items: [
        { id: "arjun", label: "Arjun (Trek Guide)", color: "#f97316", dot: false },
        { id: "meera", label: "Chef Meera",          color: "#eab308", dot: false },
        { id: "sia",   label: "Sia (Yoga)",          color: "#10b981", dot: false },
        { id: "riya",  label: "Riya (Art)",          color: "#ec4899", dot: false },
      ],
    },
  ],
};

/* ─────────────────────────── ADAPTER MAP ───────────────────────────────── */
export const CALENDAR_ADAPTERS = {
  venues: {
    defaultView:  "timeline",
    label:        "Venue Calendar",
    gradient:     "linear-gradient(242deg, #a44bf3, #499ce8)",
    accent:       "#a44bf3",
    accentRgb:    "164,75,243",
    resources:    RESOURCES.venues,
    bookings:     MOCK_BOOKINGS.venues,
    sidebarSections: SIDEBAR_SECTIONS.venues,
    listings:     ["Grand Palace Venue", "Royal Garden Estate", "Sky Lounge Tower"],
    resourceLabel:"Space",
    bookingLabel: "Event",
    guestLabel:   "PAX",
    timeMode:     "intraday",   // intraday = startTime/endTime within a day
  },
  farmstays: {
    defaultView:  "month",
    label:        "Farmstay Calendar",
    gradient:     "linear-gradient(242deg, #22c55e, #14b8a6)",
    accent:       "#22c55e",
    accentRgb:    "34,197,94",
    resources:    RESOURCES.farmstays,
    bookings:     MOCK_BOOKINGS.farmstays,
    sidebarSections: SIDEBAR_SECTIONS.farmstays,
    listings:     ["Sunrise Farmstay", "Valley Retreat", "Mango Grove Camp"],
    resourceLabel:"Unit",
    bookingLabel: "Stay",
    guestLabel:   "Guests",
    timeMode:     "multiday",   // multiday = date → endDate spanning calendar
  },
  studios: {
    defaultView:  "week",
    label:        "Studio Calendar",
    gradient:     "linear-gradient(242deg, #f59e0b, #ef4444)",
    accent:       "#f59e0b",
    accentRgb:    "245,158,11",
    resources:    RESOURCES.studios,
    bookings:     MOCK_BOOKINGS.studios,
    sidebarSections: SIDEBAR_SECTIONS.studios,
    listings:     ["LensArt Studios", "SoundBox Studio"],
    resourceLabel:"Studio",
    bookingLabel: "Session",
    guestLabel:   "Crew",
    timeMode:     "intraday",
  },
  workspaces: {
    defaultView:  "week",
    label:        "Workspace Calendar",
    gradient:     "linear-gradient(242deg, #3b82f6, #06b6d4)",
    accent:       "#3b82f6",
    accentRgb:    "59,130,246",
    resources:    RESOURCES.workspaces,
    bookings:     MOCK_BOOKINGS.workspaces,
    sidebarSections: SIDEBAR_SECTIONS.workspaces,
    listings:     ["WeWork BKC", "The Hive Andheri", "Innov8 Workcafe"],
    resourceLabel:"Space",
    bookingLabel: "Booking",
    guestLabel:   "Members",
    timeMode:     "intraday",
  },
  rentals: {
    defaultView:  "month",
    label:        "Rental Calendar",
    gradient:     "linear-gradient(242deg, #ec4899, #8b5cf6)",
    accent:       "#ec4899",
    accentRgb:    "236,72,153",
    resources:    RESOURCES.rentals,
    bookings:     MOCK_BOOKINGS.rentals,
    sidebarSections: SIDEBAR_SECTIONS.rentals,
    listings:     ["ProGear Rentals", "FilmKit Pro"],
    resourceLabel:"Item",
    bookingLabel: "Rental",
    guestLabel:   "Qty",
    timeMode:     "multiday",
  },
  experiences: {
    defaultView:  "month",
    label:        "Experience Calendar",
    gradient:     "linear-gradient(242deg, #f97316, #eab308)",
    accent:       "#f97316",
    accentRgb:    "249,115,22",
    resources:    RESOURCES.experiences,
    bookings:     MOCK_BOOKINGS.experiences,
    sidebarSections: SIDEBAR_SECTIONS.experiences,
    listings:     ["Wild Trails Experiences", "Urban Craft Studio"],
    resourceLabel:"Session",
    bookingLabel: "Experience",
    guestLabel:   "Attendees",
    timeMode:     "intraday",
  },
};

export function getAdapter(category) {
  return CALENDAR_ADAPTERS[category] ?? CALENDAR_ADAPTERS.venues;
}

/* ── Filter bookings by current view date range ─ */
export function filterBookingsForDate(bookings, date, mode = "all") {
  const d = date.format("YYYY-MM-DD");
  return bookings.filter((b) => {
    if (mode === "day") return b.date === d;
    return true; // month/week views filter inside the component
  });
}
