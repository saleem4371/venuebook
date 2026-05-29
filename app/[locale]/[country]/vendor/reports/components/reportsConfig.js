/**
 * PLACEMENT: vendor/reports/components/reportsConfig.js
 * Extends /config/categoryConfig.js with all report-specific data.
 */

import { CATEGORIES, CATEGORY_TINTS, CATEGORY_COLORS, CATEGORY_ORDER, DEFAULT_CATEGORY } from "@/config/categoryConfig";

/* ─── Gradients ──────────────────────────────────────────────────────────── */
export const REPORT_GRADIENTS = {
  venues:      "linear-gradient(242deg, #a44bf3, #499ce8)",
  farmstays:   "linear-gradient(242deg, #22c55e, #14b8a6)",
  studios:     "linear-gradient(242deg, #f59e0b, #ef4444)",
  rentals:     "linear-gradient(242deg, #ec4899, #8b5cf6)",
  workspaces:  "linear-gradient(242deg, #3b82f6, #06b6d4)",
  experiences: "linear-gradient(242deg, #f97316, #eab308)",
};

/* ─── Subtitles ──────────────────────────────────────────────────────────── */
export const REPORT_SUBTITLES = {
  venues:      "Event intelligence · Hall utilization · Booking conversion",
  farmstays:   "Hospitality analytics · Occupancy trends · Stay duration",
  studios:     "Production analytics · Equipment usage · Creator sessions",
  rentals:     "Inventory operations · Pickup metrics · Return tracking",
  workspaces:  "Coworking utilization · Member retention · Desk occupancy",
  experiences: "Session engagement · Host performance · Repeat guests",
};

/* ─── KPI definitions ────────────────────────────────────────────────────── */
export const REPORT_KPIS = {
  venues:      [{ key:"revenue",    label:"Event Revenue" },    { key:"bookings",    label:"Total Bookings" },   { key:"avgPax",    label:"Avg Pax" },          { key:"conversion", label:"Conversion" }],
  farmstays:   [{ key:"revenue",    label:"Nightly Revenue" },  { key:"occupancy",   label:"Occupancy Rate" },   { key:"avgStay",   label:"Avg Stay" },          { key:"cleaning",   label:"Cleaning Cycles" }],
  studios:     [{ key:"revenue",    label:"Session Revenue" },  { key:"hours",       label:"Booked Hours" },     { key:"sessions",  label:"Creator Sessions" },  { key:"equipment",  label:"Equipment Util." }],
  rentals:     [{ key:"revenue",    label:"Rental Revenue" },   { key:"utilization", label:"Inventory Util." },  { key:"duration",  label:"Avg Duration" },      { key:"downtime",   label:"Downtime" }],
  workspaces:  [{ key:"revenue",    label:"Desk Revenue" },     { key:"members",     label:"Active Members" },   { key:"occupancy", label:"Desk Occupancy" },    { key:"retention",  label:"Renewal Rate" }],
  experiences: [{ key:"revenue",    label:"Session Revenue" },  { key:"attendance",  label:"Attendance" },       { key:"repeat",    label:"Repeat Guests" },     { key:"rating",     label:"Host Rating" }],
};

