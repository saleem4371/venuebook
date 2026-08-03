/* ─────────────────────────────────────────────────────────────────────────────
   EVENT-TYPE ICON MATCHING
   ─────────────────────────────────────────────────────────────────────────
   Event tags come from the backend as { id, event_name } — there's no icon
   field on the wire for these, so this does keyword matching on the label
   text instead: each dictionary entry lists keywords → one lucide icon,
   checked in order, first match wins, with a generic fallback if nothing
   matches. Deliberately loose (substring match, case-insensitive) since
   these labels are admin-editable free text, not a fixed enum.

   Venue/property categories DO carry a real image icon from the backend
   (`cat.icon`, an S3 key — same field CategoryBar.jsx and Categories.jsx
   already render) so BasicStep/TagsStep render that directly instead of
   using a lucide fallback here.
───────────────────────────────────────────────────────────────────────────── */

import {
  Heart, Gem, Gift, Wine, Palette, Music2, Church, Baby, Cake,
  PartyPopper, Star, Music, HandHeart, Briefcase, Presentation,
  GraduationCap, Users2, Plane, Trophy, ShoppingBag, Sparkles,
  CalendarDays,
} from "lucide-react";

/* ── Generic matcher ──────────────────────────────────────────────────── */
function matchIcon(name, dictionary, fallback) {
  const label = (name || "").toLowerCase();
  for (const [keywords, Icon] of dictionary) {
    if (keywords.some((kw) => label.includes(kw))) return Icon;
  }
  return fallback;
}

/* ── Event-type keywords ──────────────────────────────────────────────── */
const EVENT_TYPE_ICONS = [
  [["wedding"], Heart],
  [["engagement"], Gem],
  [["anniversary"], Gift],
  [["reception"], Wine],
  [["mehandi", "mehndi", "henna"], Palette],
  [["sangeeth", "sangeet"], Music2],
  [["communion", "baptism", "religious"], Church],
  [["baby shower"], Baby],
  [["birthday"], Cake],
  [["bachelor", "bachelorette"], PartyPopper],
  [["holiday", "festival"], PartyPopper],
  [["special event", "gala"], Star],
  [["concert", "music"], Music],
  [["fundraiser", "charity"], HandHeart],
  [["corporate", "business meeting", "shareholders", "board meeting"], Briefcase],
  [["conference", "convention"], Presentation],
  [["education", "seminar", "training", "workshop"], GraduationCap],
  [["reunion", "team building"], Users2],
  [["tour", "vacation", "trip"], Plane],
  [["sports"], Trophy],
  [["trade", "consumer show", "exhibition"], ShoppingBag],
  [["other"], Sparkles],
];

export function getEventTypeIcon(name) {
  return matchIcon(name, EVENT_TYPE_ICONS, CalendarDays);
}
