import { IExpenseDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IExpense } from "../../models/expense/expense-interface";

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

    selectedChild$: Observable<IExpense | undefined>;
    setSelectedChild(expense: IExpense | undefined): void;
}

export const IExpenseViewModel = Symbol.for("IExpenseViewModel");
