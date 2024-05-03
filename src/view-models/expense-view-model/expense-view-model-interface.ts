import { Observable } from "rxjs";

export interface IExpenseViewModel {
    resetState(): void;
    awaitingResponse$: Observable<boolean>;
    setAwaitingResponse(value: boolean): void;

    isEditingItems$: Observable<boolean>;
    setIsEditingItems(value: boolean): void;

    isSelectingItems$: Observable<boolean>;
    setIsSelectingItems(value: boolean): void;

    screen$: Observable<"Items" | "People" | "Contacts" | "Guests" | "Search">;
    setScreen(value: "Items" | "People" | "Contacts" | "Guests" | "Search"): void;

    onBackPress: () => void;
    searchVisible$: Observable<boolean>;
    setSearchVisible(visible: boolean): void;
}

export const IExpenseViewModel = Symbol.for("IExpenseViewModel");
