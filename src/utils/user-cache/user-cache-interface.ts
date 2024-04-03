import { IExpenseUserDetails } from "@splitsies/shared-models";
import { ILRUCache } from "../lru-cache/lru-cache-interface";

export interface IUserCache extends ILRUCache<IExpenseUserDetails> {
    hasPhoneNumber(phoneNumber: string): boolean;
    getByPhoneNumber(phoneNumber: string): IExpenseUserDetails | undefined;
    addByPhoneNumber(user: IExpenseUserDetails): void;
}
export const IUserCache = Symbol.for("IUserCache");
