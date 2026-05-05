export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhone = (phone) => {
  return phone && phone.length === 10;
};

export const validateOtp = (otp) => {
  return typeof otp === "string" && otp.length === 6;
};