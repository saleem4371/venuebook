"use client";

import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// ---------------- COUNTRY CONFIG ----------------
const countryConfig = {
  india: {
    name: "India",
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    bounds: { north: 35.5, south: 6.5, west: 68, east: 97.5 },
  },
  dubai: {
    name: "Dubai",
    center: { lat: 25.2048, lng: 55.2708 },
    zoom: 11,
    bounds: { north: 25.5, south: 24.8, west: 54.8, east: 55.6 },
  },
  saudi: {
    name: "Saudi Arabia",
    center: { lat: 23.8859, lng: 45.0792 },
    zoom: 5,
    bounds: { north: 32.0, south: 16.0, west: 34.0, east: 56.0 },
  },
  london: {
    name: "London",
    center: { lat: 51.5074, lng: -0.1278 },
    zoom: 10,
    bounds: { north: 51.7, south: 51.3, west: -0.5, east: 0.3 },
  },
  usa: {
    name: "USA",
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
    bounds: { north: 49, south: 24, west: -125, east: -66 },
  },
  france: {
    name: "France",
    center: { lat: 46.2276, lng: 2.2137 },
    zoom: 5,
    bounds: { north: 51, south: 41, west: -5, east: 9 },
  },
};

// ---------------- SKELETON ----------------
const MapSkeleton = () => (
  <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
    <div className="text-gray-500 text-sm">Loading Map...</div>
  </div>
);

// ---------------- MAPVIEW COMPONENT ----------------
export default function MapView({ venues = [], hoverVenue = null, country = "india" }) {
  const [selected, setSelected] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef(null);

  // ---------------- SAFE COUNTRY KEY ----------------
  const countryKey = String(country || "india").toLowerCase();
  const selectedCountryConfig = countryConfig[countryKey] || countryConfig["india"];

  // ---------------- GOOGLE MAPS LOADER ----------------
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  // ---------------- RESPONSIVE ----------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------------- PAN TO COUNTRY ----------------
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(selectedCountryConfig.center);
      mapRef.current.setZoom(selectedCountryConfig.zoom);
    }
  }, [selectedCountryConfig]);

  if (!isLoaded) return <MapSkeleton />;

  // ---------------- IMAGE SLIDER ----------------
  const prevImage = (images) =>
    setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  const nextImage = (images) =>
    setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedCountryConfig.center}
      zoom={selectedCountryConfig.zoom}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: "greedy",
        zoomControl: true,
        restriction: {
          latLngBounds: selectedCountryConfig.bounds,
          strictBounds: true,
        },
      }}
    >
      {/* MARKERS */}
      <MarkerClusterer>
        {(clusterer) =>
          venues.map((venue) => (
            <Marker
              key={venue.id}
              position={{ lat: venue.lat, lng: venue.lng }}
              clusterer={clusterer}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="28">
                      <rect rx="19" ry="19" width="70" height="28" fill="#8368ef"/>
                      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
                        font-family="Arial" font-size="12" fill="#fff" font-weight="bold">
                        ${venue.price}
                      </text>
                    </svg>
                  `),
                scaledSize: new window.google.maps.Size(60, 30),
              }}
              onClick={() => {
                setSelected(venue);
                setCurrentImage(0);
              }}
            />
          ))
        }
      </MarkerClusterer>

      {/* DESKTOP OVERLAY */}
      {selected && !isMobile && (
        <OverlayView
          position={{ lat: selected.lat, lng: selected.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <DesktopOverlay
            venue={selected}
            currentImage={currentImage}
            prevImage={prevImage}
            nextImage={nextImage}
            onClose={() => setSelected(null)}
          />
        </OverlayView>
      )}

      {/* MOBILE OVERLAY */}
      {selected && isMobile && (
        <MobileOverlay
          venue={selected}
          currentImage={currentImage}
          prevImage={prevImage}
          nextImage={nextImage}
          onClose={() => setSelected(null)}
        />
      )}
    </GoogleMap>
  );
}

// ---------------- OVERLAY COMPONENTS ----------------
const DesktopOverlay = ({ venue, currentImage, prevImage, nextImage, onClose }) => (
  <div className="relative transform -translate-x-1/2 -translate-y-[120%] z-50">
    <OverlayContent
      venue={venue}
      currentImage={currentImage}
      prevImage={prevImage}
      nextImage={nextImage}
      onClose={onClose}
    />
  </div>
);

const MobileOverlay = ({ venue, currentImage, prevImage, nextImage, onClose }) => (
  <div className="fixed bottom-0 left-0 w-full z-50">
    <OverlayContent
      venue={venue}
      currentImage={currentImage}
      prevImage={prevImage}
      nextImage={nextImage}
      onClose={onClose}
    />
  </div>
);

const OverlayContent = ({ venue, currentImage, prevImage, nextImage, onClose }) => (
  <div className="w-full md:w-[300px] bg-white rounded-t-2xl shadow-2xl overflow-hidden">
    {/* IMAGE SLIDER */}
    <div className="relative h-44 w-full">
      <img
        src={venue.images?.[currentImage] || venue.image || "/placeholder.jpg"}
        className="h-44 w-full object-cover"
      />

      {venue.images?.length > 1 && (
        <>
          <button
            onClick={() => prevImage(venue.images)}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full shadow hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => nextImage(venue.images)}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full shadow hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

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

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 bg-white rounded-full p-1 shadow"
      >
        <X size={14} />
      </button>
    </div>

    {/* DETAILS */}
    <div className="p-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">{venue.name}</h3>
        <span className="text-xs">⭐ {venue.rating}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">15–20 Mar</p>
      <p className="text-xs text-gray-500">Free cancellation</p>
    </div>
  </div>
);
