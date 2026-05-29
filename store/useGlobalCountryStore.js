import { create } from "zustand";

const useGlobalCountryStore = create((set) => ({
  // 🌍 selected country
  selectedCountry: null,

  setSelectedCountry: (country) =>
    set({
      selectedCountry: country,
    }),

  // 🔥 global trigger to refetch APIs when country changes
  countryChangeTrigger: 0,

  triggerCountryChange: () =>
    set((state) => ({
      countryChangeTrigger: state.countryChangeTrigger + 1,
    })),
}));

export default useGlobalCountryStore;