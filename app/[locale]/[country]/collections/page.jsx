"use client";

/**
 * My Collections — the central hub for both "Likes" (quick favorite) and
 * "Collections" (user-organized folders of saved properties).
 *
 * Route: moved here from /wishlist (old route now redirects — see
 * next.config.js `redirects()` and the thin stub left at
 * app/[locale]/[country]/wishlist/page.jsx for defense-in-depth).
 *
 * IMPORTANT — read before touching data wiring:
 * The relation endpoints this page depends on (`likedProperty`,
 * `UserWishlist`, `UserWishlistCategory`, `UserCompare`) return thin rows
 * (ids only, not full venue objects), and there is no confirmed
 * `updated_at` field on a collection. This is a known, pre-existing gap —
 * the Compare feature hit the exact same wall (see
 * `compare/hooks/useCompareList.js`) and worked around it by resolving ids
 * against the `STATIC_VENUES` fixture and falling back to defensively-read
 * fields otherwise. This page reuses that same resolution strategy rather
 * than inventing a second one. A liked/saved venue outside that fixture set
 * will render with a generic name/no photo until the backend returns full
 * objects (or a dedicated "hydrate by ids" endpoint exists).
 *
 * A Recent Activity section previously lived here, backed by a real
 * forward-only local log (lib/activityLog.js) — removed from this page per
 * request. The logger itself is left in place (VenueCard.jsx's like
 * handler, WishlistPopup.jsx's save/move/remove/create handlers still call
 * `logActivity(...)`) since it's inert without a reader and cheap to revive
 * later if the timeline comes back.
 *
 * DEEP LINKING — `?tab=liked|collections|recent` sets the initial active
 * tab and `?collection=<id>` pre-selects a collection (only meaningful
 * when tab=collections); both are read once on mount as the initial
 * useState value, same "URL decides the starting state, then it's normal
 * local state" pattern messages/page.jsx uses for `?conversation=`. Lets
 * the profile dashboard's Collections/Recently Viewed/Liked Properties
 * widgets link straight to the right tab instead of always landing on
 * "Liked Properties". useSearchParams requires a Suspense boundary — see
 * the default export at the bottom of this file.
 */

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Folder,
  Bookmark,
  Plus,
  Clock,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useToast } from "@/components/ToastProvider";

import { useCategory } from "@/context/CategoryContext";

import {
  likedProperty,
  UserWishlist,
  UserWishlistCategory,
  UserCompare,
  addLikedProperty,
  addCompareAPI,
  removeCompareAPI,
} from "@/services/venues.service";
import { recent_views } from "@/services/home.service";

import { STATIC_VENUES } from "@/app/[locale]/[country]/search/[type]/data/staticVenues";
import { enrichProperty } from "@/app/[locale]/[country]/compare/data/compareSchema";
import VenueCard from "@/app/[locale]/[country]/search/[type]/components/VenueCard";
import WishlistPopup from "@/app/[locale]/[country]/search/[type]/components/WishlistPopup";
import CreateCollectionModal from "@/app/[locale]/[country]/search/[type]/components/CreateCollectionModal";
import { resolveCollectionIcon } from "@/app/[locale]/[country]/search/[type]/components/collectionIcons";
import ScrollableTabBar from "@/app/[locale]/[country]/vendor/components/ScrollableTabBar";
import { logActivity } from "@/lib/activityLog";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA RESOLUTION — see file header. Mirrors compare/hooks/useCompareList.js
   so there's one resolution strategy for "thin relation row → full venue"
   across the app, not two.
   ═══════════════════════════════════════════════════════════════════════════ */
function extractId(raw) {
  return (
    raw?.venue_id ||
    raw?.property_id ||
    raw?.childVenueId ||
    raw?.child_venue_id ||
    raw?.id ||
    raw?.venueId ||
    null
  );
}

