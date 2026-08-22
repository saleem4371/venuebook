"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Film,
  Megaphone,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Image as ImageIcon,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Layers,
  ChevronRight,
  ShieldCheck,
  Star,
  Play,
  Volume2,
  Heart,
  Share2,
  Bookmark,
  ArrowUpRight,
  Edit2,
  Tag,
  TrendingUp,
  MousePointerClick,
  Receipt,
  Percent,
} from "lucide-react";

const BRAND_GRADIENT = "linear-gradient(242deg,#a44bf3,#499ce8)";

const WIZARD_STEPS = [
  { id: 1, title: "Type", label: "Ad Type" },
  { id: 2, title: "Property", label: "Property" },
  { id: 3, title: "Position", label: "Position" },
  { id: 4, title: "Location", label: "Location" },
  { id: 5, title: "Schedule", label: "Schedule" },
  { id: 6, title: "Budget", label: "Budget" },
  { id: 7, title: "Audience", label: "Audience" },
  { id: 8, title: "Creative", label: "Creative" },
  { id: 9, title: "Preview", label: "Preview" },
  { id: 10, title: "Review", label: "Review" },
];

const LOCATIONS = {
  India: {
    code: "in",
    states: {
      Karnataka: ["Bangalore Urban", "Mysore", "Mangalore", "Coorg"],
      Maharashtra: ["Mumbai City", "Pune", "Thane", "Nagpur"],
      "Delhi NCR": ["Central Delhi", "South Delhi", "Gurgaon", "Noida"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
      Goa: ["North Goa", "South Goa"],
    },
  },
  UAE: {
    code: "ae",
    states: {
      Dubai: ["Downtown Dubai", "Dubai Marina & JBR", "Business Bay", "Palm Jumeirah"],
      "Abu Dhabi": ["Corniche", "Yas Island", "Al Reem Island"],
      Sharjah: ["Al Majaz", "Al Qasba", "Al Taawun"],
    },
  },
};

const MOCK_PROPERTIES = [
  {
    id: "prop-1",
    name: "Swarnagiri Mantap",
    location: "Bangalore Urban, Karnataka",
    capacity: "850 Guests",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=75",
    type: "Heritage Mandap & Lawns",
  },
  {
    id: "prop-2",
    name: "Royal Banquet Hall",
    location: "South Delhi, Delhi NCR",
    capacity: "600 Guests",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=75",
    type: "Luxury Ballroom",
  },
  {
    id: "prop-3",
    name: "Lakeview Holiday Resort",
    location: "Coorg, Karnataka",
    capacity: "450 Guests",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=75",
    type: "Resort & Private Villa",
  },
  {
    id: "prop-4",
    name: "Zenith Studio & Open Terrace",
    location: "Mumbai City, Maharashtra",
    capacity: "300 Guests",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=75",
    type: "Rooftop & Terrace Lounge",
  },
];

const POSITIONS = [
  {
    id: "pos-homepage",
    name: "Homepage Prime Carousel",
    tag: "Highest Reach",
    description: "Featured on the main VenueBook discovery portal with maximum organic impressions.",
  },
  {
    id: "pos-search",
    name: "Category Search Results Top",
    tag: "High Intent",
    description: "Pinned in top 3 positions when organizers search for matching venue types.",
  },
  {
    id: "pos-district",
    name: "District Spotlight Header",
    tag: "Localized",
    description: "Dominates localized search results within the selected district radius.",
  },
  {
    id: "pos-feed",
    name: "Sponsored Story & Feed Stream",
    tag: "Mobile High CTR",
    description: "Autoplays seamlessly inside the organizer mobile discovery feed.",
  },
];

const AUDIENCE_TYPES = [
  "Wedding Couples & Families",
  "Professional Event Planners",
  "Corporate Hosts & HRs",
  "Anniversary & Birthday Planners",
];

const AUDIENCE_INTERESTS = [
  "Destination Weddings",
  "Luxury Catering",
  "Grand Mandaps",
  "Open Air Lawns",
  "Rooftop Banquets",
  "Private Villas",
  "Drone Photography",
  "Decor Packages",
];

const VALID_PROMOS = {
  WELCOME10: { discountPercent: 10, label: "10% Welcome Discount" },
  VENUE500: { flatDiscount: 500, label: "₹500 Flat Savings" },
  FESTIVE20: { discountPercent: 20, label: "20% Festive Boost" },
};

function CampaignSummaryPanel({
  formData,
  selectedProperty,
  selectedPosition,
  campaignDays,
  costPerDay,
  baseCost,
  discountAmount,
  gstAmount,
  grandTotal,
  promoInput,
  setPromoInput,
  appliedPromo,
  promoError,
  handleApplyPromo,
  handleRemovePromo,
  estimatedImpressions,
  estimatedClicks,
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-violet-600 dark:text-violet-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Campaign Summary
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          {formData.adType}
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Property</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
            {selectedProperty?.name}
          </span>
        </div>

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Target District</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {formData.district}
          </span>
        </div>

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Placement</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
            {selectedPosition?.name}
          </span>
        </div>

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Schedule</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {formData.startDate} to {formData.endDate}
          </span>
        </div>

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Duration</span>
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            {campaignDays} Calendar Days
          </span>
        </div>

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Cost Per Day</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            ₹{costPerDay} / day
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <Tag size={12} className="text-violet-500" />
            Promo Code
          </span>
          {appliedPromo && (
            <span className="text-[10px] text-emerald-600 font-bold">
              {appliedPromo.code} applied
            </span>
          )}
        </div>

        {appliedPromo ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {appliedPromo.label}
            </span>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] uppercase font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 transition-colors shrink-0"
            >
              Apply
            </button>
          </div>
        )}

        {promoError && (
          <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
            <AlertTriangle size={11} />
            {promoError}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] space-y-2 text-xs">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Base Cost (₹{costPerDay} × {campaignDays}d)</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            ₹{baseCost.toLocaleString("en-IN")}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Discount</span>
            <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>GST (18%)</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            ₹{gstAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] flex items-baseline justify-between">
          <div>
            <p className="text-xs font-black text-gray-900 dark:text-gray-100">
              Grand Total
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              Taxes & placement fees inclusive
            </p>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
            ₹{grandTotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/[0.06] space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300">
          <TrendingUp size={13} className="text-violet-500" />
          Estimated Performance (Historical)
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.04]">
            <p className="text-[10px] text-gray-400">Est. Impressions</p>
            <p className="font-extrabold text-gray-900 dark:text-gray-100">{estimatedImpressions}</p>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.04]">
            <p className="text-[10px] text-gray-400">Est. Clicks</p>
            <p className="font-extrabold text-violet-600 dark:text-violet-400">{estimatedClicks}</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center">
          *Estimates based on recent campaign performance in {formData.district}.
        </p>
      </div>
    </div>
  );
}

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const country = params?.country || "in";
  const basePath = `/${locale}/${country}/vendor/ads`;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    adType: "Sponsored Card",
    propertyId: "prop-1",
    position: "pos-homepage",
    country: "India",
    state: "Karnataka",
    district: "Bangalore Urban",
    startDate: "2026-09-01",
    endDate: "2026-09-15",
    dailyBudget: 750,
    audienceTypes: ["Wedding Couples & Families", "Professional Event Planners"],
    ageRange: "24 – 45",
    interests: ["Destination Weddings", "Open Air Lawns", "Luxury Catering"],
    title: "Book Your Dream Royal Wedding",
    subtitle: "Exclusive outdoor grand lawns with 1,500 guest capacity and luxury bridal suites.",
    ctaText: "Explore Venue",
    ctaDestination: "Parent Page",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1000&auto=format&fit=crop&q=80",
  });

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [imageError, setImageError] = useState(null);

  const selectedProperty = useMemo(() => {
    return MOCK_PROPERTIES.find((p) => p.id === formData.propertyId) || MOCK_PROPERTIES[0];
  }, [formData.propertyId]);

  const selectedPosition = useMemo(() => {
    return POSITIONS.find((p) => p.id === formData.position) || POSITIONS[0];
  }, [formData.position]);

  const availableStates = useMemo(() => {
    return Object.keys(LOCATIONS[formData.country]?.states || {});
  }, [formData.country]);

  const availableDistricts = useMemo(() => {
    return LOCATIONS[formData.country]?.states[formData.state] || [];
  }, [formData.country, formData.state]);

  useEffect(() => {
    if (!availableStates.includes(formData.state)) {
      const defaultState = availableStates[0] || "";
      setFormData((prev) => ({ ...prev, state: defaultState }));
    }
  }, [availableStates, formData.state]);

  useEffect(() => {
    if (!availableDistricts.includes(formData.district)) {
      const defaultDistrict = availableDistricts[0] || "";
      setFormData((prev) => ({ ...prev, district: defaultDistrict }));
    }
  }, [availableDistricts, formData.district]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 14;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const campaignDays = calculateDays();

  const costPerDay = useMemo(() => {
    if (formData.adType === "Solo Banner") return 750;
    if (formData.adType === "Sponsored Reel") return 500;
    return 300;
  }, [formData.adType]);

  const baseCost = costPerDay * campaignDays;

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.flatDiscount) return Math.min(appliedPromo.flatDiscount, baseCost);
    if (appliedPromo.discountPercent) return Math.round((baseCost * appliedPromo.discountPercent) / 100);
    return 0;
  }, [appliedPromo, baseCost]);

  const taxableAmount = Math.max(0, baseCost - discountAmount);
  const gstAmount = Math.round(taxableAmount * 0.18);
  const grandTotal = taxableAmount + gstAmount;

  const estimatedImpressions = useMemo(() => {
    const mult = formData.adType === "Solo Banner" ? 2200 : formData.adType === "Sponsored Reel" ? 1800 : 1200;
    const min = (campaignDays * mult).toLocaleString("en-IN");
    const max = (campaignDays * mult * 1.5).toLocaleString("en-IN");
    return `${min} – ${max}`;
  }, [formData.adType, campaignDays]);

  const estimatedClicks = useMemo(() => {
    const mult = formData.adType === "Solo Banner" ? 95 : formData.adType === "Sponsored Reel" ? 110 : 60;
    const min = (campaignDays * mult).toLocaleString("en-IN");
    const max = (campaignDays * mult * 1.4).toLocaleString("en-IN");
    return `${min} – ${max}`;
  }, [formData.adType, campaignDays]);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (VALID_PROMOS[code]) {
      setAppliedPromo({ ...VALID_PROMOS[code], code });
      setPromoError(null);
    } else {
      setPromoError("Invalid promo code. Try WELCOME10 or FESTIVE20.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  const isScheduleValid = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return false;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return end.getTime() >= start.getTime();
  }, [formData.startDate, formData.endDate]);

  const isBudgetValid = formData.dailyBudget >= 500;
  const isCreativeValid =
    formData.title.trim().length > 0 &&
    formData.title.length <= 50 &&
    formData.subtitle.trim().length > 0 &&
    formData.subtitle.length <= 100 &&
    formData.ctaText.trim().length > 0;

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!formData.adType;
      case 2:
        return !!formData.propertyId;
      case 3:
        return !!formData.position;
      case 4:
        return !!formData.country && !!formData.state && !!formData.district;
      case 5:
        return isScheduleValid;
      case 6:
        return isBudgetValid;
      case 7:
        return formData.audienceTypes.length > 0;
      case 8:
        return isCreativeValid && !imageError;
      case 9:
      case 10:
        return true;
      default:
        return true;
    }
  }, [currentStep, formData, isScheduleValid, isBudgetValid, isCreativeValid, imageError]);

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Unsupported format. Allowed: JPG, PNG, WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("File size exceeds 5MB limit.");
      return;
    }

    setImageError(null);
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const toggleAudienceType = (type) => {
    setFormData((prev) => {
      const exists = prev.audienceTypes.includes(type);
      return {
        ...prev,
        audienceTypes: exists
          ? prev.audienceTypes.filter((t) => t !== type)
          : [...prev.audienceTypes, type],
      };
    });
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(basePath)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
            Create Advertisement
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Create and schedule a promotional campaign for your property.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-4 sm:p-5 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {WIZARD_STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  disabled={isUpcoming}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 group transition-all text-left ${
                    isUpcoming ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-violet-600 text-white ring-4 ring-violet-500/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : step.id}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-bold leading-none truncate ${
                      isCurrent
                        ? "text-violet-600 dark:text-violet-400"
                        : isCompleted
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-gray-400"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </button>

                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${
                    isCompleted ? "bg-emerald-500" : "bg-gray-100 dark:bg-gray-800"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm min-h-[420px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 1: Select Advertisement Type
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose the visual format for your promotional campaign.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: "Sponsored Card",
                      icon: Sparkles,
                      title: "Sponsored Card",
                      desc: "Priority spotlight card featured in category and search results with 5x organic boost.",
                      rate: "₹300 / day",
                    },
                    {
                      id: "Sponsored Reel",
                      icon: Film,
                      title: "Sponsored Reel",
                      desc: "Immersive short-form vertical video tour inside the full-screen mobile stories stream.",
                      rate: "₹500 / day",
                    },
                    {
                      id: "Solo Banner",
                      icon: Megaphone,
                      title: "Solo Banner",
                      desc: "100% exclusive takeover billboard header across top district discovery pages.",
                      rate: "₹750 / day",
                    },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.adType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData((prev) => ({ ...prev, adType: type.id }))}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-violet-50/60 dark:bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/20 shadow-md scale-[1.01]"
                            : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300">
                              <Icon size={20} />
                            </span>
                            {isSelected && <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" />}
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {type.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                            {type.desc}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] text-xs font-bold text-violet-600 dark:text-violet-400">
                          {type.rate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 2: Choose Property
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select which venue property you want to advertise.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_PROPERTIES.map((prop) => {
                    const isSelected = formData.propertyId === prop.id;
                    return (
                      <div
                        key={prop.id}
                        onClick={() => setFormData((prev) => ({ ...prev, propertyId: prop.id }))}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center gap-4 ${
                          isSelected
                            ? "bg-violet-50/60 dark:bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/20 shadow-sm"
                            : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          <img src={prop.image} alt={prop.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                              {prop.name}
                            </h3>
                            {isSelected && <Check size={16} className="text-violet-600 dark:text-violet-400" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                            {prop.location}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            <Building2 size={10} />
                            {prop.type} • {prop.capacity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 3: Advertisement Position
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose the surface where your promotion will be featured.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {POSITIONS.map((pos) => {
                    const isSelected = formData.position === pos.id;
                    return (
                      <div
                        key={pos.id}
                        onClick={() => setFormData((prev) => ({ ...prev, position: pos.id }))}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-violet-50/60 dark:bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/20 shadow-sm"
                            : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                              {pos.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                              {pos.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {pos.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 4: Target Location
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select the country, state, and district where your ad will be targeted.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                      {Object.keys(LOCATIONS).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      State / City
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                      {availableStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      District / Radius
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/30 text-xs space-y-1">
                  <span className="font-bold text-violet-700 dark:text-violet-300">Selected Target Scope:</span>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your ad will run exclusively across <span className="font-semibold">{formData.district}</span>, {formData.state}, {formData.country}.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 5: Campaign Schedule
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Specify the start and end dates for your promotional schedule.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                </div>

                {!isScheduleValid && (
                  <p className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertTriangle size={13} />
                    End date must be on or after the start date.
                  </p>
                )}

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Total Campaign Duration:</span>
                  <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                    {campaignDays} Calendar Days
                  </span>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 6: Campaign Budget
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Set your daily and total maximum investment for this campaign.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Daily Budget (INR)
                      </label>
                      <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                        Min: ₹500
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={500}
                        step={50}
                        value={formData.dailyBudget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dailyBudget: Number(e.target.value) }))}
                        className="w-full ps-8 pe-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />
                    </div>
                    {!isBudgetValid && (
                      <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertTriangle size={13} />
                        Daily budget cannot be less than ₹500.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Maximum Campaign Budget
                    </label>
                    <div className="px-3.5 py-2.5 text-sm font-black rounded-xl bg-gray-100 dark:bg-gray-800/80 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-white/[0.08]">
                      ₹{(formData.dailyBudget * campaignDays).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      ₹{formData.dailyBudget} × {campaignDays} calendar days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 7: Target Audience
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Define the organizer segments most likely to book your venue.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience Segments
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCE_TYPES.map((type) => {
                        const isSelected = formData.audienceTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleAudienceType(type)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {isSelected && <Check size={12} className="inline me-1" />}
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Age Range
                    </label>
                    <select
                      value={formData.ageRange}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ageRange: e.target.value }))}
                      className="w-full sm:w-64 px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                      <option value="21 – 35">21 – 35 (Young Couples & Birthdays)</option>
                      <option value="24 – 45">24 – 45 (Prime Weddings & Corporate)</option>
                      <option value="35 – 60">35 – 60 (Family Milestone Celebrations)</option>
                      <option value="All Ages">All Ages</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Interests & Keywords
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCE_INTERESTS.map((interest) => {
                        const isSelected = formData.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 8: Creative Copy & Imagery
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Craft your headline and upload your hero visual.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Headline Title (Max 50 chars)
                      </label>
                      <span className={`text-[11px] font-mono ${formData.title.length > 50 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                        {formData.title.length} / 50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Book Your Dream Royal Wedding"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Subtitle Description (Max 100 chars)
                      </label>
                      <span className={`text-[11px] font-mono ${formData.subtitle.length > 100 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                        {formData.subtitle.length} / 100
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={100}
                      value={formData.subtitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g. Exclusive grand lawns with 1,500 guest capacity."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                        placeholder="e.g. Explore Venue"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        CTA Destination
                      </label>
                      <select
                        value={formData.ctaDestination}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ctaDestination: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      >
                        <option value="Parent Page">Parent Page</option>
                        <option value="Individual Child Venue">Individual Child Venue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Creative Image (JPG, PNG, WEBP — Max 5MB)
                    </label>
                    <label className="border-2 border-dashed border-gray-200 dark:border-white/[0.10] hover:border-violet-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center bg-gray-50/50 dark:bg-gray-900/30">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                      <Upload size={20} className="text-violet-500 mb-1" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Upload creative banner / photo
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Recommended: 1200 × 600 px
                      </p>
                    </label>

                    {imageError && (
                      <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle size={13} />
                        {imageError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 9: Live Advertisement Preview
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Inspect how your creative will appear to organizers.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  {formData.adType === "Sponsored Card" && (
                    <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-gray-200 dark:border-white/[0.08] shadow-xl">
                      <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                        <img src={formData.image} alt={formData.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                        <div className="absolute top-3 start-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-gray-950 shadow-md">
                            <Sparkles size={12} className="fill-gray-950" />
                            SPONSORED
                          </span>
                        </div>
                        <div className="absolute bottom-3 start-3 end-3 text-white">
                          <p className="text-xs text-amber-300 font-medium">{formData.district}, {formData.state}</p>
                          <h4 className="text-base font-bold text-white leading-tight">{formData.title}</h4>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-600 dark:text-gray-300">{formData.subtitle}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedProperty.name}</span>
                          <button type="button" className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-violet-600">
                            {formData.ctaText}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.adType === "Sponsored Reel" && (
                    <div className="relative mx-auto max-w-[280px] rounded-[28px] overflow-hidden bg-black border-4 border-gray-900 shadow-2xl">
                      <div className="relative h-[440px] w-full">
                        <img src={formData.image} alt={formData.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
                        <div className="absolute top-4 start-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-pink-500 text-white">
                            SPONSORED REEL
                          </span>
                        </div>
                        <div className="absolute bottom-4 start-4 end-4 text-white space-y-1">
                          <p className="text-xs text-pink-300 font-bold">{selectedProperty.name}</p>
                          <h4 className="text-sm font-bold leading-tight">{formData.title}</h4>
                          <p className="text-[11px] text-gray-300 line-clamp-2">{formData.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.adType === "Solo Banner" && (
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/[0.08] bg-gradient-to-r from-gray-950 via-indigo-950 to-gray-950 p-6 text-white min-h-[220px] flex flex-col justify-between">
                      <img src={formData.image} alt={formData.title} className="absolute inset-0 w-full h-full object-cover opacity-35" />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white">
                          SOLO BANNER • EXCLUSIVE
                        </span>
                        <span className="text-xs text-gray-300">{formData.ctaDestination}</span>
                      </div>
                      <div className="relative z-10 my-3">
                        <p className="text-xs font-bold uppercase text-indigo-400">{selectedProperty.name}</p>
                        <h3 className="text-xl font-black text-white">{formData.title}</h3>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">{formData.subtitle}</p>
                      </div>
                      <div className="relative z-10">
                        <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600">
                          {formData.ctaText}
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step 10: Campaign Final Review
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Review your full campaign specifications, pricing, and creative before final confirmation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/[0.06]">
                      <span className="font-bold text-gray-900 dark:text-gray-100">Advertisement & Property</span>
                      <button type="button" onClick={() => setCurrentStep(1)} className="text-violet-600 font-semibold hover:underline flex items-center gap-1">
                        <Edit2 size={11} /> Edit
                      </button>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Ad Type:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.adType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Property:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedProperty.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Placement:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedPosition.name}</span></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/[0.06]">
                      <span className="font-bold text-gray-900 dark:text-gray-100">Location & Schedule</span>
                      <button type="button" onClick={() => setCurrentStep(4)} className="text-violet-600 font-semibold hover:underline flex items-center gap-1">
                        <Edit2 size={11} /> Edit
                      </button>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Target District:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.district}, {formData.state}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Window:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.startDate} to {formData.endDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Duration:</span> <span className="font-semibold text-violet-600 dark:text-violet-400">{campaignDays} Days</span></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/[0.06]">
                      <span className="font-bold text-gray-900 dark:text-gray-100">Audience & Targeting</span>
                      <button type="button" onClick={() => setCurrentStep(7)} className="text-violet-600 font-semibold hover:underline flex items-center gap-1">
                        <Edit2 size={11} /> Edit
                      </button>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Age:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.ageRange}</span></div>
                    <div className="text-gray-500">
                      <span>Segments: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.audienceTypes.join(", ")}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/[0.06]">
                      <span className="font-bold text-gray-900 dark:text-gray-100">Creative Copy</span>
                      <button type="button" onClick={() => setCurrentStep(8)} className="text-violet-600 font-semibold hover:underline flex items-center gap-1">
                        <Edit2 size={11} /> Edit
                      </button>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Title:</span> <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[170px]">{formData.title}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CTA:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.ctaText} ({formData.ctaDestination})</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                currentStep === 1
                  ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              }`}
            >
              Back
            </button>

            {currentStep < 10 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 10))}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  !canContinue
                    ? "bg-gray-300 dark:bg-gray-800 cursor-not-allowed opacity-60"
                    : "shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30"
                }`}
                style={{ background: canContinue ? BRAND_GRADIENT : undefined }}
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 transition-all bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                <CheckCircle2 size={16} />
                Submit Advertisement (₹{grandTotal.toLocaleString("en-IN")})
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 w-full">
          <CampaignSummaryPanel
            formData={formData}
            selectedProperty={selectedProperty}
            selectedPosition={selectedPosition}
            campaignDays={campaignDays}
            costPerDay={costPerDay}
            baseCost={baseCost}
            discountAmount={discountAmount}
            gstAmount={gstAmount}
            grandTotal={grandTotal}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            appliedPromo={appliedPromo}
            promoError={promoError}
            handleApplyPromo={handleApplyPromo}
            handleRemovePromo={handleRemovePromo}
            estimatedImpressions={estimatedImpressions}
            estimatedClicks={estimatedClicks}
          />
        </div>
      </div>

      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/[0.08] shadow-2xl p-6 sm:p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800">
                <Clock size={12} />
                Status: Pending Approval
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Advertisement submitted successfully
              </h3>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/[0.06] text-left text-xs space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Campaign:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.adType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Property:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedProperty.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{campaignDays} Days</span></div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-gray-200 dark:border-white/[0.06]">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your advertisement is now under review. Once approved, it will go live automatically on <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.startDate}</span>.
              </p>

              <button
                type="button"
                onClick={() => router.push(basePath)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30"
                style={{ background: BRAND_GRADIENT }}
              >
                Return to Ads Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
