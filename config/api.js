const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,

  AUTH: {
    LOGIN: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    REGISTER: `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
  },
};

export default API;
