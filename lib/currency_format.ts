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