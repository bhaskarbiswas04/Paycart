const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatCurrency = (pricePaise) => {
  return currencyFormatter.format(pricePaise / 100);
};
