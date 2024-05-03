import { Observable } from "rxjs";

export interface IHomeViewModel {
    readonly pendingData: boolean;
    readonly pendingData$: Observable<boolean>;
    setPendingData(value: boolean): void;

    readonly requestFilter: string;
    readonly requestFilter$: Observable<string>;
    setRequestFilter(value: string): void;
}

export const IHomeViewModel = Symbol.for("IHomeViewModel");
