import { useState } from "react";
import { Observable } from "rxjs";
import { useInitialize } from "./use-initialize";

export const useObservable = <T>(
    observable: Observable<T>,
    initialValue: T,
    sideEffect: (updated: T) => void = () => {},
): T => {
    const [value, setValue] = useState<T>(initialValue);

    useInitialize(() => {
        const subscription = observable.subscribe({
            next: (data) => {
                if (Array.isArray(data)) {
                    setValue(Array.from(data) as T);
                } else {
                    setValue(data);
                }
                sideEffect(data);
            },
        });

        return () => subscription.unsubscribe();
    });

    return value;
};
