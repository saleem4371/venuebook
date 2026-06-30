import api from "@/lib/axios";

export const startConversation = (data) => {
  return api.post("/chat/startConversation",data);
};
export const conservation_messages = (data) => {
  return api.get(`/chat/messages/${data}`,);
};
export const send_messages = (data) => {
  return api.post(`/chat/send_messages`,data);
};

export const all_messages = (data) => {
  return api.get(`/chat/all_messages`,data);
};
