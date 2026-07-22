/**
 * eventIcons.js
 * Maps an event name string → the matching Lucide icon component.
 * Shared by BookingCard (dropdown) and ExperienceBlock (event chips).
 */
import {
  Baby, BarChart2, BookOpen, Briefcase, Cake, Camera,
  Church, Film, Flower2, Heart, Mic, Music,
  PartyPopper, Sparkles, Tag, Trophy, Utensils,
} from "lucide-react";

export function getEventIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("wedding") || n.includes("reception") || n.includes("anniversary") || n.includes("engagement")) return Heart;
  if (n.includes("corporate") || n.includes("conference") || n.includes("convention") || n.includes("seminar") || n.includes("meeting") || n.includes("business")) return Briefcase;
  if (n.includes("birthday") || n.includes("party") || n.includes("celebration") || n.includes("bachelor") || n.includes("bachelorette") || n.includes("holiday")) return PartyPopper;
  if (n.includes("baby shower") || n.includes("naamkaran") || n.includes("baby") || n.includes("christening")) return Baby;
  if (n.includes("sports") || n.includes("tournament") || n.includes("championship") || n.includes("award")) return Trophy;
  if (n.includes("communion") || n.includes("roce") || n.includes("religious") || n.includes("puja") || n.includes("prayer")) return Church;
  if (n.includes("music") || n.includes("concert") || n.includes("band") || n.includes("dj")) return Music;
  if (n.includes("film") || n.includes("movie") || n.includes("shoot") || n.includes("production")) return Film;
  if (n.includes("photo") || n.includes("photoshoot")) return Camera;
  if (n.includes("podcast") || n.includes("recording") || n.includes("studio")) return Mic;
  if (n.includes("food") || n.includes("dinner") || n.includes("lunch") || n.includes("brunch") || n.includes("dining")) return Utensils;
  if (n.includes("graduation") || n.includes("alumni") || n.includes("school") || n.includes("college")) return BookOpen;
  if (n.includes("flower") || n.includes("floral") || n.includes("garden")) return Flower2;
  if (n.includes("gala") || n.includes("launch") || n.includes("premiere") || n.includes("social")) return Sparkles;
  if (n.includes("bar") || n.includes("chart") || n.includes("expo") || n.includes("trade")) return BarChart2;
  if (n.includes("cake") || n.includes("sweet") || n.includes("dessert")) return Cake;
  return Tag;
}
