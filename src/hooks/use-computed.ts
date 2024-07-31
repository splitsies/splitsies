import { DependencyList, useEffect, useState } from "react";

export const useComputed = <T>(compute: (dependencies: DependencyList) => T, deps: DependencyList) => {
    const [value, setValue] = useState<T>(compute(deps));

    useEffect(() => {
        setValue(compute(deps));
    }, deps);

    return value;
};
