import {
    CreateUserRequest,
    IDataResponse,
    IExpenseUserDetails,
    IUserCredential,
    IUserDto,
} from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IUsersApiClient {
    readonly user$: Observable<IUserCredential | null>;
    create(user: CreateUserRequest): Promise<void>;
    authenticate(username: string, password: string): Promise<void>;
    signOut(): void;
    requestFindUsersByPhoneNumber(phoneNumbers: string[]): Promise<IUserDto[]>;
    requestUsersByIds(ids: string[]): Promise<IUserDto[]>;
    requestAddGuestUser(givenName: string, familyName: string, phoneNumber: string): Promise<IUserDto>;
    requestFindUsers(search: string, reset: boolean): Promise<IExpenseUserDetails[]>;
}

export const IUsersApiClient = Symbol.for("IUsersApiClient");
