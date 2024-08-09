import { DependencyList, useEffect, useState } from "react";

export const useComputed = <T, U extends DependencyList>(compute: (dependencies: U) => T, deps: U) => {
    const [value, setValue] = useState<T>(compute(deps));

    useEffect(() => {
        setValue(compute(deps));
    }, deps);

    return value;
};
