/**
 * mockData.js
 * ─────────────────────────────────────────────────────────────────
 * LOCALHOST-ONLY MOCK DATA for Package Management Module
 *
 * DO NOT use in production. Replace with real API responses.
 * All prices stored in INR as per project convention.
 * ─────────────────────────────────────────────────────────────────
 */

export const MOCK_CATEGORIES = [
  {
    id: 1,
    item_category: "Starters",
    cat_publish: 1,
    cat_icon: null,
    count_number: 0,
    package_item: [
      { id: 101, item_name: "Paneer Tikka",        item_price: 350, food_pre: 1, image: null, selected: false },
      { id: 102, item_name: "Veg Spring Rolls",    item_price: 280, food_pre: 1, image: null, selected: false },
      { id: 103, item_name: "Chicken Tikka",       item_price: 420, food_pre: 2, image: null, selected: false },
      { id: 104, item_name: "Fish Fingers",        item_price: 480, food_pre: 2, image: null, selected: false },
      { id: 105, item_name: "Bruschetta",          item_price: 320, food_pre: 1, image: null, selected: false },
      { id: 106, item_name: "Crispy Corn",         item_price: 260, food_pre: 1, image: null, selected: false },
    ],
  },
  {
    id: 2,
    item_category: "Main Course",
    cat_publish: 1,
    cat_icon: null,
    count_number: 0,
    package_item: [
      { id: 201, item_name: "Dal Makhani",            item_price: 450, food_pre: 1, image: null, selected: false },
      { id: 202, item_name: "Paneer Butter Masala",   item_price: 480, food_pre: 1, image: null, selected: false },
      { id: 203, item_name: "Chicken Biryani",        item_price: 550, food_pre: 2, image: null, selected: false },
      { id: 204, item_name: "Mutton Rogan Josh",      item_price: 650, food_pre: 2, image: null, selected: false },
      { id: 205, item_name: "Veg Biryani",            item_price: 400, food_pre: 1, image: null, selected: false },
      { id: 206, item_name: "Fish Curry",             item_price: 580, food_pre: 2, image: null, selected: false },
    ],
  },
  {
    id: 3,
    item_category: "Breads & Rice",
    cat_publish: 1,
    cat_icon: null,
    count_number: 0,
    package_item: [
      { id: 301, item_name: "Butter Naan",    item_price: 60,  food_pre: 1, image: null, selected: false },
      { id: 302, item_name: "Garlic Naan",    item_price: 80,  food_pre: 1, image: null, selected: false },
      { id: 303, item_name: "Steamed Rice",   item_price: 120, food_pre: 1, image: null, selected: false },
      { id: 304, item_name: "Jeera Rice",     item_price: 160, food_pre: 1, image: null, selected: false },
    ],
  },
  {
    id: 4,
    item_category: "Desserts",
    cat_publish: 1,
    cat_icon: null,
    count_number: 0,
    package_item: [
      { id: 401, item_name: "Gulab Jamun",       item_price: 180, food_pre: 1, image: null, selected: false },
      { id: 402, item_name: "Ras Malai",         item_price: 220, food_pre: 1, image: null, selected: false },
      { id: 403, item_name: "Ice Cream Sundae",  item_price: 160, food_pre: 1, image: null, selected: false },
      { id: 404, item_name: "Chocolate Mousse",  item_price: 280, food_pre: 1, image: null, selected: false },
    ],
  },
  {
    id: 5,
    item_category: "Beverages",
    cat_publish: 1,
    cat_icon: null,
    count_number: 0,
    package_item: [
      { id: 501, item_name: "Masala Chai",      item_price: 80,  food_pre: 1, image: null, selected: false },
      { id: 502, item_name: "Fresh Lime Soda",  item_price: 120, food_pre: 1, image: null, selected: false },
      { id: 503, item_name: "Mango Lassi",      item_price: 150, food_pre: 1, image: null, selected: false },
      { id: 504, item_name: "Cold Coffee",      item_price: 180, food_pre: 1, image: null, selected: false },
    ],
  },
  {
    id: 6,
    item_category: "Live Stations",
    cat_publish: 0,
    cat_icon: null,
    count_number: 0,
    package_item: [
      { id: 601, item_name: "Dosa Counter",  item_price: 800, food_pre: 1, image: null, selected: false },
      { id: 602, item_name: "Chaat Counter", item_price: 700, food_pre: 1, image: null, selected: false },
      { id: 603, item_name: "Pasta Counter", item_price: 750, food_pre: 1, image: null, selected: false },
    ],
  },
];

export const MOCK_PACKAGES = [
  {
    id: 1,
    name: "Silver Package",
    price: 1200,
    package_type: 1,      // adult
    package_food_type: 0, // both
    package_status: 1,
    package_items:   JSON.stringify([101, 201, 301, 401, 501]),
    category_items:  JSON.stringify([1, 1, 1, 1, 1, 0]),
  },
  {
    id: 2,
    name: "Gold Package",
    price: 1800,
    package_type: 1,      // adult
    package_food_type: 1, // veg
    package_status: 1,
    package_items:   JSON.stringify([101, 102, 201, 202, 301, 302, 401, 501, 502]),
    category_items:  JSON.stringify([2, 2, 2, 1, 2, 0]),
  },
  {
    id: 3,
    name: "Kids Special",
    price: 750,
    package_type: 2,      // child
    package_food_type: 1, // veg
    package_status: 1,
    package_items:   JSON.stringify([101, 205, 303, 403, 502]),
    category_items:  JSON.stringify([1, 1, 1, 1, 1, 0]),
  },
  {
    id: 4,
    name: "Premium Non-Veg",
    price: 2400,
    package_type: 1,      // adult
    package_food_type: 2, // non-veg
    package_status: 0,
    package_items:   JSON.stringify([103, 104, 203, 204, 302, 402, 503]),
    category_items:  JSON.stringify([2, 2, 1, 1, 1, 0]),
  },
];

export const MOCK_ADDONS = [];

export const MOCK_PATH_URL = "";

/** Auto-incrementing ID generator for mock creates */
export function nextId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
