import { useEffect, useRef, useState } from "react";
import { Observable } from "rxjs";
import { useInitialize } from "./use-initialize";

export const useObservableReducer = <T, U>(observable: Observable<T>, initialValue: U, reducer: (value: T) => U, dependencies: React.DependencyList): U => {
    const original = useRef<T>();
    const [value, setValue] = useState<U>(initialValue);

    useInitialize(() => {
        const subscription = observable.subscribe({
            next: (data) => {
                original.current = data;
                setValue(reducer(data));
            }
        });

        return () => subscription.unsubscribe();
    });

    if (!dependencies) return value;

    useEffect(() => {
        if (original.current === undefined) return;
        setValue(reducer(original.current));
    }, dependencies)

    return value;
};
