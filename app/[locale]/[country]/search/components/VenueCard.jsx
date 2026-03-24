"use client";
import React from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const VenueCard = ({ venue, onHover, onLeave, onCompare, onWishlist ,locale ,country  })  => {

  const [currentImage, setCurrentImage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState(0);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

  const [categories, setCategories] = useState([
    { id: 1, name: "Favorites", image: "/category1.jpg" },
    { id: 2, name: "Weekend Trips", image: "/category2.jpg" },
  ]);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState("");

  // compare state (max 4)
  const [compareList, setCompareList] = useState([]);

  console.log()

  const images = venue.images?.length
    ? venue.images
    : [venue.image || "/placeholder.jpg"];

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImage > 0) {
      setDirection(-1);
      setCurrentImage(currentImage - 1);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImage < images.length - 1) {
      setDirection(1);
      setCurrentImage(currentImage + 1);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const handleAddToWishlist = (categoryId) => {
    console.log(`Added ${venue.name} to category ${categoryId}`);
    setWishlistCount(wishlistCount + 1);
    setWishlistModalOpen(false);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: Date.now(),
      name: newCategoryName,
      image: "/placeholder-category.jpg",
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
  };

  // compare toggle (max 4 venues)
  const toggleCompare = (e) => {

    e.preventDefault();
    e.stopPropagation();

    if (compareList.includes(venue.id)) {
      setCompareList(compareList.filter((id) => id !== venue.id));
    } else {
      if (compareList.length >= 4) return;
      setCompareList([...compareList, venue.id]);
    }

    onCompare && onCompare(venue);
  };

  return (
    <Link
     href={`/${locale || "en"}/${country || "in"}/search/${venue.id}`}
                  passHref 
                   target="_blank"
  rel="noopener noreferrer"
                  className="cursor-pointer hover:opacity-95 transition"> 
                  {/* /en/in/search/123 */}
    <div
      onMouseEnter={() => {
        setHovered(true);
        onHover && onHover(venue);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave && onLeave();
      }}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition w-full relative"
    >

      {/* IMAGE SLIDER */}
      <div className="relative h-52 sm:h-56 md:h-60 lg:h-64 w-full overflow-hidden">

        <AnimatePresence custom={direction} initial={false}>
          <motion.img
            key={currentImage}
            src={images[currentImage]}
            alt={venue.name}
            className="absolute top-0 left-0 h-full w-full object-cover rounded-2xl"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* ARROWS */}
        {images.length > 1 && hovered && (
          <>
            <button
              onClick={prevImage}
              disabled={currentImage === 0}
              className={`absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full shadow hover:bg-white z-20 ${
                currentImage === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={nextImage}
              disabled={currentImage === images.length - 1}
              className={`absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full shadow hover:bg-white z-20 ${
                currentImage === images.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* HEART */}
        <button
         onClick={(e) => {
            e.preventDefault();    
            e.stopPropagation();    
            onWishlist(venue);     
          }}
         
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow z-20 flex items-center justify-center"
        >
          <Heart
            size={16}
            className={wishlistCount > 0 ? "text-pink-500" : "text-gray-600"}
          />
        </button>

        {/* TAGS */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">

          {venue.offer && (
            <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Offer
            </span>
          )}

          {venue.suggested && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Suggested
            </span>
          )}

          {venue.featured && (
            <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Featured
            </span>
          )}

        </div>

        {/* COMPARE BUTTON */}
        <button
          onClick={toggleCompare}
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-semibold px-4 py-2 rounded-full shadow transition z-20
          ${
            compareList.includes(venue.id)
              ? "bg-[#8368EF] text-white"
              : "bg-white bg-opacity-90 hover:bg-[#8368EF] hover:text-white"
          }`}
        >
          {compareList.includes(venue.id) ? "✓ Compared" : "Compare"}
        </button>

      </div>

      {/* DETAILS */}
      <div className="mt-3 px-3 pb-3">

        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm sm:text-base md:text-sm lg:text-base">
            {venue.name}
          </h3>

          <span className="text-sm sm:text-base md:text-sm lg:text-base">
            ⭐ {venue.rating}
          </span>
        </div>

        <p className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm mt-1">
          1 bedroom · 1 bed
        </p>

        <p className="font-semibold mt-1 text-sm sm:text-base md:text-sm lg:text-base">
          {venue.price}
          <span className="text-gray-500 font-normal text-xs sm:text-sm md:text-xs lg:text-sm">
            {" "}
            for 5 nights
          </span>
        </p>

      </div>

    </div>
    </Link>
  );
}

export default React.memo(VenueCard);