function unwrapList(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

function resolveVenue(raw) {
  const id = extractId(raw);
  if (!id) return null;
  const staticMatch = STATIC_VENUES.find((v) => v.childVenueId === id);
  const base =
    staticMatch || {
      childVenueId: id,
      venueName: raw?.title || raw?.name || raw?.venueName || "Property",
      category: raw?.category || raw?.property_type || "venues",
      city: raw?.city || "",
      state: raw?.state || "",
      images: raw?.image ? [raw.image] : raw?.images || [],
      minPrice: raw?.price || raw?.minPrice || null,
      rating: raw?.rating || 4.5,
      reviewCount: raw?.reviewCount || 0,
    };
  return enrichProperty(base);
}

function formatUpdated(cat) {
  const raw = cat?.updated_at || cat?.updatedAt || cat?.modified_at;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

// `/home/recent_views` (services/home.service.js) is the one relation
// endpoint in this app that already returns rich venue objects (name,
// images, price, rating — see home/components/VenueCard.jsx, which reads
// those fields directly with no fixture fallback). It's read defensively
// for a view timestamp under several possible field names; if none of them
// are present on any row, every item falls into a single "Earlier" bucket
// rather than being mislabeled "Today".
function extractViewedAt(raw) {
  const val =
    raw?.viewed_at ||
    raw?.viewedAt ||
    raw?.last_viewed_at ||
    raw?.updated_at ||
    raw?.updatedAt ||
    raw?.created_at ||
    raw?.createdAt ||
    raw?.timestamp;
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateBucketLabel(date) {
  if (!date) return "Earlier";
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
const VALID_TABS = new Set(["liked", "collections", "recent"]);

function CollectionsPageInner() {

  const { user } = useAuth();
  const { setLoginOpen } = useUI();
  const { locale, country } = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();

  const tabParam = searchParams.get("tab");
  const collectionParam = searchParams.get("collection");

  const [liked, setLiked] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [collections, setCollections] = useState([]);
  const [compares, setCompares] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistVenue, setWishlistVenue] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(collectionParam || null);
  // "liked" | "collections" | "recent" — from ?tab= when it's one of the
  // three valid values, otherwise the same "liked" default as before.
  const [activeTab, setActiveTab] = useState(VALID_TABS.has(tabParam) ? tabParam : "liked");

  const { activeCategory } = useCategory();

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [likedRes, wlRes, catRes, cmpRes, rvRes] = await Promise.allSettled([
        likedProperty(),
        UserWishlist(),
        UserWishlistCategory(),
        UserCompare(),
        recent_views(),
      ]);
      setLiked(likedRes.status === "fulfilled" ? unwrapList(likedRes.value) : []);
      setWishlist(wlRes.status === "fulfilled" ? unwrapList(wlRes.value) : []);
      setCollections(catRes.status === "fulfilled" ? unwrapList(catRes.value) : []);
      setCompares(cmpRes.status === "fulfilled" ? unwrapList(cmpRes.value) : []);
      setRecentViews(rvRes.status === "fulfilled" ? unwrapList(rvRes.value) : []);
    } finally {
      setLoading(false);
    }
  }, [user,activeCategory]);

  useEffect(() => {
    load();
  }, [load]);

  const likedIds = useMemo(() => new Set(liked.map(extractId).filter(Boolean)), [liked]);
  const likedVenues = useMemo(() => liked.map(resolveVenue).filter(Boolean), [liked]);

  // "Recently Saved" shows everything by default; clicking a Collection
  // card filters it down to just that collection (entire card is
  // clickable, per spec — there's no separate collection-detail route yet,
  // so this keeps the interaction on the same hub page rather than
  // introducing a new page that wasn't asked for).
  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
  const savedVenues = useMemo(() => {
    const rows = selectedCollectionId
      ? wishlist.filter((i) => i.category_id === selectedCollectionId)
      : wishlist;
    return rows.map(resolveVenue).filter(Boolean);
  }, [wishlist, selectedCollectionId]);

  // Grouped in API order (assumed most-recent-first) under Today /
  // Yesterday / "N days ago" / a formatted date — never fabricated, derived
  // from whatever timestamp field the row actually has (see
  // extractViewedAt's fallback chain and dateBucketLabel's "Earlier" catch).
  const recentViewGroups = useMemo(() => {
    const groups = [];
    const indexByLabel = new Map();
    recentViews.forEach((raw) => {
      const venue = resolveVenue(raw);
      if (!venue) return;
      const label = dateBucketLabel(extractViewedAt(raw));
      if (!indexByLabel.has(label)) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, venues: [] });
      }
      groups[indexByLabel.get(label)].venues.push(venue);
    });
    return groups;
  }, [recentViews]);

  // const coverFor = useCallback(
  //   (categoryId) => {
  //     const rel = wishlist.find((i) => i.category_id === categoryId);
  //     return rel ? resolveVenue(rel)?.images?.[0].image || null : null;
  //   },
  //   [wishlist],
  // );
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path}`;
};

const coverFor = useCallback(
  (categoryId) => {
    const rel = wishlist.find((i) => i.category_id === categoryId);
    if (!rel) return null;

    const venue = resolveVenue(rel);

    return getImageUrl(
      venue?.images?.[0]?.image ||
      venue?.coverImage
    );
  },
  [wishlist, resolveVenue]
);

  /* ── Handlers — same real API calls the search page uses, adapted so a
        mixed-category grid (venues + farmstays + studios...) resolves each
        card's own category instead of a single page-wide activeCategory. ── */
  const onLikedProperty = useCallback(
    async (venue) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      await addLikedProperty({
        property_id: venue.childVenueId,
        property_type: venue.category || "venues",
      });
      load();
    },
    [user, load, setLoginOpen],
  );

  const onCompare = useCallback(
    async (venue, action) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      const payload = { venue_id: venue.childVenueId };
      try {
        action ? await addCompareAPI(payload) : await removeCompareAPI(payload);
      } finally {
        load();
      }
    },
    [user, load, setLoginOpen],
  );

  const cardProps = {
    likedData: likedIds,
    likedTotal: liked.length,
    user,
    wishlist,
    compares,
    onWishlist: setWishlistVenue,
    onCompare,
    onLikedProperty,
    locale,
    country,
  };

  const overview = [
    { key: "liked", label: "Liked Properties", count: liked.length, Icon: Heart, color: "#FF3040" },
    { key: "collections", label: "Collections", count: collections.length, Icon: Folder, color: "#7C3AED" },
    { key: "saved", label: "Saved Properties", count: wishlist.length, Icon: Bookmark, color: "#0EA5E9" },
  ];

  if (!user) {
    return <SignedOutState onLogin={() => setLoginOpen(true)} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* SECTION 1 — Heading */}
        <div className="mb-8">
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-gray-900 dark:text-gray-50">
            My Collections
          </h1>
          <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mt-1">
            Everything you&apos;ve liked and saved in one place.
          </p>
        </div>

        {/* SECTION 2 — Overview cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {overview.map((card) => (
            <OverviewCard key={card.key} {...card} loading={loading} />
          ))}
        </div>

        {/* SECTION 3 — Top tabs: Liked Properties / Collections (Recently
            Saved lives inside the Collections tab) / Recently Viewed.
            Reuses the platform's shared underline tab bar (see
            vendor/components/ScrollableTabBar.jsx) instead of a bespoke
            pill switcher, for visual consistency with the rest of the app. */}
        <ScrollableTabBar
          className="mb-6"
          sticky
          tabs={[
            { key: "liked", label: "Liked Properties", icon: Heart, count: liked.length },
            { key: "collections", label: "Collections", icon: Folder, count: collections.length },
            { key: "recent", label: "Recently Viewed", icon: Clock, count: recentViews.length },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "liked" && (
          <section className="mb-10">
            {loading ? (
              <SkeletonGrid count={4} />
            ) : likedVenues.length === 0 ? (
              <EmptyState
                icon={<Heart size={22} className="text-[#FF3040]" />}
                title="Start liking properties"
                subtitle="Tap the heart on any venue to save it here."
                ctaLabel="Explore Properties"
                ctaHref={`/${locale}/${country}/search/venues`}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {likedVenues.map((v) => (
                  <VenueCard key={v.childVenueId} venue={v} {...cardProps} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "collections" && (
          <>
            {/* Your Collections */}
            <SectionShell title="Your Collections" icon={<Folder size={16} className="text-violet-600" />}>
              {loading ? (
                <SkeletonGrid count={4} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {collections.map((cat) => (
                    <CollectionCard
                      key={cat.id}
                      cat={cat}
                      count={wishlist.filter((i) => i.category_id === cat.id).length}
                      coverImage={coverFor(cat.id)}
                      updatedLabel={formatUpdated(cat)}
                      selected={selectedCollectionId === cat.id}
                      onClick={() =>
                        setSelectedCollectionId((prev) => (prev === cat.id ? null : cat.id))
                      }
                    />
                  ))}
                  <CreateCollectionCard onClick={() => setShowCreateModal(true)} />
                </div>
              )}
            </SectionShell>

            {/* Recently Saved (regardless of collection), or a single
                collection's properties when one is selected above. */}
            <SectionShell
              title={selectedCollection ? selectedCollection.name : "Recently Saved"}
              icon={<Bookmark size={16} className="text-sky-500" />}
              action={
                selectedCollection && (
                  <button
                    type="button"
                    onClick={() => setSelectedCollectionId(null)}
                    className="text-[12.5px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Show all
                  </button>
                )
              }
            >
              {loading ? (
                <SkeletonGrid count={3} />
              ) : savedVenues.length === 0 ? (
                <EmptyState
                  icon={<Bookmark size={22} className="text-sky-500" />}
                  title="Nothing saved yet"
                  subtitle="Save a venue to a collection and it'll show up here."
                  ctaLabel="Explore Properties"
                  ctaHref={`/${locale}/${country}/search/venues`}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {savedVenues.map((v) => (
                    <VenueCard key={v.childVenueId} venue={v} {...cardProps} />
                  ))}
                </div>
              )}
            </SectionShell>
          </>
        )}

        {activeTab === "recent" && (
          <section className="mb-10">
            {loading ? (
              <SkeletonGrid count={3} />
            ) : recentViewGroups.length === 0 ? (
              <EmptyState
                icon={<Clock size={22} className="text-gray-400" />}
                title="No recently viewed properties"
                subtitle="Properties you open will show up here."
                ctaLabel="Explore Properties"
                ctaHref={`/${locale}/${country}/search/venues`}
              />
            ) : (
              recentViewGroups.map(({ label, venues }) => (
                <div key={label} className="mb-8 last:mb-0">
                  <h3 className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {venues.map((v) => (
                      <VenueCard key={v.childVenueId} venue={v} {...cardProps} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </div>

      {/* Reuses the same Save to Collection modal built for the search page —
          identical save/move/remove flow, no duplicated modal logic. */}
      <WishlistPopup
        wishvenue={collections}
        wishlist={wishlist}
        venue={wishlistVenue}
        open={!!wishlistVenue}
        user={user}
        onClose={() => {
          setWishlistVenue(null);
          load();
        }}
      />

      {showCreateModal && (
        <CreateCollectionShell
          onCancel={() => setShowCreateModal(false)}
          onCreated={(cat) => {
            setCollections((prev) => [cat, ...prev]);
            setShowCreateModal(false);
            toast.success(`Created "${cat.name}"`);
            logActivity("created_collection", { collectionName: cat.name });
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function OverviewCard({ label, count, Icon, color, loading }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex items-center gap-3">
      <span
        className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon size={19} color={color} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        {loading ? (
          <div className="h-6 w-10 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        ) : (
          <p className="text-[22px] font-bold text-gray-900 dark:text-gray-50 leading-none">{count}</p>
        )}
        <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function SectionShell({ title, icon, action, children }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-[16.5px] font-semibold text-gray-900 dark:text-gray-50">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ icon, title, subtitle, ctaLabel, ctaHref }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-3xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
      <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[14.5px] font-semibold text-gray-900 dark:text-gray-50 mb-1">{title}</p>
      {subtitle && (
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-5 max-w-xs">{subtitle}</p>
      )}
      {ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-semibold hover:opacity-90 transition"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white dark:bg-gray-900 shadow-sm animate-pulse">
          <div className="h-36 bg-gray-200 dark:bg-gray-800 rounded-t-3xl" />
          <div className="p-3.5 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionCard({ cat, count, coverImage, updatedLabel, selected, onClick }) {
  const { Icon, color } = resolveCollectionIcon(cat);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`group text-left rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)] transition-shadow cursor-pointer ${
        selected ? "border-violet-400 ring-2 ring-violet-200 dark:ring-violet-500/30" : "border-gray-100 dark:border-gray-800"
      }`}
    >
      <div className="h-36 relative overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}26, ${color}0D)` }}
          >
            <Icon size={30} color={color} strokeWidth={1.75} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur">
          <Icon size={14} color={color} strokeWidth={2} />
        </span>
      </div>
      <div className="p-3.5">
        <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-50 truncate">{cat.name}</p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
          {cat.total_wishlist} {cat.total_wishlist === 1 ? "Property" : "Properties"}
          {updatedLabel ? ` · Updated ${updatedLabel}` : ""}
        </p>
      </div>
    </motion.button>
  );
}

function CreateCollectionCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 min-h-[184px] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:bg-violet-50/40 dark:hover:bg-violet-500/5 transition-colors"
    >
      <span className="w-11 h-11 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
        <Plus size={18} className="text-violet-600" />
      </span>
      <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Create Collection</span>
    </button>
  );
}

// Standalone create-collection shell for the "+ Create Collection" card —
// same shell pattern as WishlistPopup (backdrop + ESC + scroll lock) but
// with no venue context, so CreateCollectionModal just creates the category
// without also saving a venue into it.
function CreateCollectionShell({ onCancel, onCreated }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  return (
    <AnimatePresence>
      <motion.div
        key="ccs-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
        className="fixed inset-0 z-[999] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <motion.div
          key="ccs-panel"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="w-full sm:max-w-[420px] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5"
        >
          <CreateCollectionModal onCancel={onCancel} onCreated={onCreated} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main export — Suspense boundary required for useSearchParams ── */
export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950 pt-24" />}>
      <CollectionsPageInner />
    </Suspense>
  );
}

function SignedOutState({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center pt-24 bg-white dark:bg-gray-950">
      <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
        <Folder size={26} className="text-violet-600" />
      </div>
      <div>
        <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
          Sign in to see your collections
        </p>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
          Likes, saves, and collections are tied to your account.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogin}
        className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13.5px] font-semibold hover:opacity-90 transition"
      >
        Sign In
      </button>
    </div>
  );
}
