import { Observable } from "rxjs";

export interface IHomeViewModel {
    readonly pendingData: boolean;
    readonly pendingData$: Observable<boolean>;
    setPendingData(value: boolean): void;
}

export const IHomeViewModel = Symbol.for("IHomeViewModel");