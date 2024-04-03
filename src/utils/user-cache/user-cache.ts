import { IExpenseUserDetails } from "@splitsies/shared-models";
import { LRUCache } from "../lru-cache/lru-cache";
import { IUserCache } from "./user-cache-interface";
import { injectable } from "inversify";

@injectable()
export class UserCache extends LRUCache<IExpenseUserDetails> implements IUserCache {
    private readonly _phoneNumberIndex = new Map<string, string>();

    override add(user: IExpenseUserDetails): void {
        super.add(user);
        this.addByPhoneNumber(user);
    }

    hasPhoneNumber(phoneNumber: string): boolean {
        return this._phoneNumberIndex.has(phoneNumber);
    }

    getByPhoneNumber(phoneNumber: string): IExpenseUserDetails | undefined {
        const id = this._phoneNumberIndex.get(phoneNumber);
        if (id === undefined) return undefined;

        return this.get(id);
    }

    addByPhoneNumber(user: IExpenseUserDetails): void {
        if (!user?.phoneNumber) return;
        this._phoneNumberIndex.set(user.phoneNumber, user.id);
    }
}
