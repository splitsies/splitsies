import { injectable } from "inversify";
import { IHomeViewModel } from "./home-view-model-interface";
import { BehaviorSubject, Observable, filter } from "rxjs";
import { lazyInject } from "../../utils/lazy-inject";
import { IMessageHub } from "../../hubs/message-hub/message-hub-interface";
import { NotificationType } from "../../types/notification-type";
import { IExpenseManager } from "../../managers/expense-manager/expense-manager-interface";

@injectable()
export class HomeViewModel implements IHomeViewModel {
    private readonly _messageHub = lazyInject<IMessageHub>(IMessageHub);
    private readonly _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

    private readonly _pendingData$ = new BehaviorSubject<boolean>(false);
    private readonly _requestFilter$ = new BehaviorSubject<string>("");

    constructor() {
        this._messageHub.notificationOpened$
            .pipe(filter((message) => message.type === NotificationType.JoinRequest))
            .subscribe({
                next: (message) => {
                    if (!message.data?.expenseId) return;
                    void this._expenseManager.requestExpenseJoinRequests();
                    this.setRequestFilter(message.data.expenseId as string);
                },
            });
    }

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

    get requestFilter$(): Observable<string> {
        return this._requestFilter$.asObservable();
    }
    get requestFilter(): string {
        return this._requestFilter$.value;
    }
    setRequestFilter(value: string) {
        this._requestFilter$.next(value);
    }
}
