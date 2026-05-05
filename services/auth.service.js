import api from "@/lib/axios";

/* LOGIN */
export const loginApi = async (data) => {
  return api.post("/auth/login", data);
};

/* REGISTER */
export const registerApi = async (data) => {
  return api.post("/auth/register", data);
};

/* SEND OTP */
export const sendOtpApi = async (phone) => {
  return api.post("/auth/send-otp", { phone });
};

/* VERIFY OTP */
export const verifyOtpApi = async (data) => {
  return api.post("/auth/verify-otp", data);
};

/* VERIFY OTP */
export const forgotPasswordApi = async (data) => {
  return api.post("/auth/forgot_password", data);
};

export const resetPasswordApi = async (data) => {
  return api.post("/auth/update_password", data);
};

/* SOCIAL LOGIN (Google/Facebook placeholder) */
export const socialLoginApi = async (provider, token) => {
  return api.post(`/auth/social-login`, { provider, token });
};

export const getUserApi = () => {
  return api.get("/auth/me"); // token auto added
};