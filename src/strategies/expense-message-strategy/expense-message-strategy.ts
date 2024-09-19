import { ExpenseMessage, ExpenseMessageType, IExpenseDto } from "@splitsies/shared-models";
import { IExpenseMessageStrategy } from "./expense-message-strategy.i";
import { injectable } from "inversify";
import { lazyInject } from "../../utils/lazy-inject";
import { IExpenseMapper } from "../../mappers/expense-mapper-interface";

@injectable()
export class ExpenseMessageStrategy implements IExpenseMessageStrategy {
    private readonly _mapper = lazyInject<IExpenseMapper>(IExpenseMapper);

    async process(message: ExpenseMessage, current: IExpenseDto): Promise<IExpenseDto> {
        switch (message.type) {
            case ExpenseMessageType.ExpenseDto:
                return this.processExpenseDto(message, current);
            case ExpenseMessageType.ItemSelection:
                return this.processItemSelection(message, current);
            case ExpenseMessageType.ItemDetails:
                return this.processItemDetails(message, current);
            default:
                return current;
        }
    }

    private processExpenseDto(message: ExpenseMessage, current: IExpenseDto): IExpenseDto {
        return message.expenseDto ?? current;
    }

    private async processItemSelection(message: ExpenseMessage, current: IExpenseDto): Promise<IExpenseDto> {
        if (!message.itemSelectionUpdate) return current;

        const item = [...current.items, ...current.children.flatMap((c) => c.items)].find(
            (i) => i.id === message.itemSelectionUpdate!.itemId,
        );

        const expense = await this._mapper.toDomain(current);
        const user = expense.users.find((u) => u.id === message.itemSelectionUpdate!.userId);
        if (!item || !user) return current;

        const userIndex = item.owners.findIndex((u) => u.id === user.id);
        if (message.itemSelectionUpdate.selected && userIndex === -1) {
            item.owners.push(user);
        } else if (!message.itemSelectionUpdate.selected && userIndex !== -1) {
            item.owners.splice(userIndex, 1);
        }

        if (current.id === message.itemSelectionUpdate.expenseId) {
            const itemIndex = current.items.findIndex((i) => i.id === item.id);
            if (itemIndex === -1) return current;

            current.items.splice(itemIndex, 1, item);
            return { ...current };
        }

        const childIndex = current.children.findIndex((c) => c.id === message.itemSelectionUpdate?.expenseId);
        if (childIndex === -1) return current;

        const itemIndex = current.children[childIndex].items.findIndex((i) => i.id === item.id);
        if (itemIndex === -1) return current;

        current.children[childIndex].items.splice(itemIndex, 1, item);
        return { ...current };
    }

    private processItemDetails(message: ExpenseMessage, current: IExpenseDto): IExpenseDto {
        if (!message.itemDetailsUpdate) return current;

        if (current.id === message.itemDetailsUpdate.expenseId) {
            const itemIndex = current.items.findIndex((i) => i.id === message.itemDetailsUpdate?.item.id);
            if (itemIndex === -1) return current;

            const mergedItem = { ...message.itemDetailsUpdate.item, owners: current.items[itemIndex].owners };
            current.items.splice(itemIndex, 1, mergedItem);
            return { ...current };
        }

        const childIndex = current.children.findIndex((c) => c.id === message.itemDetailsUpdate!.expenseId);
        if (childIndex === -1) return current;

        const itemIndex = current.children[childIndex].items.findIndex(
            (i) => i.id === message.itemDetailsUpdate?.item.id,
        );
        if (itemIndex === -1) return current;

        const mergedItem = {
            ...message.itemDetailsUpdate.item,
            owners: current.children[childIndex].items[itemIndex].owners,
        };

        current.children[childIndex].items.splice(itemIndex, 1, mergedItem);
        return { ...current };
    }
}
