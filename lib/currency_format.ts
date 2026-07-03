
import { format } from "date-fns";

export const formatPrice = (amount: number | string) => {
  if (typeof window === "undefined") {
    return amount;
  }

  const countryData = localStorage.getItem("country");

  let currencyIcon = "₹";

  if (countryData) {
    const country = JSON.parse(countryData);
    currencyIcon = country?.curreny_icon || "₹";
  }

  return `${currencyIcon}${Number(amount || 0).toLocaleString("en-IN")}`;
};


export const getCountry = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("country") || "null");
  } catch {
    return null;
  }
};

export const currency_icon = () => {
  return getCountry()?.curreny_icon ?? "₹";
};


export const exchange_convert = (
  price: number,
  fromRate: number,
  toRate: number
): number => {
  const usd = price / fromRate;
  return +(usd * toRate).toFixed(2);
};




export const formatDate = ( date: string | Date, dateFormat = "dd MMM yyyy") => {
  // return format(new Date(date), dateFormat);
  return date;
};