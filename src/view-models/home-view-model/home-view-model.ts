import { injectable } from "inversify";
import { IHomeViewModel } from "./home-view-model-interface";
import { BehaviorSubject, Observable } from "rxjs";

@injectable()
export class HomeViewModel implements IHomeViewModel {
    private readonly _pendingData$ = new BehaviorSubject<boolean>(false);

    get pendingData$(): Observable<boolean> {
        return this._pendingData$.asObservable();
    }
    get pendingData(): boolean {
        return this._pendingData$.value;
    }

    setPendingData(value: boolean): void {
        if (this._pendingData$.value === value) return;
        this._pendingData$.next(value);
    }
}