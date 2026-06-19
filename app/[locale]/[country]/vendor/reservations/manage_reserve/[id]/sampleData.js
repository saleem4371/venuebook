export const bookingData = {
  bookingId: "V000032-5732",

  venue: "The Azure Pavilion",

  eventDate: "19 Sep 2026",

  customer: {
    name: "Kenneth",
    email: "kenneth@gmail.com",
    phone: "7411355781",
    address: "Mangalore Karnataka",
  },

  event: {
    name: "Shareholders Meeting",
    type: "Corporate",
    shift: "Afternoon",
    capacity: "100 Guests",
    from: "12:00 PM",
    to: "06:00 PM",
  },

  package: {
    MainCourse: [
      "Chicken Alfredo",
      "Ribeye Steak",
    ],
    Salads: ["Greek Salad"],
    Sides: ["Truffle Fries"],
    Desserts: ["Brownie"],
    Beverages: ["Iced Tea"],
  },

  payment: {},

  receipts: [
    {
      id: 1,
      date: "20 Apr 2026",
      type: "Base Price",
      amount: "₹5,550",
    },
  ],

  activities: [
    {
      id: 1,
      title: "Payment Received",
      date: "20 Apr 2026",
    },
    {
      id: 2,
      title: "Invoice Generated",
      date: "20 Apr 2026",
    },
  ],
};