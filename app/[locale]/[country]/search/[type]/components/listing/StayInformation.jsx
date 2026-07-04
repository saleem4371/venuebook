"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble, Bath, Users, User, CheckCircle2, ChevronDown, X, Info,
  Clock, MapPin, Wifi, Phone, ShieldCheck, Flame, Leaf, Waves, TreePine,
  Coffee, Droplets, Mountain, Sunrise, Sparkles, Zap, Building2, Star,
  PawPrint, UtensilsCrossed, Music, Camera, Lock, Key, Moon, AlertTriangle,
  ParkingSquare, Bike, Fish, CigaretteOff, Baby, Globe, Calendar,
  MessageSquare, Smartphone,
} from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";

// ─── Emerald colour tokens (farmstay) ─────────────────────────────────────────
const C = {
  iconBg:  "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  accent:  "text-emerald-600 dark:text-emerald-400",
  pill:    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  bar:     "bg-emerald-500",
  check:   "text-emerald-500",
  more:    "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
};

// ─── Static mock data ─────────────────────────────────────────────────────────

const QUICK_FACTS = [
  { Icon: Users,         label: "Sleeps 12 Guests"  },
  { Icon: BedDouble,     label: "4 Bedrooms"         },
  { Icon: Bath,          label: "3 Bathrooms"        },
  { Icon: PawPrint,      label: "Pet Friendly"       },
  { Icon: ParkingSquare, label: "Free Parking"       },
  { Icon: Coffee,        label: "Breakfast Included" },
  { Icon: Clock,         label: "Check-in 3 PM"      },
  { Icon: Moon,          label: "Check-out 11 AM"    },
];

const BEDROOMS = [
  {
    name:     "Master Suite",
    bed:      "King Bed",
    features: ["Ensuite Bathroom", "Garden View", "Air Conditioning", "Safe Box"],
    badge:    "Best for Couples",
    bdgCls:   "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900",
  },
  {
    name:     "Second Bedroom",
    bed:      "Queen Bed",
    features: ["Shared Bathroom", "Mountain View", "Air Conditioning", "Wardrobe"],
    badge:    "Private Room",
    bdgCls:   "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900",
  },
  {
    name:     "Third Bedroom",
    bed:      "2 Single Beds",
    features: ["Shared Bathroom", "Courtyard View", "Fan Cooling", "Study Desk"],
    badge:    "Family Friendly",
    bdgCls:   "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900",
  },
  {
    name:     "Fourth Bedroom",
    bed:      "Double Bed",
    features: ["Shared Bathroom", "Garden Access", "Natural Ventilation", "Reading Nook"],
    badge:    "Cosy & Quiet",
    bdgCls:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900",
  },
];

const BATHROOM_FEATURES = ["Hot Water", "Towels Included", "Hair Dryer", "Toiletries", "Hand Wash"];

const HOUSE_RULES = [
  { Icon: Clock,         title: "Check-in",       desc: "3:00 PM – 8:00 PM. Early check-in subject to availability." },
  { Icon: Moon,          title: "Check-out",      desc: "11:00 AM. Late check-out chargeable at ₹500/hour." },
  { Icon: Users,         title: "Max Guests",      desc: "Up to 12 guests. No additional visitors beyond the booking." },
  { Icon: CigaretteOff,  title: "No Smoking",     desc: "Smoking prohibited inside rooms and all covered areas." },
  { Icon: Music,         title: "Events",          desc: "Personal gatherings allowed. No DJ or loud events after 10 PM." },
  { Icon: PawPrint,      title: "Pets",            desc: "Welcome with prior notice. Leash required in common areas." },
  { Icon: Baby,          title: "Children",        desc: "All ages welcome. Cots and high chairs available on request." },
  { Icon: Moon,          title: "Quiet Hours",     desc: "Please maintain quiet between 11 PM and 7 AM." },
  { Icon: Users,         title: "Day Visitors",    desc: "Permitted until 7 PM with host intimation." },
  { Icon: ShieldCheck,   title: "Alcohol",         desc: "Permitted. Please drink responsibly. No glass near the pool." },
  { Icon: Camera,        title: "Drone Policy",    desc: "Drone usage requires prior permission from the host." },
];

const CANCELLATION = [
  { Icon: CheckCircle2,  title: "Free Cancellation", desc: "Full refund if cancelled 30+ days before check-in." },
  { Icon: Info,          title: "Partial Refund",    desc: "50% refund for cancellations 15–29 days before check-in." },
  { Icon: X,             title: "Non-refundable",    desc: "No refund for cancellations within 14 days of check-in." },
  { Icon: Calendar,      title: "Date Changes",      desc: "One free date change allowed with 15+ days' notice, subject to availability." },
  { Icon: Clock,         title: "Refund Timeline",   desc: "Approved refunds processed within 5–7 business days to the original payment method." },
];

