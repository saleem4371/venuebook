import { create } from "zustand";

import {
  getEvents,
  getProperty,
} from "@/services/global.service";

const useGlobalStore = create(
  (set, get) => ({

    events: [],

    properties: [],

    loaded: false,

    // ============================================
    // LOAD ALL MASTER DATA
    // ============================================

    loadGlobalData: async () => {

      // already loaded
      if (get().loaded) return;

      try {

        const [
          eventRes,
          propertyRes,
        ] = await Promise.all([
          getEvents(),
          getProperty(1),
        ]);

        set({

          events:
            eventRes.data.map(
              (item) => ({
                id: item.id,
                name:
                  item.event_name,
              }),
            ),

          properties:
            propertyRes.data.data.map(
              (item) => ({
                id: item.id,
                name: item.name,
              }),
            ),

          loaded: true,
        });

      } catch (error) {

        console.log(error);
      }
    },
  }),
);

export default useGlobalStore;