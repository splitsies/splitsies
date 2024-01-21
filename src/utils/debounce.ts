export const debounce = (callback: (...args: any[]) => any, debounceMs: number): ((...args: any[]) => any) => {
    let timer: NodeJS.Timeout;

    const debounced = (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), debounceMs);
    };

    return debounced;
};