const DAMAGE_ITEMS = [
  { Icon: ShieldCheck, title: "Refundable Hold",      desc: "₹10,000 security hold collected at check-in. Released within 48 hours of check-out after property inspection." },
  { Icon: User,        title: "Guest Responsibility", desc: "Guests are liable for intentional damage or loss beyond normal wear and tear." },
  { Icon: Clock,       title: "Inspection Timeline",  desc: "Property inspected within 24 hours of check-out. You'll be notified of any findings." },
  { Icon: Phone,       title: "Report Damage",        desc: "Please report any accidental damage immediately. Transparency is always appreciated and handled fairly." },
];

const ARRIVAL_ITEMS = [
  { Icon: Key,           title: "Check-in Process",  desc: "Self check-in via lockbox. Code shared 24 hours before arrival." },
  { Icon: ParkingSquare, title: "Parking",           desc: "Free private parking for up to 3 cars inside estate gates." },
  { Icon: MapPin,        title: "Navigation",        desc: "Use the Google Maps pin in your booking confirmation. Address alone may not be reliable." },
  { Icon: Lock,          title: "Property Access",   desc: "Main gate code provided in your confirmation. Keep the gate closed at all times." },
  { Icon: Wifi,          title: "WiFi",              desc: "Network name and password are in the welcome booklet inside the property." },
  { Icon: Phone,         title: "Host Contact",      desc: "Gaurav: +91 98765 43210. Response guaranteed within 30 minutes." },
  { Icon: AlertTriangle, title: "Emergency",         desc: "Nearest hospital: 8 km · Police: 5 km · Fire station: 6 km." },
];

const FACILITIES = [
  { Icon: TreePine,        title: "Coffee Plantation"   },
  { Icon: Leaf,            title: "Fruit Orchard"       },
  { Icon: Flame,           title: "Bonfire Area"        },
  { Icon: Sparkles,        title: "Organic Garden"      },
  { Icon: Waves,           title: "Swimming Pool"       },
  { Icon: Droplets,        title: "Private Lake"        },
  { Icon: Fish,            title: "Fishing Spot"        },
  { Icon: UtensilsCrossed, title: "Farm Activities"     },
  { Icon: Bike,            title: "Cycling Trail"       },
  { Icon: Baby,            title: "Children's Play Area"},
  { Icon: PawPrint,        title: "Animal Feeding"      },
  { Icon: Flame,           title: "BBQ Area"            },
];

const SAFETY = [
  { Icon: ShieldCheck,  title: "First Aid Kit",          desc: "Located in the main kitchen and host room." },
  { Icon: Flame,        title: "Fire Extinguisher",      desc: "Installed in kitchen, corridor and pool area." },
  { Icon: Camera,       title: "Outdoor CCTV",           desc: "Covering entrance gate, driveway and perimeter." },
  { Icon: Zap,          title: "Power Backup",           desc: "Generator backup for essential lighting and appliances." },
  { Icon: Phone,        title: "Emergency Contacts",     desc: "Listed in the welcome booklet and on the main entrance board." },
  { Icon: Droplets,     title: "Drinking Water",         desc: "RO-purified water available 24/7 in the main kitchen." },
  { Icon: MapPin,       title: "Medical Nearby",         desc: "KMC Hospital: 8 km · Kasturba Medical College: 11 km." },
];

const INTERNET = {
  speedMbps: 100,
  carriers: [
    { name: "Jio",    bars: 4, max: 5 },
    { name: "Airtel", bars: 4, max: 5 },
    { name: "Vi",     bars: 3, max: 5 },
  ],
  fiveG: false,
  workspaceFriendly: true,
};

// Empty array → Accessibility section is hidden entirely
const ACCESSIBILITY = [
  "Step-free Entrance",
  "Ground Floor Bedroom",
  "Accessible Parking",
  "Handrails on Steps",
];

const THINGS_TO_KNOW = [
  { title: "Government ID",        desc: "All guests must carry a valid government-issued photo ID for check-in. PAN card is not accepted." },
  { title: "Community Rules",      desc: "The estate is adjacent to an active coffee plantation. Please respect the agricultural schedule and avoid disturbing farm operations." },
  { title: "Pool Safety",          desc: "The pool is accessible from 7 AM to 9 PM only. No lifeguard is on duty. Children must be supervised at all times near the pool." },
  { title: "Children Supervision", desc: "Parents and guardians are fully responsible for the safety of children near the pool, private lake, and farm equipment." },
  { title: "Cooking Rules",        desc: "A fully equipped kitchen is available for guest use. Please clean up after cooking. Open-fire cooking is not permitted inside the property." },
  { title: "Noise Restrictions",   desc: "The estate is in a quiet rural residential area. Loud music, external speakers and generator use are not permitted after 10 PM." },
  { title: "Photography Rules",    desc: "Personal photography is welcome throughout the property. Commercial shoots or content creation require prior host approval and may attract an additional fee." },
  { title: "Fire Safety",          desc: "Bonfires are permitted only in the designated bonfire pit. Always ensure the fire is fully extinguished before going to sleep." },
  { title: "Waste Disposal",       desc: "Please segregate waste into the wet and dry bins provided. Do not litter on the plantation paths, walking trails or near the lake." },
  { title: "Local Regulations",    desc: "The property falls under Mangalore rural panchayat jurisdiction. All guests must comply with applicable local laws and community guidelines during their stay." },
];

