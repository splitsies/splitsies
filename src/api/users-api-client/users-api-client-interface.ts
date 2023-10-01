import { CreateUserRequest, IDataResponse, IUserCredential, IUserDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IUsersApiClient {
    readonly user$: Observable<IUserCredential | null>;
    create(user: CreateUserRequest): Promise<void>;
    authenticate(username: string, password: string): Promise<void>;
    signOut(): void;
}

export const IUsersApiClient = Symbol.for("IUsersApiClient");
