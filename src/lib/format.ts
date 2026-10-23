export const formatCount = (n: number) => Math.round(n).toLocaleString("en-US");

// U+2009 thin space: the Kazakh way to group tenge, and it never wraps a number apart.
export const formatMoney = (amount: number, currency: string) =>
  currency + Math.round(amount).toLocaleString("en-US").replaceAll(",", " ");
