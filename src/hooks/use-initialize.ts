import { useEffect } from "react";

export const useInitialize = (onConnect: React.EffectCallback): void => {
    useEffect(onConnect, []);
};