const PROPERTY_STATS = [
  { Icon: Calendar,      label: "Hosting Since",  value: "2019"       },
  { Icon: Building2,     label: "Property Built", value: "2015"       },
  { Icon: Sparkles,      label: "Last Renovated", value: "2023"       },
  { Icon: Users,         label: "Guests Hosted",  value: "840+"       },
  { Icon: Star,          label: "Avg Rating",     value: "4.8 / 5"   },
  { Icon: MessageSquare, label: "Response Rate",  value: "98%"        },
  { Icon: Clock,         label: "Response Time",  value: "< 1 hour"  },
  { Icon: Globe,         label: "Languages",      value: "EN · HI · KN · TUL" },
];

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-gray-100 dark:border-gray-800" />;
}

function SubHeading({ title, sub }) {
  return (
    <div className="mb-5">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      {sub && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
      )}
    </div>
  );
}

// ─── 1. Good to Know ──────────────────────────────────────────────────────────

function GoodToKnow() {
  return (
    <div className="flex flex-wrap gap-2 pb-6">
      {QUICK_FACTS.map(({ Icon, label }) => (
        <div
          key={label}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
        >
          <Icon size={12} strokeWidth={2} className="flex-none" />
          {label}
        </div>
      ))}
    </div>
  );
}

// ─── 2. Sleeping Arrangements ─────────────────────────────────────────────────