/* ─── All category data ──────────────────────────────────────────────────── */
export const CATEGORY_REPORT_DATA = {
  venues: {
    kpis: [
      { value:"₹5465465", growth:12.4, up:true,  sparkline:[18,22,19,28,24,35,31,40,38,45,42,55] },
      { value:"117",     growth:8.1,  up:true,  sparkline:[8,9,8,11,10,12,11,13,12,14,13,15]   },
      { value:"284",     growth:3.2,  up:true,  sparkline:[260,265,270,268,275,280,278,282,280,285,283,284] },
      { value:"68%",     growth:-2.1, up:false, sparkline:[72,71,70,69,71,70,69,68,70,69,68,68] },
    ],
    chart: [18,24,21,35,28,42,38,45,52,48,61,55],
    breakdown: [
      { label:"Online bookings",  value:"77",     pct:66 },
      { label:"Offline bookings", value:"40",     pct:34 },
      { label:"Pending payments", value:"₹2.18Cr",pct:85 },
      { label:"Cancelled",        value:"2",      pct:2  },
    ],
    bookings: [
      { id:6706, name:"Sylvester Pereira", amount:39616, date:"10-Apr-2026", detail:"Swarnagiri Indoors", status:"Booked",    paidOn:"10 Apr 2026", paymentMode:"Online · UPI",          breakdown:[{label:"Base price",value:32000},{label:"Security deposit",value:5000},{label:"Add-ons",value:2616},{label:"Refund",value:0,negative:true}] },
      { id:2484, name:"Rahul Sharma",      amount:35517, date:"31-Mar-2026", detail:"Main Hall",          status:"Pending",   paidOn:"31 Mar 2026", paymentMode:"Online · Card",         breakdown:[{label:"Base price",value:28500},{label:"Security deposit",value:5000},{label:"Add-ons",value:2017},{label:"Refund",value:0,negative:true}] },
      { id:3301, name:"Priya Mehta",       amount:52000, date:"15-Mar-2026", detail:"Terrace Garden",     status:"Booked",    paidOn:"15 Mar 2026", paymentMode:"Bank Transfer",         breakdown:[{label:"Base price",value:42000},{label:"Security deposit",value:7500},{label:"Add-ons",value:2500},{label:"Refund",value:0,negative:true}] },
      { id:7182, name:"Anjali Rao",        amount:28400, date:"02-Mar-2026", detail:"Banquet Hall B",     status:"Completed", paidOn:"02 Mar 2026", paymentMode:"Online · UPI",          breakdown:[{label:"Base price",value:23000},{label:"Security deposit",value:4000},{label:"Add-ons",value:1400},{label:"Refund",value:0,negative:true}] },
      { id:5519, name:"Deepak Nair",       amount:18750, date:"20-Feb-2026", detail:"Main Hall",          status:"Cancelled", paidOn:"20 Feb 2026", paymentMode:"Online · Card",         breakdown:[{label:"Base price",value:15000},{label:"Security deposit",value:2500},{label:"Add-ons",value:1250},{label:"Refund",value:18750,negative:true}] },
    ],
    aging: {
      bucketValues: [16976137, 219146, 2106246, 2514034],
      rows: [
        { id:2338, total:135930, outstanding:135930, overdue:0,     d30:135930, customer:"Sylvester Pereira", age:"3 days ago"  },
        { id:9446, total:33747,  outstanding:33747,  overdue:33747, d30:0,      customer:"Rahul Sharma",     age:"18 days ago" },
        { id:4926, total:86847,  outstanding:86847,  overdue:86847, d30:0,      customer:"Priya Mehta",      age:"25 days ago" },
        { id:5421, total:86847,  outstanding:86847,  overdue:86847, d30:0,      customer:"Anjali Rao",       age:"32 days ago" },
      ],
    },
  },
  farmstays: {
    kpis: [
      { value:"₹84.2K",     growth:18.3, up:true,  sparkline:[40,45,42,55,50,62,58,68,65,75,72,84] },
      { value:"73%",        growth:5.2,  up:true,  sparkline:[60,62,64,63,65,67,66,68,70,71,72,73] },
      { value:"2.4 nights", growth:0.3,  up:true,  sparkline:[2.0,2.1,2.0,2.2,2.1,2.2,2.3,2.2,2.3,2.3,2.4,2.4] },
      { value:"48",         growth:-1.5, up:false, sparkline:[52,51,50,51,50,50,49,50,49,49,48,48] },
    ],
    chart: [32,41,28,52,45,60,55,70,65,80,75,90],
    breakdown: [
      { label:"Weekend bookings", value:"38",  pct:79 },
      { label:"Weekday bookings", value:"10",  pct:21 },
      { label:"Repeat guests",    value:"62%", pct:62 },
      { label:"Avg rating",       value:"4.7★",pct:94 },
    ],
    bookings: [
      { id:1102, name:"Ananya Reddy",   amount:12400, date:"18-Apr-2026", detail:"Valley Cottage",  status:"Booked",    paidOn:"18 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Nightly rate",value:9600},{label:"Security deposit",value:2000},{label:"Meal add-ons",value:800},{label:"Refund",value:0,negative:true}] },
      { id:1098, name:"Vikram Singh",   amount:8600,  date:"12-Apr-2026", detail:"Hilltop Suite",   status:"Completed", paidOn:"12 Apr 2026", paymentMode:"Online · Card",   breakdown:[{label:"Nightly rate",value:6000},{label:"Security deposit",value:2000},{label:"Meal add-ons",value:600},{label:"Refund",value:0,negative:true}] },
      { id:1089, name:"Meena Thomas",   amount:15200, date:"05-Apr-2026", detail:"Riverside Room",  status:"Pending",   paidOn:"05 Apr 2026", paymentMode:"Bank Transfer",   breakdown:[{label:"Nightly rate",value:12000},{label:"Security deposit",value:2500},{label:"Meal add-ons",value:700},{label:"Refund",value:0,negative:true}] },
      { id:1075, name:"Arjun Pillai",   amount:9800,  date:"28-Mar-2026", detail:"Valley Cottage",  status:"Completed", paidOn:"28 Mar 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Nightly rate",value:7200},{label:"Security deposit",value:2000},{label:"Meal add-ons",value:600},{label:"Refund",value:0,negative:true}] },
      { id:1062, name:"Sunita Verma",   amount:11200, date:"20-Mar-2026", detail:"Hilltop Suite",   status:"Booked",    paidOn:"20 Mar 2026", paymentMode:"Online · Card",   breakdown:[{label:"Nightly rate",value:8800},{label:"Security deposit",value:2000},{label:"Meal add-ons",value:400},{label:"Refund",value:0,negative:true}] },
    ],
    aging: {
      bucketValues: [284500, 45200, 128400, 96800],
      rows: [
        { id:1102, total:24800, outstanding:24800, overdue:0,     d30:24800, customer:"Ananya Reddy",   age:"2 days ago"  },
        { id:1098, total:8600,  outstanding:8600,  overdue:8600,  d30:0,     customer:"Vikram Singh",   age:"14 days ago" },
        { id:1089, total:15200, outstanding:15200, overdue:15200, d30:0,     customer:"Meena Thomas",   age:"22 days ago" },
        { id:1075, total:9800,  outstanding:9800,  overdue:0,     d30:9800,  customer:"Arjun Pillai",   age:"35 days ago" },
      ],
    },
  },
  studios: {
    kpis: [
      { value:"₹1.2L",  growth:22.1, up:true, sparkline:[8,10,9,14,12,18,16,22,20,28,25,35] },
      { value:"284h",   growth:14.5, up:true, sparkline:[200,210,215,225,220,235,230,245,240,255,260,284] },
      { value:"63",     growth:9.8,  up:true, sparkline:[45,47,46,50,49,52,51,55,54,58,60,63] },
      { value:"79%",    growth:4.3,  up:true, sparkline:[68,70,71,72,71,73,74,75,74,76,78,79] },
    ],
    chart: [8,12,10,18,15,22,20,28,25,35,30,40],
    breakdown: [
      { label:"Morning slots",      value:"34",   pct:54 },
      { label:"Evening slots",      value:"29",   pct:46 },
      { label:"Full-day sessions",  value:"12",   pct:19 },
      { label:"Avg session length", value:"4.5h", pct:56 },
    ],
    bookings: [
      { id:5501, name:"Kiran Agarwal",  amount:8500,  date:"20-Apr-2026", detail:"Studio A — Video",  status:"Booked",    paidOn:"20 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Session fee",value:7000},{label:"Equipment",value:1000},{label:"Editing suite",value:500},{label:"Refund",value:0,negative:true}] },
      { id:5498, name:"Rohan Menon",    amount:5200,  date:"17-Apr-2026", detail:"Studio B — Photo",  status:"Completed", paidOn:"17 Apr 2026", paymentMode:"Online · Card",   breakdown:[{label:"Session fee",value:4000},{label:"Equipment",value:800},{label:"Editing suite",value:400},{label:"Refund",value:0,negative:true}] },
      { id:5491, name:"Nisha Patel",    amount:7800,  date:"14-Apr-2026", detail:"Podcast Room",      status:"Pending",   paidOn:"14 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Session fee",value:6500},{label:"Equipment",value:900},{label:"Editing suite",value:400},{label:"Refund",value:0,negative:true}] },
      { id:5480, name:"Dev Kapoor",     amount:4200,  date:"10-Apr-2026", detail:"Studio A — Video",  status:"Completed", paidOn:"10 Apr 2026", paymentMode:"Offline · Cash",  breakdown:[{label:"Session fee",value:3500},{label:"Equipment",value:500},{label:"Editing suite",value:200},{label:"Refund",value:0,negative:true}] },
      { id:5472, name:"Preethi Iyer",   amount:6600,  date:"05-Apr-2026", detail:"Studio B — Photo",  status:"Booked",    paidOn:"05 Apr 2026", paymentMode:"Online · Card",   breakdown:[{label:"Session fee",value:5500},{label:"Equipment",value:700},{label:"Editing suite",value:400},{label:"Refund",value:0,negative:true}] },
    ],
    aging: {
      bucketValues: [520000, 38500, 185000, 142000],
      rows: [
        { id:5501, total:42000, outstanding:42000, overdue:0,     d30:42000, customer:"Kiran Agarwal", age:"5 days ago"  },
        { id:5498, total:18500, outstanding:18500, overdue:18500, d30:0,     customer:"Rohan Menon",   age:"16 days ago" },
        { id:5491, total:52000, outstanding:52000, overdue:52000, d30:0,     customer:"Nisha Patel",   age:"28 days ago" },
        { id:5480, total:29500, outstanding:29500, overdue:0,     d30:29500, customer:"Dev Kapoor",    age:"40 days ago" },
      ],
    },
  },
  rentals: {
    kpis: [
      { value:"₹94K",    growth:31.5, up:true,  sparkline:[40,45,42,55,50,62,58,68,65,75,72,84] },
      { value:"68%",     growth:8.4,  up:true,  sparkline:[55,57,58,60,61,63,62,64,65,66,67,68] },
      { value:"3.2 days",growth:0.8,  up:true,  sparkline:[2.8,2.9,2.9,3.0,3.0,3.0,3.1,3.1,3.1,3.2,3.2,3.2] },
      { value:"4.2%",    growth:-1.1, up:true,  sparkline:[5.8,5.6,5.4,5.3,5.2,5.1,5.0,4.9,4.7,4.5,4.3,4.2] },
    ],
    chart: [5,8,6,12,10,15,13,18,16,22,20,25],
    breakdown: [
      { label:"Active rentals",    value:"18",  pct:68 },
      { label:"Available items",   value:"8",   pct:32 },
      { label:"Under maintenance", value:"3",   pct:12 },
      { label:"On-time returns",   value:"91%", pct:91 },
    ],
    bookings: [
      { id:9901, name:"Ramesh Babu",    amount:4800, date:"21-Apr-2026", detail:"Toyota Innova",  status:"Booked",    paidOn:"21 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Rental fee",value:3500},{label:"Security deposit",value:1000},{label:"Insurance",value:300},{label:"Refund",value:0,negative:true}] },
      { id:9897, name:"Kavitha Shetty", amount:3200, date:"16-Apr-2026", detail:"Canon EOS Kit",  status:"Pending",   paidOn:"16 Apr 2026", paymentMode:"Online · Card",   breakdown:[{label:"Rental fee",value:2400},{label:"Security deposit",value:600},{label:"Insurance",value:200},{label:"Refund",value:0,negative:true}] },
      { id:9885, name:"Mohan Tiwari",   amount:6100, date:"10-Apr-2026", detail:"Royal Enfield",  status:"Completed", paidOn:"10 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Rental fee",value:4500},{label:"Security deposit",value:1200},{label:"Insurance",value:400},{label:"Refund",value:0,negative:true}] },
      { id:9871, name:"Lakshmi Nair",   amount:2800, date:"05-Apr-2026", detail:"DJI Drone",      status:"Completed", paidOn:"05 Apr 2026", paymentMode:"Offline · Cash",  breakdown:[{label:"Rental fee",value:2000},{label:"Security deposit",value:600},{label:"Insurance",value:200},{label:"Refund",value:0,negative:true}] },
      { id:9856, name:"Suresh Kumar",   amount:5500, date:"28-Mar-2026", detail:"Toyota Innova",  status:"Booked",    paidOn:"28 Mar 2026", paymentMode:"Online · Card",   breakdown:[{label:"Rental fee",value:4000},{label:"Security deposit",value:1100},{label:"Insurance",value:400},{label:"Refund",value:0,negative:true}] },
    ],
    aging: {
      bucketValues: [185000, 24800, 76400, 58200],
      rows: [
        { id:9901, total:14800, outstanding:14800, overdue:0,     d30:14800, customer:"Ramesh Babu",    age:"4 days ago"  },
        { id:9897, total:8200,  outstanding:8200,  overdue:8200,  d30:0,     customer:"Kavitha Shetty", age:"15 days ago" },
        { id:9885, total:22400, outstanding:22400, overdue:22400, d30:0,     customer:"Mohan Tiwari",   age:"26 days ago" },
        { id:9871, total:12800, outstanding:12800, overdue:0,     d30:12800, customer:"Lakshmi Nair",   age:"38 days ago" },
      ],
    },
  },
  workspaces: {
    kpis: [
      { value:"₹3.8L", growth:6.2,  up:true,  sparkline:[28,30,31,33,32,35,34,37,36,39,40,42] },
      { value:"42",    growth:3.1,  up:true,  sparkline:[36,37,37,38,38,39,39,40,40,41,41,42] },
      { value:"81%",   growth:-1.2, up:false, sparkline:[84,83,83,82,83,82,82,81,82,81,81,81] },
      { value:"87%",   growth:2.8,  up:true,  sparkline:[82,83,83,84,84,85,85,86,86,86,87,87] },
    ],
    chart: [25,28,30,35,32,38,36,42,40,45,44,48],
    breakdown: [
      { label:"Hot desks in use", value:"28",  pct:88 },
      { label:"Private cabins",   value:"9",   pct:75 },
      { label:"Meeting rooms",    value:"5",   pct:63 },
      { label:"Monthly members",  value:"31",  pct:74 },
    ],
    bookings: [
      { id:7701, name:"Arjun Khanna",  amount:15000, date:"19-Apr-2026", detail:"Hot Desk — Zone A", status:"Booked",    paidOn:"19 Apr 2026", paymentMode:"Online · UPI",          breakdown:[{label:"Membership",value:12000},{label:"Meeting rooms",value:2000},{label:"Amenities",value:1000},{label:"Refund",value:0,negative:true}] },
      { id:7698, name:"Sunita Varma",  amount:12500, date:"15-Apr-2026", detail:"Private Cabin 3",   status:"Booked",    paidOn:"15 Apr 2026", paymentMode:"Online · Card",         breakdown:[{label:"Membership",value:10000},{label:"Meeting rooms",value:1500},{label:"Amenities",value:1000},{label:"Refund",value:0,negative:true}] },
      { id:7682, name:"Deepak Luthra", amount:18000, date:"08-Apr-2026", detail:"Meeting Room 2",    status:"Completed", paidOn:"08 Apr 2026", paymentMode:"Bank Transfer",         breakdown:[{label:"Membership",value:14000},{label:"Meeting rooms",value:3000},{label:"Amenities",value:1000},{label:"Refund",value:0,negative:true}] },
      { id:7670, name:"Riya Shah",     amount:9500,  date:"02-Apr-2026", detail:"Hot Desk — Zone B", status:"Pending",   paidOn:"02 Apr 2026", paymentMode:"Online · UPI",          breakdown:[{label:"Membership",value:7500},{label:"Meeting rooms",value:1500},{label:"Amenities",value:500},{label:"Refund",value:0,negative:true}] },
      { id:7655, name:"Nikhil Gupta",  amount:14000, date:"25-Mar-2026", detail:"Private Cabin 1",   status:"Booked",    paidOn:"25 Mar 2026", paymentMode:"Online · Card",         breakdown:[{label:"Membership",value:11000},{label:"Meeting rooms",value:2000},{label:"Amenities",value:1000},{label:"Refund",value:0,negative:true}] },
    ],
    aging: {
      bucketValues: [380000, 75000, 220000, 165000],
      rows: [
        { id:7701, total:45000, outstanding:45000, overdue:0,     d30:45000, customer:"Arjun Khanna",  age:"6 days ago"  },
        { id:7698, total:37500, outstanding:37500, overdue:37500, d30:0,     customer:"Sunita Varma",  age:"19 days ago" },
        { id:7682, total:54000, outstanding:54000, overdue:54000, d30:0,     customer:"Deepak Luthra", age:"27 days ago" },
        { id:7670, total:28500, outstanding:28500, overdue:0,     d30:28500, customer:"Riya Shah",     age:"34 days ago" },
      ],
    },
  },
  experiences: {
    kpis: [
      { value:"₹62K", growth:44.2, up:true, sparkline:[20,25,22,32,28,40,35,48,44,55,50,62] },
      { value:"318",  growth:28.5, up:true, sparkline:[200,210,215,225,230,240,245,260,265,280,290,318] },
      { value:"41%",  growth:6.1,  up:true, sparkline:[32,33,33,34,35,35,36,37,37,38,40,41] },
      { value:"4.8★", growth:0.2,  up:true, sparkline:[4.5,4.5,4.6,4.6,4.6,4.7,4.7,4.7,4.7,4.8,4.8,4.8] },
    ],
    chart: [3,5,4,8,7,12,10,16,14,20,18,24],
    breakdown: [
      { label:"Sessions this month", value:"24",  pct:80 },
      { label:"Fully booked",        value:"18",  pct:75 },
      { label:"Waitlisted",          value:"42",  pct:35 },
      { label:"5-star reviews",      value:"89%", pct:89 },
    ],
    bookings: [
      { id:3301, name:"Lalitha Krishnan", amount:2400, date:"22-Apr-2026", detail:"Pottery Workshop",   status:"Booked",    paidOn:"22 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Session fee",value:2000},{label:"Materials",value:400},{label:"Refund",value:0,negative:true}] },
      { id:3297, name:"Suresh Mohan",     amount:1800, date:"18-Apr-2026", detail:"Sunrise Yoga",       status:"Completed", paidOn:"18 Apr 2026", paymentMode:"Online · Card",   breakdown:[{label:"Session fee",value:1500},{label:"Materials",value:300},{label:"Refund",value:0,negative:true}] },
      { id:3281, name:"Geetha Rajan",     amount:3200, date:"12-Apr-2026", detail:"Farm-to-Table Cook", status:"Booked",    paidOn:"12 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Session fee",value:2600},{label:"Materials",value:600},{label:"Refund",value:0,negative:true}] },
      { id:3265, name:"Arun Prakash",     amount:1500, date:"08-Apr-2026", detail:"Photo Walk — Hills", status:"Pending",   paidOn:"08 Apr 2026", paymentMode:"Online · Card",   breakdown:[{label:"Session fee",value:1200},{label:"Materials",value:300},{label:"Refund",value:0,negative:true}] },
      { id:3248, name:"Divya Menon",      amount:2800, date:"01-Apr-2026", detail:"Pottery Workshop",   status:"Completed", paidOn:"01 Apr 2026", paymentMode:"Online · UPI",    breakdown:[{label:"Session fee",value:2300},{label:"Materials",value:500},{label:"Refund",value:0,negative:true}] },
    ],
    aging: {
      bucketValues: [62000, 8400, 28500, 18200],
      rows: [
        { id:3301, total:7200, outstanding:7200, overdue:0,    d30:7200, customer:"Lalitha Krishnan", age:"3 days ago"  },
        { id:3297, total:3600, outstanding:3600, overdue:3600, d30:0,    customer:"Suresh Mohan",     age:"12 days ago" },
        { id:3281, total:9600, outstanding:9600, overdue:9600, d30:0,    customer:"Geetha Rajan",     age:"23 days ago" },
        { id:3265, total:4500, outstanding:4500, overdue:0,    d30:4500, customer:"Arun Prakash",     age:"36 days ago" },
      ],
    },
  },
};

