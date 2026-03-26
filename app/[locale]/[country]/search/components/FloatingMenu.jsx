"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Share2, Scale, Building2, X } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useSearchParams, usePathname ,useRouter} from "next/navigation";




export default function FloatingMenu( {compareList, setCompareList }) {
  const [open, setOpen] = useState(false);

  

  const searchParams = useSearchParams();
const pathname = usePathname();
const router = useRouter();

const useLastRoute = () => {
  const pathname = usePathname();
  return pathname.split("/").filter(Boolean).pop();
};

// usage
const lastSegment = useLastRoute();

  const { compareOpen, setCompareOpen } = useUI();
  const ref = useRef(null);

  /* 👉 CLOSE ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* 🔗 SHARE FUNCTION */
const handleShare = async () => {
  const fullUrl = window.location.origin + pathname + "?" + searchParams.toString();

  if (navigator.share) {
    await navigator.share({
      title: "Check this venue",
      url: fullUrl,
    });
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullUrl)}`,
      "_blank"
    );
  }
};

  const handleNavigate = (key) => {
  // keep same prefix (/in/en/search/)
  const basePath = pathname.split("/").slice(0, -1).join("/");

  router.push(`${basePath}/${key}`);
  setOpen(false);
};


  // 🔥 trigger animation when count changes


  return (
    <>
      {/* 🔥 FLOATING MENU (MOBILE ONLY) */}
      <AnimatePresence>
        {!compareOpen && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed md:hidden right-4 bottom-24 flex flex-col items-end gap-3 z-50"
          >
            {/* 🔝 HOME MENU */}
            <div className="relative flex flex-col items-end">
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    className="absolute bottom-16 flex flex-col items-end gap-3"
                  >
                    <MenuItem
                      icon={<Building2 size={18} />}
                      label="Venue"
                      active={lastSegment === "venues"}
                       onClick={() => handleNavigate('venues')}
                    />

                    

                    <MenuItem
                      icon={<Home size={18} />}
                      label="Farmstay"
                      active={lastSegment === "farmstay"}
                       onClick={() => handleNavigate('farmstay')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HOME BUTTON */}
              <motion.button
                onClick={() => setOpen(!open)}
                whileTap={{ scale: 0.9 }}
                className="bg-white/80 backdrop-blur-md shadow-lg border border-white/40 rounded-full p-3 hover:scale-105 transition"
              >
                <Home size={18} />
              </motion.button>
            </div>

            {/* 🔥 FIXED BUTTONS */}
            <CompareButton
              count={compareList.length}
              onClick={() => setCompareOpen(true)}
            />

            {/* <IconButton icon={<Share2 size={18} />} onClick={handleShare} /> */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 COMPARE MODAL */}
      <AnimatePresence>
        {compareOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-end justify-center z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCompareOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-xl"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">
                  Compare List ({compareList.length}/4)
                </h2>
                <X onClick={() => setCompareOpen(false)} />
              </div>

              {/* LIST */}
              {compareList.length === 0 ? (
                <p className="text-gray-500 text-sm">No items added</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {compareList.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      {item}

                      <button
                        onClick={() =>
                          setCompareList((prev) =>
                            prev.filter((_, index) => index !== i)
                          )
                        }
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* LIMIT MESSAGE */}
              {compareList.length >= 4 && (
                <p className="text-xs text-red-500 mb-2">
                  Maximum 4 items allowed
                </p>
              )}

              {/* ACTION BUTTON */}
              <button
                disabled={compareList.length < 2}
                onClick={() => {
                  window.location.href = `/compare?items=${compareList.join(
                    ","
                  )}`;
                }}
                className={`w-full py-3 rounded-xl font-medium transition ${
                  compareList.length < 2
                    ? "bg-gray-300 text-gray-500"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                Compare Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* 🔘 ICON BUTTON */
function IconButton({ icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/80 backdrop-blur-md shadow-lg border border-white/40 rounded-full p-3 hover:scale-105 transition"
    >
      {icon}
    </button>
  );
}

/* 🔥 COMPARE BUTTON */
function CompareButton({ count, onClick }) {
const [animateKey, setAnimateKey] = useState(0);


      useEffect(() => {
    if (count > 0) {
      setAnimateKey((prev) => prev + 1);
    }
  }, [count]);
  return (
     <div className="relative flex items-center justify-center">

      {/* BUTTON */}
      <motion.button
        key={animateKey} // 🔥 re-trigger animation
        onClick={onClick}
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.25, 0.95, 1],
          rotate: [0, -8, 8, 0],
        }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative p-3 rounded-full 
        bg-gradient-to-br from-[#7B61FF] to-[#9F7AEA] 
        text-white shadow-lg transition-all duration-300"
      >
        {/* Glow Pulse */}
        <span className="absolute inset-0 rounded-full bg-purple-400 opacity-20 blur-md animate-ping"></span>

        <Scale size={18} className="relative z-10" />
      </motion.button>

      {/* BADGE */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0, y: -5 }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: 1,
              y: 0,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-[20px] 
            flex items-center justify-center 
            bg-white text-purple-700 text-[10px] font-bold 
            rounded-full shadow-md"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>

    </div>
  );
}


/* 🧩 MENU ITEM */
function MenuItem({ icon, label, onClick, active }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer transition
        ${
          active
            ? "bg-purple-600 text-white shadow-lg"
            : "bg-white/90 backdrop-blur-md shadow-xl border border-white/40"
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.div>
  );
}