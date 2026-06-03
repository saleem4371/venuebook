"use client";

import React, { useMemo, useState } from "react";
import { Heart, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { useCategory } from "@/context/CategoryContext";

const VenueCard = ({
  venue,
  onHover,
  wishlist,
  compares,
  onLeave,
  onCompare,
  onRecentViews,
  onWishlist,
  onRemoveWishlist,
  locale,
  country,
  compareList,
  setCompareList,
  hoverVenue,
}) => {


    const { activeCategory } = useCategory();

  /* ---------------- STATE ---------------- */
  const [currentImage, setCurrentImage] = useState(0);
  const [hovered, setHovered] = useState(false);

  // const [liked, setLiked] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

  const [compareAnim, setCompareAnim] = useState(false);

  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const liked = wishlist?.some((item) => item.venue_id === venue.childVenueId);

  /* ---------------- IMAGES ---------------- */
// const images = useMemo(
//   () =>
//     venue?.images?.length
//       ? venue.images.map(({ image }) =>
//           image?.startsWith("http")
//             ? image
//             : `${BASE_URL}/${image}`
//         )
//       : [
//           "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png",
//         ],
//   [venue?.images, BASE_URL]
// );

// const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

const images = useMemo(() => {
  if (!venue?.images?.length) {
    return [
      "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png",
    ];
  }

  return venue.images
    .map((item) => {
      const image =
        typeof item === "string"
          ? item
          : item?.image || item?.url || "";

      if (!image) return null;

      return image.startsWith("http")
        ? image
        : `${BASE_URL}/${image}`;
    })
    .filter(Boolean);
}, [venue?.images, BASE_URL]);


console.log(images)
  const isActive = hoverVenue?.childVenueId === venue.childVenueId;

  /* ---------------- SLIDER ---------------- */
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((p) => (p + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1));
  };

  /* ---------------- WISHLIST FLOW ---------------- */
  const openWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWishlistModal(true);
  };

  //   const toggleWishlist = async (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   const nextState = !liked;
  //   setLiked(nextState);

  //   // animation

  //   try {
  //     await saveWishlistAPI({
  //       venueId: venue.childVenueId,
  //       action: nextState ? "add" : "remove",
  //     });

  //     // optional callback
  //     if(nextState){
  //  onWishlist?.(venue, nextState);
  //  setHeartPop(true);
  //   setTimeout(() => setHeartPop(false), 500);
  //     }

  //   } catch (err) {
  //     console.error(err);
  //   }

  // };
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !liked;

    try {
      /* ---------------- API ---------------- */
      // await saveWishlistAPI({
      //   venue_id: venue.childVenueId,
      //   action: nextState ? "add" : "remove",
      // });

      /* ---------------- UPDATE PARENT ---------------- */

      /* ---------------- ADD ANIMATION ---------------- */
      if (nextState) {
        setHeartPop(true);
        onWishlist?.(venue, nextState);
        setTimeout(() => {
          setHeartPop(false);
        }, 650);
      } else {
        onRemoveWishlist?.(venue);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };
  /* ---------------- COMPARE ---------------- */
  /* ---------------- COMPARE ---------------- */

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const id = venue.childVenueId;

    const isAlreadyCompared = compares?.includes(id);

    // REMOVE
    if (isAlreadyCompared) {
      onCompare?.(venue, false); // parent handles remove API + state
      // parent handles remove API + state
      return;
    }

    // LIMIT
    if ((compares?.length || 0) >= 4) {
      alert("Only 4 venues allowed");
      return;
    }

    // ADD
    onCompare?.(venue, true); // parent handles add API + state
  };
  // const isCompared = compareList?.includes(
  //   venue.childVenueId
  // );

  const compareIds = useMemo(
    () => new Set(compares?.map((c) => c.venue_id)),
    [compares],
  );

  const isCompared = compareIds.has(venue.childVenueId);


  /* ---------------- UI ---------------- */
  return (
    <Link
      href={`/${locale || "en"}/${country || "in"}/search/${activeCategory}/${venue.childVenueId}`}
      className="block"
      target="_blank"
     onClickCapture={() => onRecentViews?.(venue)}
    >
      <motion.div
        onMouseEnter={() => {
          setHovered(true);
          onHover?.(venue);
        }}
        onMouseLeave={() => {
          setHovered(false);
          onLeave?.();
        }}
        animate={{
          y: isActive ? -6 : 0,
          scale: isActive ? 1.03 : 1,
        }}
        transition={{ duration: 0.25 }}
        className="
          relative
          overflow-hidden
          rounded-2xl
          bg-white
          border border-gray-100
          shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
          hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]
          hover:border-gray-200
          transition-all duration-200
          z-[1]
        "
      >
        {/* ---------------- IMAGE SLIDER ---------------- */}
        <div className="relative h-60 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </AnimatePresence>

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* ❤️ HEART POP */}
          <AnimatePresence>
            {heartPop && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none"
              >
                <Heart className="text-pink-500 fill-pink-500" size={70} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ARROWS */}
          {hovered && images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* DOTS */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentImage ? "w-4 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* ❤️ WISHLIST */}
          {/* <button
            onClick={toggleWishlist}
            className="absolute top-3 left-3 bg-white/80 p-2 rounded-full shadow"
          >
            <Heart
              size={16}
              className={
                liked ? "text-pink-500 fill-pink-500" : "text-gray-700"
              }
            />
          </button> */}
          <motion.button
            type="button"
            onClick={toggleWishlist}
            whileTap={{ scale: 0.85 }}
            animate={{
              scale: liked ? [1, 1.25, 1] : 1,
            }}
            transition={{
              duration: 0.35,
            }}
            className="
    absolute
    top-3
    left-3
    z-[2]
    flex
    items-center
    justify-center
    h-10
    w-10
    rounded-full
    bg-white/85
    backdrop-blur-md
    shadow-[0_4px_20px_rgba(0,0,0,0.12)]
    border
    border-white/30
  "
          >
            <motion.div
              animate={{
                scale: liked ? [1, 1.4, 1] : 1,
                rotate: liked ? [0, -8, 8, 0] : 0,
              }}
              transition={{
                duration: 0.45,
              }}
            >
              <Heart
                size={18}
                className={`
        transition-all duration-300
        ${liked ? "fill-pink-500 text-pink-500" : "text-gray-700"}
      `}
              />
            </motion.div>
          </motion.button>

          {/* ⚖️ COMPARE */}
          { venue.minPrice  && (
   <motion.button
            onClick={handleCompare}
            animate={{ scale: compareAnim ? 1.15 : 1 }}
            className={`
              absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow
              ${isCompared ? "bg-purple-600 text-white" : "bg-white/80 text-gray-800"}
            `}
          >
            {isCompared ? "Compared ✓" : "Compare"}
          </motion.button>
          )}
       

          {/* PRICE */}
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-lg font-bold">₹{venue.minPrice ? venue.minPrice :'Contact '}</p>
            <p className="text-[10px] opacity-80">starting price</p>
          </div>
        </div>

        {/* ---------------- CONTENT ---------------- */}
        <div className="p-4">
          <h3 className="text-[15px] font-semibold truncate">
            {venue.venueName}
          </h3>

          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin size={12} />
            {venue.city} · {venue.state}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default React.memo(VenueCard);