/* ─── Status config ──────────────────────────────────────────────────────── */
export const STATUS_CONFIG = {
  Booked:    { color:"text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400", dot:"bg-emerald-500" },
  Pending:   { color:"text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",         dot:"bg-amber-500" },
  Completed: { color:"text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",             dot:"bg-blue-500" },
  Overdue:   { color:"text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-400",                 dot:"bg-red-500" },
  Cancelled: { color:"text-gray-500 bg-gray-100 dark:bg-gray-800/80 dark:text-gray-400",            dot:"bg-gray-400" },
};

/* ─── getReportConfig ────────────────────────────────────────────────────── */
export function getReportConfig(categoryId) {
  const id    = CATEGORIES[categoryId] ? categoryId : DEFAULT_CATEGORY;
  const base  = CATEGORIES[id];
  const tints = CATEGORY_TINTS[id];
  return {
    ...base,
    tints,
    gradient:  REPORT_GRADIENTS[id],
    primary:   tints.hex,
    subtitle:  REPORT_SUBTITLES[id] ?? "",
    kpiDefs:   REPORT_KPIS[id] ?? [],
    data:      CATEGORY_REPORT_DATA[id] ?? CATEGORY_REPORT_DATA.venues,
  };
}

export { CATEGORY_ORDER, DEFAULT_CATEGORY };