function SleepingArrangements() {
  return (
    <div id="sleeping" className="pt-8 pb-6">
      <SubHeading title="Sleeping Arrangements" sub="Detailed bedroom layout and what's inside each room" />

      {/* Bedroom grid — 1-col → 2-col → 4-col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {BEDROOMS.map((room) => (
          <div
            key={room.name}
            className="flex flex-col p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${C.iconBg}`}>
                <BedDouble size={16} strokeWidth={1.75} />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${room.bdgCls}`}>
                {room.badge}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{room.name}</p>
            <p className={`text-xs font-medium mb-3 ${C.accent}`}>{room.bed}</p>
            <ul className="space-y-1.5">
              {room.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircle2 size={10} className={`${C.check} flex-none`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bathrooms summary */}
      <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${C.iconBg}`}>
            <Bath size={16} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Bathrooms</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">3 full bathrooms · towels and toiletries provided</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {BATHROOM_FEATURES.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2.5 py-1"
            >
              <CheckCircle2 size={10} className={`${C.check} flex-none`} />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. House Rules ───────────────────────────────────────────────────────────

function HouseRules() {
  return (
    <div id="rules" className="pt-8 pb-6">
      <SubHeading title="House Rules" sub="Please read these before confirming your booking" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {HOUSE_RULES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Icon size={14} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. Cancellation Policy ───────────────────────────────────────────────────

function CancellationPolicySection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pt-8 pb-6">
      <SubHeading title="Cancellation Policy" />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${C.iconBg}`}>
            <ShieldCheck size={16} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Free cancellation available</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Full refund if cancelled 30+ days before check-in</p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-none transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="cancel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {CANCELLATION.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
                    <Icon size={13} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 5. Damage & Security Deposit ────────────────────────────────────────────

function DamageProtectionSection() {
  return (
    <div className="pt-8 pb-6">
      <SubHeading
        title="Damage & Security Deposit"
        sub="Your deposit is safe and returned automatically after inspection"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DAMAGE_ITEMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${C.iconBg}`}>
              <Icon size={16} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
        <ShieldCheck size={12} className={`${C.check} flex-none mt-px`} />
        Security holds are released automatically once the inspection is complete. No manual follow-up needed.
      </p>
    </div>
  );
}

// ─── 6. Arrival Information ───────────────────────────────────────────────────

function ArrivalInformationSection() {
  return (
    <div id="arrival" className="pt-8 pb-6">
      <SubHeading title="Getting Here & Arrival" sub="Everything you need on the day you arrive" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ARRIVAL_ITEMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Icon size={14} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 7. Estate Facilities ─────────────────────────────────────────────────────

function EstateFacilitiesSection() {
  return (
    <div id="facilities" className="pt-8 pb-6">
      <SubHeading
        title="Estate Facilities"
        sub="Unique experiences available exclusively within the property"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {FACILITIES.map(({ Icon, title }) => (
          <div
            key={title}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Icon size={14} strokeWidth={1.75} />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-snug">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 8. Safety & Essentials ───────────────────────────────────────────────────

function SafetyEssentialsSection() {
  return (
    <div className="pt-8 pb-6">
      <SubHeading title="Safety & Essentials" sub="Everything in place for a secure and worry-free stay" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {SAFETY.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Icon size={14} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. Internet & Connectivity ───────────────────────────────────────────────

function InternetConnectivitySection() {
  const { speedMbps, carriers, fiveG, workspaceFriendly } = INTERNET;
  const speedPct = Math.min((speedMbps / 500) * 100, 100);

  return (
    <div className="pt-8 pb-6">
      <SubHeading title="Internet & Connectivity" sub="Stay connected — great for remote work too" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* WiFi Speed */}
        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Wifi size={14} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">WiFi Speed</p>
              <p className={`text-xs font-bold ${C.accent}`}>{speedMbps} Mbps</p>
            </div>
            {workspaceFriendly && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none ${C.pill}`}>
                Workspace Friendly
              </span>
            )}
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${C.bar} rounded-full transition-all`} style={{ width: `${speedPct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">0 Mbps</span>
            <span className="text-[10px] text-gray-400">500 Mbps</span>
          </div>
        </div>

        {/* Mobile Signal */}
        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Smartphone size={14} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Mobile Coverage</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">All major networks</p>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-none">
              {fiveG ? "5G" : "4G"} Area
            </span>
          </div>
          <div className="space-y-2.5">
            {carriers.map(({ name, bars, max }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-10 flex-none">{name}</span>
                <div className="flex items-end gap-0.5">
                  {Array.from({ length: max }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-sm transition-colors ${i < bars ? C.bar : "bg-gray-200 dark:bg-gray-700"}`}
                      style={{ height: `${(i + 1) * 4 + 4}px` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">{bars}/{max}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 10. Accessibility ────────────────────────────────────────────────────────

function AccessibilitySection() {
  if (!ACCESSIBILITY.length) return null;
  return (
    <div className="pt-8 pb-6">
      <SubHeading title="Accessibility" sub="Features available for guests with accessibility needs" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ACCESSIBILITY.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50"
          >
            <CheckCircle2 size={14} className={`${C.check} flex-none`} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 11. Things to Know ───────────────────────────────────────────────────────

function ThingsToKnowSection() {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <div className="pt-8 pb-6">
      <SubHeading
        title="Things to Know Before Booking"
        sub="Important policies and guidelines for a smooth stay"
      />
      <div className="space-y-2">
        {THINGS_TO_KNOW.map(({ title, desc }, i) => (
          <div
            key={title}
            className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={openIdx === i}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-colors text-left"
            >
              <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 pr-3">
                {title}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-400 flex-none transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                    {desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 12. Property Information ─────────────────────────────────────────────────

function PropertyInformationSection() {
  return (
    <div className="pt-8 pb-6">
      <SubHeading title="About This Property" sub="Track record and hosting credentials" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROPERTY_STATS.map(({ Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-2 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${C.iconBg}`}>
              <Icon size={14} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium leading-none mb-1">
                {label}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function StayInformation({ category }) {
  if (normalizeCategory(category) !== "farmstays") return null;

  return (
    <section id="stay-info" className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-2">

      {/* Section header */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Stay Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Everything you need to know before you arrive
        </p>
      </div>

      {/* 1 — Good to Know chips */}
      <GoodToKnow />

      <Divider />
      {/* 2 — Sleeping Arrangements */}
      <SleepingArrangements />

      <Divider />
      {/* 3 — House Rules */}
      <HouseRules />

      <Divider />
      {/* 4 — Cancellation Policy */}
      <CancellationPolicySection />

      <Divider />
      {/* 5 — Damage Protection */}
      <DamageProtectionSection />

      <Divider />
      {/* 6 — Arrival Information */}
      <ArrivalInformationSection />

      <Divider />
      {/* 7 — Estate Facilities */}
      <EstateFacilitiesSection />

      <Divider />
      {/* 8 — Safety & Essentials */}
      <SafetyEssentialsSection />

      <Divider />
      {/* 9 — Internet & Connectivity */}
      <InternetConnectivitySection />

      {/* 10 — Accessibility (conditional) */}
      {ACCESSIBILITY.length > 0 && (
        <>
          <Divider />
          <AccessibilitySection />
        </>
      )}

      <Divider />
      {/* 11 — Things to Know */}
      <ThingsToKnowSection />

      <Divider />
      {/* 12 — Property Information */}
      <PropertyInformationSection />


    </section>
  );
}
