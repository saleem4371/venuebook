import api from "@/lib/axios";

export const comapre_availability = (data) => {
  return api.post("/compare/availability",data); 
};

