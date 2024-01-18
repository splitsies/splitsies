export const formatPhoneNumber = (number: string): string => number.replace(/\D/g, "").slice(-10);
