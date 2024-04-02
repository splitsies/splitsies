import { IExpenseUserDetails } from "@splitsies/shared-models";
import { LRUCache } from "../lru-cache/lru-cache";
import { IUserCache } from "./user-cache-interface";
import { injectable } from "inversify";

interface UserPhoneNumberIndexed {
    id: string;
    user: IExpenseUserDetails;
}

@injectable()
export class UserCache extends LRUCache<IExpenseUserDetails> implements IUserCache {
    private readonly _phoneNumberIndex = new LRUCache<UserPhoneNumberIndexed>();

    hasPhoneNumber(phoneNumber: string): boolean {
        return this._phoneNumberIndex.has(phoneNumber);
    }

    getByPhoneNumber(phoneNumber: string): IExpenseUserDetails | undefined {
        return this._phoneNumberIndex.get(phoneNumber)?.user;
    }

    addByPhoneNumber(user: IExpenseUserDetails): void {
        if (!user?.phoneNumber) return;

        const indexed = { id: user.phoneNumber, user };
        this._phoneNumberIndex.add(indexed);
    }
}
