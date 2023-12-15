import { IExpense } from "@splitsies/shared-models";

export interface IPriceCalculator {
    calculatePersonalExpense(userId: string, expense: IExpense): IExpense;
}
export const IPriceCalculator = Symbol.for("IPriceCalculator");
