import { CreateUserRequest, IExpenseUserDetails, IUserCredential, IUserDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IBaseManager } from "../base-manager-interface";

export interface IUserManager extends IBaseManager {
    readonly contactUsers$: Observable<IExpenseUserDetails[]>;
    readonly user$: Observable<IUserCredential | null>;
    readonly user: IUserCredential | null;
    readonly userId: string;
    readonly expenseUserDetails: IExpenseUserDetails;
    signOut(): Promise<void>;
    requestCreateUser(user: CreateUserRequest): Promise<boolean>;
    requestAuthenticate(username: string, password: string): Promise<boolean>;
    requestUsersByIds(ids: string[]): Promise<IUserDto[]>;
    requestAddGuestUser(givenName: string, familyName: string, phoneNumber: string): Promise<IUserDto>;
    requestUsersFromContacts(): Promise<void>;
}

export const IUserManager = Symbol.for("IUserManager");
