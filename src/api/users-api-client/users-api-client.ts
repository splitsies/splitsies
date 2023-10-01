import { injectable } from "inversify";
import { IUsersApiClient } from "./users-api-client-interface";
import { CreateUserRequest, IUserCredential } from "@splitsies/shared-models";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { ClientBase } from "../client-base";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { lazyInject } from "../../utils/lazy-inject";

@injectable()
export class UsersApiClient extends ClientBase implements IUsersApiClient {
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _user$ = new BehaviorSubject<IUserCredential | null>(null);

    constructor() {
        super();
    }

    get user$(): Observable<IUserCredential | null> {
        return this._user$.asObservable();
    }

    signOut(): void {
        this._user$.next(null);
    }

    async authenticate(username: string, password: string): Promise<void> {
        const url = `${this._config.users}/auth`;

        try {
            const result = await this.postJson<IUserCredential>(url, { username, password });

            if (!result.success) {
                throw new Error();
            }

            this._user$.next(result.data);
        } catch (ex) {
            console.error(ex);
            this._user$.next(null);
            throw new Error("Unable to authorize user"); // need to go back to login screen at this point
        }
    }

    async create(user: CreateUserRequest): Promise<void> {
        try {
            const result = await this.postJson<IUserCredential>(this._config.users, user);
            if (!result.success) {
                throw new Error();
            }

            this._user$.next(result.data);
        } catch {
            throw new Error("Unable to authorize user");
        }
    }
}
