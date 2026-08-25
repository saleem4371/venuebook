import api from "@/lib/axios";

/* LOGIN */
export const loadProfileApi = async () => {
  return api.get("/account/loadProfileApi");
};

export const updateProfile = async (data) => {
  return api.post("/account/updateProfile", data);
};

export const rewardsApi = async () => {
  return api.get("/account/rewardsApi");
};


export const sendEmailVerification = async (data) => {
  return api.post("/account/send-email-verification", {
    value:data,
    type:'email'
  });
};



export const verifyEmailOtp = ({
  email,
  otp,
}) =>
  api.post("/account/verify", {
   
     value:email,
    otp:otp,
    type:'email'
  });

export const sendPhoneVerification = (phone) =>
  api.post("/account/send-email-verification", {
    value:phone,
    type:'phone'
  });

export const verifyPhoneOtp = ({
  phone,
  otp,
}) =>
  api.post("/account/verify", {
    value:phone,
    otp:otp,
    type:'phone'
  });