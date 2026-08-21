export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhone = (phone = "") => {
  const cleanedPhone = String(phone).replace(/\D/g, "");

  // Accept +91XXXXXXXXXX or XXXXXXXXXX
  const number = cleanedPhone.startsWith("91")
    ? cleanedPhone.slice(2)
    : cleanedPhone;

  return /^[6-9]\d{9}$/.test(number);
};

export const validateOtp = (otp) => {
  return typeof otp === "string" && otp.length === 6;
};
