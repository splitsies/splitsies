import {
    CreateUserRequest,
    IDataResponse,
    IExpenseUserDetails,
    IUserCredential,
    IUserDto,
} from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { ICreateUserResult } from "../../models/create-user-result/create-user-result-interface";

export interface IUsersApiClient {
    readonly user$: Observable<IUserCredential | null>;
    create(user: CreateUserRequest): Promise<ICreateUserResult>;
    authenticate(username: string, password: string): Promise<void>;
    signOut(): void;
    requestFindUsersByPhoneNumber(phoneNumbers: string[]): Promise<IExpenseUserDetails[]>;
    requestUsersByIds(ids: string[]): Promise<IExpenseUserDetails[]>;
    requestAddGuestUser(givenName: string, familyName: string, phoneNumber: string): Promise<IUserDto>;
    requestFindUsers(search: string, reset: boolean): Promise<IExpenseUserDetails[]>;
    deleteUser(): Promise<void>;
}

export const IUsersApiClient = Symbol.for("IUsersApiClient");
