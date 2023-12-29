import { useState } from "react";
import { Observable } from "rxjs";
import { useInitialize } from "./use-initialize";

export const useObservableReducer = <T, U>(observable: Observable<T>, initialValue: U, reducer: (value: T) => U): U => {
    const [value, setValue] = useState<U>(initialValue);

    useInitialize(() => {
        const subscription = observable.subscribe({
            next: (data) => setValue(reducer(data)),
        });

        return () => subscription.unsubscribe();
    });

    return value;
};
