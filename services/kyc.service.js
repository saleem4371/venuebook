
import api from "@/lib/axios";


export const SubmitKYC = async (data) => {
  return api.post("/kyc/submit", data);
};

export const kyc_status = () => {
  return api.get("/kyc/kyc_status");
};

export const each_kyc_status = () => {
  return api.get("/kyc/each_kyc_status");
};
