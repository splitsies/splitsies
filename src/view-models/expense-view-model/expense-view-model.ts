import { injectable } from "inversify";
import { IExpenseViewModel } from "./expense-view-model-interface";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseDto } from "@splitsies/shared-models";
import { IExpense } from "../../models/expense/expense-interface";

@injectable()
export class ExpenseViewModel implements IExpenseViewModel {
    onBackPress = () => {};
    private readonly _awaitingResponse$ = new BehaviorSubject<boolean>(false);
    private readonly _isEditingItems$ = new BehaviorSubject<boolean>(false);
    private readonly _isSelectingItems = new BehaviorSubject<boolean>(false);
    private readonly _searchVisible$ = new BehaviorSubject<boolean>(false);
    private readonly _selectedChild$ = new BehaviorSubject<IExpense | undefined>(undefined);
    private readonly _screen$ = new BehaviorSubject<"Items" | "People" | "Contacts" | "Guests" | "Search">("Items");

    resetState(): void {
        this.onBackPress = () => {};
        this._awaitingResponse$.next(false);
        this._isEditingItems$.next(false);
        this._isSelectingItems.next(false);
        this._searchVisible$.next(false);
        this._screen$.next("Items");
    }

    get awaitingResponse$(): Observable<boolean> {
        return this._awaitingResponse$.asObservable();
    }
    setAwaitingResponse(value: boolean): void {
        this._awaitingResponse$.next(value);
    }

    get isEditingItems$(): Observable<boolean> {
        return this._isEditingItems$.asObservable();
    }
    setIsEditingItems(value: boolean): void {
        this._isEditingItems$.next(value);
    }

    get isSelectingItems$(): Observable<boolean> {
        return this._isSelectingItems.asObservable();
    }
    setIsSelectingItems(value: boolean): void {
        this._isSelectingItems.next(value);
    }

    get searchVisible$(): Observable<boolean> {
        return this._searchVisible$.asObservable();
    }
    setSearchVisible(visible: boolean): void {
        this._searchVisible$.next(visible);
    }

    get screen$(): Observable<"Items" | "People" | "Contacts" | "Guests" | "Search"> {
        return this._screen$.asObservable();
    }
    setScreen(value: "Items" | "People" | "Contacts" | "Guests" | "Search"): void {
        this._screen$.next(value);
        this._searchVisible$.next(["Contacts", "Guests", "Search"].includes(value));
    }
    get selectedChild$(): Observable<IExpense | undefined> {
        return this._selectedChild$.asObservable();
    }
    setSelectedChild(expense: IExpense | undefined) {
        this._selectedChild$.next(expense);
    }
}
