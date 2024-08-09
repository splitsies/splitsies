export const format = (price: number): string => {
    const isNegative = price < 0;
    return `${isNegative ? "-" : ""}$${Math.abs(price).toFixed(2)}`;
};
