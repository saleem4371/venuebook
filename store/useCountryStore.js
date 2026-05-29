import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCountryStore = create(
  persist(
    (set) => ({

      selectedCountry: {
        code: "IN",
        name: "India",
        currency: "INR",
        locale: "en-IN",
        flag: "/flags/in.svg",
      },

      setCountry: (country) =>
        set({
          selectedCountry: country,
        }),

    }),
    {
      name: "selected-country",
    }
  )
);

export default useCountryStore;