import { CreateUserRequest, IExpenseUserDetails, IUserCredential, IUserDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IBaseManager } from "../base-manager-interface";
import { ICreateUserResult } from "../../models/create-user-result/create-user-result-interface";

export interface IUserManager extends IBaseManager {
    readonly contactUsers$: Observable<IExpenseUserDetails[]>;
    readonly user$: Observable<IUserCredential | null>;
    readonly signoutRequested$: Observable<void>;
    readonly user: IUserCredential | null;
    readonly userId: string;
    readonly expenseUserDetails: IExpenseUserDetails;
    signOut(): Promise<void>;
    requestCreateUser(user: CreateUserRequest): Promise<ICreateUserResult>;
    requestAuthenticate(username: string, password: string): Promise<boolean>;
    requestUsersByIds(ids: string[]): Promise<IExpenseUserDetails[]>;
    requestAddGuestUser(givenName: string, familyName: string, phoneNumber: string): Promise<IUserDto>;
    requestUsersFromContacts(): Promise<void>;
    requestFindUsers(search: string, reset: boolean): Promise<IExpenseUserDetails[]>;
    deleteUser(): Promise<void>;
}

export const IUserManager = Symbol.for("IUserManager");
