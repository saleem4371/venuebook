"use client";

import { useState, useEffect } from "react";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/app/[locale]/[country]/home/components/LoginModal";
import PropertyTypeModal from "@/app/[locale]/[country]/vendor/listing/components/PropertyTypeModal";
import VendorAlreadyModal from "./components/VendorAlreadyModal";

import { useGlobal } from "@/context/GlobalProvider";
import { country_of_category } from "@/services/global.service";
import { last_parent_id,parent_of_category } from "@/services/listing.service";
import {
  getDraftsForCategory,
  restoreArchivedDraft,
  deleteArchivedDraft,
} from "@/app/[locale]/[country]/start-listing/components/useListingWizard";

/* ─────────────────────────────────────────────────────────────────── */
/*  Data                                                                */
/* ─────────────────────────────────────────────────────────────────── */

const STAT_KEYS = ["earning", "hosts", "time", "guests"];

/* ─────────────────────────────────────────────────────────────────── */
/*  Page                                                                */
/* ─────────────────────────────────────────────────────────────────── */

export default function ListYourPropertyPage() {
  const { categorys } = useGlobal();
  const [loadData, setLoadData] = useState([]);


const [parentData, setParentData] = useState([]);

  const t = useTranslations("listing");

  const [selected, setSelected] = useState("venue");
  const params  = useParams();
  const router  = useRouter();
  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  const region   = country.toUpperCase();
  const category = categorys?.find((c) => c.name === selected) || {};

  let stat = {};
  try {
    stat =
      typeof category?.stat === "string"
        ? JSON.parse(category.stat)
        : category?.stat || {};
  } catch (e) {
    stat = {};
  }

  const isComingSoon = selected === 6;

  // ── Auth ──────────────────────────────────────────────────────────
  const { isLoggedIn, user } = useAuth();

  // authIntent tracks WHY the login modal was opened.
  // "start-listing" → triggered by the CTA; runs vendor/structure checks after login.
  // "general"       → triggered by header/nav; normal login only, no routing modals.
  const [authIntent,        setAuthIntent]        = useState("general");
  const [showLogin,         setShowLogin]         = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showVendorModal,   setShowVendorModal]   = useState(false);

  // ── Draft selector (item 10) ──────────────────────────────────────
  const [showDraftSelector, setShowDraftSelector] = useState(false);
  const [draftList,         setDraftList]         = useState([]);

  // Full vendor — has completed listing + subscription
  const resolveIsVendor = (u) => Number(u?.is_vendor) === 1;

  // Parent created but listing wizard not yet completed
  const resolveIsParentOnly = (u) =>
    Number(u?.is_parent) === 1 && Number(u?.is_vendor) === 0;

  // Open login modal with an intent so post-login routing is correct
  const openLogin = (intent = "general") => {
    setAuthIntent(intent);
    setShowLogin(true);
  };

  const openStructureModal = () => setShowPropertyModal(true);
  const openVendorModal    = () => setShowVendorModal(true);

  // Route a parent-only user — but only if a parent actually exists for the
  // *currently selected* category.  is_parent=1 is a global flag; the parent
  // record itself is per-category, so we must verify before skipping the modal.
  const routeParentOnlyUser = async () => {
    try {
      const res = await last_parent_id(selected);
      if (res?.data) {
        // Parent exists for this category → go straight to the wizard.
        // WizardShell will display the parent badge automatically.
        router.push(`/${locale}/${country}/start-listing/${selected}/basic-details`);
      } else {
        // No parent for this category → show structure modal as normal.
        openStructureModal();
      }
    } catch (_) {
      // On API error fall back to the structure modal.
      openStructureModal();
    }
  };

  // ── CTA click (Start Listing button) ──────────────────────────────
  const handleCtaClick = () => {
    if (isComingSoon) return;

    if (!isLoggedIn) {
      openLogin("start-listing");
      return;
    }

    console.log("[StartListing] CTA clicked — already logged in:", {
      id:          user?.id,
      isVendor:    Number(user?.is_vendor),
      isParent:    Number(user?.is_parent),
    });

    // Full vendor → show dashboard modal
    if (resolveIsVendor(user)) {
      openVendorModal();
      return;
    }

    // Parent created but listing not done → check if parent exists for this category
    if (resolveIsParentOnly(user)) {
      routeParentOnlyUser();
      
      return;
    }

    // Brand new user → ask Single vs Multi-Unit
    openStructureModal();
  };

  // ── Post-login callback ────────────────────────────────────────────
  // freshUser arrives directly from fetchUser() — no stale state.
  const handleLoginSuccess = (freshUser) => {
    setShowLogin(false);

    console.log("[Login] Post-login user resolved:", {
      intent:      authIntent,
      id:          freshUser?.id,
      role:        freshUser?.role,
      accountType: freshUser?.account_type,
      isVendor:    Number(freshUser?.is_vendor),
      isParent:    Number(freshUser?.is_parent),
      email:       freshUser?.email,
    });

    // Session expiry recovery (item 6): if the wizard stored a return URL before
    // redirecting to login, resume from that exact step now.
    try {
      const returnUrl = sessionStorage.getItem("vb_return_after_login");
      if (returnUrl) {
        sessionStorage.removeItem("vb_return_after_login");
        router.push(returnUrl);
        return;
      }
    } catch (_) {}

    // Only run Start Listing routing when user deliberately clicked Start Listing.
    // Header / global logins (authIntent = "general") do nothing extra here.
    if (authIntent !== "start-listing") {
      console.log("[Login] General login — no listing modals triggered.");
      return;
    }

    // Full vendor → show dashboard modal
    if (resolveIsVendor(freshUser)) {
      console.log("[Login] → Existing vendor → VendorAlreadyModal");
      openVendorModal();
      return;
    }

    // Parent done but listing not completed → verify parent exists for this category
    //if (resolveIsParentOnly(freshUser)) {
    if (parentData) {
      console.log("[Login] → Parent-only user → checking category parent");
      routeParentOnlyUser();
      return;
    }

    console.log("[Login] → New / consumer user → PropertyTypeModal");
    openStructureModal();
  };

  // ── Property type continue → check for existing drafts first (item 10) ──
  const handlePropertyTypeContinue = (type) => {
    setShowPropertyModal(false);

    // For single-property flow: check if a draft already exists for this category
    if (type === "single") {
      try {
        const drafts = getDraftsForCategory(selected);
        if (drafts.length > 0) {
          setDraftList(drafts);
          setShowDraftSelector(true);
          return;
        }
      } catch (_) {}
      router.push(`/${locale}/${country}/start-listing/${selected}/basic-details`);
    } else {
      router.push(`/${locale}/${country}/start-listing/${selected}/parent-setup`);
    }
  };

  // ── Draft selector actions (item 10) ──────────────────────────────
  const handleDraftResume = (draft) => {
    setShowDraftSelector(false);
    if (!draft.isActive) {
      // Restore archived draft to active slot before navigating
      restoreArchivedDraft(selected, draft.id);
    }
    // Return URL so wizard can jump straight to the saved step
    sessionStorage.setItem(`draft_modal_shown_${selected}`, "");  // reset so wizard shows modal
    router.push(`/${locale}/${country}/start-listing/${selected}/basic-details`);
  };

  const handleDraftDelete = (draft) => {
    if (draft.isActive) {
      try { localStorage.removeItem(`listing_draft_${selected}`); } catch (_) {}
    } else {
      deleteArchivedDraft(draft.id);
    }
    const remaining = draftList.filter((d) => d.id !== draft.id);
    setDraftList(remaining);
    if (remaining.length === 0) {
      setShowDraftSelector(false);
      router.push(`/${locale}/${country}/start-listing/${selected}/basic-details`);
    }
  };

  const handleDraftStartNew = () => {
    setShowDraftSelector(false);
    router.push(`/${locale}/${country}/start-listing/${selected}/basic-details`);
  };

  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/600x400";
    return `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${path}`;
  };

  const [pageLoading, setPageLoading] = useState(true);

  
  
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await country_of_category();
      setLoadData(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

 // ── Parent ID Loading  ─────────────────────────────────────────────────────────

  useEffect(() => {
     //load();
    load_parent(selected);
  }, [selected]);

  const load_parent = async (selected) => {
    try {
      const resp = await parent_of_category(selected);
      setParentData(Array.isArray(resp?.data) ? resp.data : []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };
  
 useEffect(() => {
  localStorage.removeItem("vb_pending_category");

  if (parentData.length > 0) {
    localStorage.setItem(
      "vb_parent_venue_name",
      parentData[0].venue_name
    );
  } else {
    localStorage.removeItem("vb_parent_venue_name");
  }
}, [parentData]);



  // ── Render ─────────────────────────────────────────────────────────
  return (
    <main className="bg-white dark:bg-gray-950">

      {/* Login modal — intent-aware */}
      <LoginModal
        open={showLogin}
        setOpen={setShowLogin}
        onSuccess={handleLoginSuccess}
      />

      {/* Property structure modal — Single vs Multi-Unit (new users only) */}
      <PropertyTypeModal
        open={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onContinue={handlePropertyTypeContinue}
        category={selected}
      />

      {/* ── Draft Selector Modal (item 10) ─────────────────────────────── */}
      {showDraftSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center">
              <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Resume a draft?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You have {draftList.length} saved draft{draftList.length > 1 ? "s" : ""}. Pick one to continue or start fresh.
              </p>
            </div>

            {/* Draft list */}
            <div className="flex flex-col gap-2">
              {draftList.map((draft) => (
                <div key={draft.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {draft.title || "Untitled listing"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{draft.stepKey}</span>
                      {draft.savedAt && (
                        <><span>·</span><span>{new Date(draft.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></>
                      )}
                      {draft.isActive && (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">Active</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDraftResume(draft)}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Resume
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleDraftDelete(draft)}
                      className="text-xs font-medium text-red-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Start new */}
            <button
              type="button"
              onClick={handleDraftStartNew}
              className="w-full min-h-[44px] rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
            >
              Start new listing
            </button>
            <button
              type="button"
              onClick={() => setShowDraftSelector(false)}
              className="w-full text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing vendor routing modal — non-dismissible */}
      <VendorAlreadyModal
        open={showVendorModal}
        onDashboard={() => {
          setShowVendorModal(false);
          router.push(`/${locale}/${country}/vendor/listing`);
        }}
        onHome={() => {
          setShowVendorModal(false);
          router.push(`/${locale}/${country}/home`);
        }}
      />

      <section className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-72px)] pt-[64px] md:pt-[72px] w-full lg:max-w-[1400px] lg:mx-auto">

        {/* ── RIGHT: illustration ── */}
        <div
          className={[
            "order-first lg:order-last",
            "lg:w-1/2 lg:flex-shrink-0",
            "lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]",
            "flex items-center justify-center lg:justify-start",
            "bg-white dark:bg-gray-950",
          ].join(" ")}
        >
          <div className="w-full h-[62vw] min-h-[240px] max-h-[440px] lg:w-full lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {pageLoading ? (
              <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.img
                  key={selected}
                  src={getImageUrl(category?.image)}
                  alt={category ? t(`category.${selected}.label`) : "Category Image"}
                  className="w-full h-full object-contain drop-shadow-md"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -6,  scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  draggable="false"
                />
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── LEFT: content ── */}
        <div className="order-last lg:order-first lg:w-1/2 flex flex-col justify-center lg:overflow-y-auto px-5 sm:px-8 lg:pl-10 lg:pr-6 xl:pl-16 xl:pr-8 py-10 lg:py-12">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 mb-6 self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              {t("eyebrow")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4">
            {t("headline_1")}{" "}
            <span
              className="block py-3"
              style={{
                background: "linear-gradient(242deg, #a44bf3, #499ce8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("headline_2")}
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-7 max-w-[460px]">
            {t(`sub_copy.${region}`)}
          </p>

          {/* Category tabs */}
          <div className="mb-7">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              {t("what_listing")}
            </p>

            {pageLoading ? (
              /* ── Category tab skeletons ── */
              <div className="flex flex-wrap gap-2">
                {[72, 88, 64, 80, 96, 76].map((w, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"
                    style={{ width: w }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {loadData.map((cat) => {
                  const active = cat.name === selected;
                  const soon   = cat.name === "experience";
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => !soon && setSelected(cat.name)}
                      disabled={soon}
                      className={[
                        "relative inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium",
                        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                        soon
                          ? "border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-60"
                          : active
                            ? "bg-violet-600 border-violet-600 text-white shadow-sm scale-[1.03]"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer",
                      ].join(" ")}
                    >
                      {t(`category.${cat.name}.label`)}
                      {soon && (
                        <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-600">
                          {t("coming_soon_badge")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {pageLoading ? (
              /* ── Description skeleton ── */
              <div className="mt-3 h-4 w-64 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.p
                  key={selected}
                  initial={{ opacity: 0, y: 4  }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="mt-2.5 text-sm text-gray-400 dark:text-gray-500"
                >
                  {t(`category.${selected}.desc.${region}`)}
                </motion.p>
              </AnimatePresence>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            {pageLoading ? (
              /* ── CTA skeleton ── */
              <div className="h-12 w-52 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : isComingSoon ? (
              <div className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed shrink-0 border border-gray-200 dark:border-gray-800">
                {t(`cta_button.${selected}`)}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 shrink-0"
                style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selected}
                    initial={{ opacity: 0, y: 6  }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{    opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2.5"
                  >
                    {t(`cta_button.${selected}`)}
                    <ArrowRightIcon />
                  </motion.span>
                </AnimatePresence>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-5">
            {pageLoading ? (
              /* ── Stats skeletons ── */
              <>
                {STAT_KEYS.map((key) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="h-3 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="h-6 w-20 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  </div>
                ))}
              </>
            ) : (
              <AnimatePresence mode="wait">
                {STAT_KEYS.map((key) => (
                  <motion.div
                    key={`${selected}-${key}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0        }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                      {t(`stat.${key}`)}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {key === "earning" ? t(`earning.${region}`) : stat?.[key] ?? "-"}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Icon                                                                */
/* ─────────────────────────────────────────────────────────────────── */
function ArrowRightIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
