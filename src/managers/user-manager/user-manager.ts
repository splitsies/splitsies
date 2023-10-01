import { CreateUserRequest, IUserCredential } from "@splitsies/shared-models";
import { BehaviorSubject, Observable, first, lastValueFrom } from "rxjs";
import { IUserManager } from "./user-manager-interface";
import { injectable } from "inversify";
import { IUsersApiClient } from "../../api/users-api-client/users-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { resetGenericPassword, setGenericPassword, getGenericPassword, UserCredentials } from "react-native-keychain";

@injectable()
export class UserManager extends BaseManager implements IUserManager {
    private readonly _client = lazyInject<IUsersApiClient>(IUsersApiClient);
    private readonly _user$ = new BehaviorSubject<IUserCredential | null>(null);

    constructor() {
        super();
    }

    protected async initialize(): Promise<any> {
        this._client.user$.subscribe({
            next: (user) => this.onUserUpdated(user),
        });

        const userCreds = (await getGenericPassword()) as UserCredentials;
        if (!userCreds) {
            // TODO: login screen
        }

        const onInitialAuthResponse = lastValueFrom(this._client.user$.pipe(first((user) => !!user?.authToken)));

        if (!(await this.requestAuthenticate("kevchen21@gmail.com", "my-awesome-password"))) {
            // TODO: login screen if user is still null after initializing
            return Promise.resolve();
        }

        return onInitialAuthResponse;
    }

    get user(): IUserCredential | null {
        return this._user$.value;
    }

    get user$(): Observable<IUserCredential | null> {
        return this._user$.asObservable();
    }

    async requestCreateUser(user: CreateUserRequest): Promise<boolean> {
        try {
            await this._client.create(user);
            await setGenericPassword(user.email, user.password);
            return true;
        } catch {
            return false;
        }
    }

    async requestAuthenticate(username: string, password: string): Promise<boolean> {
        try {
            await this._client.authenticate(username, password);
            await setGenericPassword(username, password);
            return true;
        } catch {
            return false;
        }
    }

    async signOut(): Promise<void> {
        await resetGenericPassword();
        this._client.signOut();
    }

    private onUserUpdated(user: IUserCredential | null): void {
        this._user$.next(user);
        if (!user) return;

        // the token lasts for an hour, but try to get a new token 10 seconds
        // before to avoid an invalid token at any point
        const ttlMs = user.expiresAt - Date.now() - 10000;

        // whenever it gets updated, always make sure it's refreshed
        setTimeout(async () => {
            const userCreds = (await getGenericPassword()) as UserCredentials;
            if (!userCreds) {
                // TODO: login screen
                this._client.signOut();
                return;
            }

            this.requestAuthenticate(userCreds.username, userCreds.password);
        }, ttlMs);
    }
}
