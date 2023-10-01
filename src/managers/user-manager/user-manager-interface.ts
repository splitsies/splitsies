import { IUserCredential, IUserDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IBaseManager } from "../base-manager-interface";

export interface IUserManager extends IBaseManager {
    readonly user$: Observable<IUserCredential | null>;
    readonly user: IUserCredential | null;
    signOut(): Promise<void>;
    requestCreateUser(user: CreateUserRequest): Promise<boolean>;
    requestAuthenticate(username: string, password: string): Promise<boolean>;
}

export const IUserManager = Symbol.for("IUserManager");
