import { injectable } from "inversify";
import { IUsersApiClient } from "./users-api-client-interface";
import {
    CreateUserRequest,
    IExpenseUserDetails,
    IExpenseUserDetailsMapper,
    IScanResult,
    IUserCredential,
    IUserDto,
} from "@splitsies/shared-models";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { ClientBase } from "../client-base";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { lazyInject } from "../../utils/lazy-inject";
import { ICreateUserResult } from "../../models/create-user-result/create-user-result-interface";
import { CreateUserResult } from "../../models/create-user-result/create-user-result";

@injectable()
export class UsersApiClient extends ClientBase implements IUsersApiClient {
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);
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

    async create(user: CreateUserRequest): Promise<ICreateUserResult> {
        try {
            const result = await this.postJson<IUserCredential>(this._config.users, { user });
            if (!result.success) {
                console.error({ yes: result });
                return new CreateUserResult(false, result.data as unknown as string);
            }

            this._user$.next(result.data);
            return new CreateUserResult(true, null);
        } catch (e) {
            return new CreateUserResult(false, e.message as unknown as string);
        }
    }

    async requestFindUsersByPhoneNumber(phoneNumbers: string[]): Promise<IUserDto[]> {
        const url = `${this._config.users}?phoneNumbers=${phoneNumbers.join(",")}`;

        try {
            const result = await this.get<IUserDto[]>(url);
            return result.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async requestUsersByIds(ids: string[]): Promise<IUserDto[]> {
        const url = `${this._config.users}?ids=${ids.join(",")}`;

        try {
            const result = await this.get<IUserDto[]>(url);
            return result.data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async requestAddGuestUser(givenName: string, familyName: string, phoneNumber: string): Promise<IUserDto> {
        const url = `${this._config.users}/guests`;
        const result = await this.postJson<IUserDto>(url, { givenName, familyName, phoneNumber });
        return result.data;
    }

    async requestFindUsers(search: string, reset: boolean): Promise<IExpenseUserDetails[]> {
        const pageKey = "requestFindUsers";
        if (!search) return [];

        if (reset && this._scanPageKeys.has(pageKey)) {
            this._scanPageKeys.delete(pageKey);
        }

        let url = `${this._config.users}?filter=${encodeURIComponent(search)}`;
        if (this._scanPageKeys.has(pageKey)) {
            url = url.concat(`&lastKey=${encodeURIComponent(JSON.stringify(this._scanPageKeys.get(pageKey)))}`);
        }

        try {
            const result = await this.get<IScanResult<IUserDto>>(url);
            if (result.data.lastEvaluatedKey) {
                this._scanPageKeys.set(pageKey, result.data.lastEvaluatedKey);
            } else {
                this._scanPageKeys.delete(pageKey);
            }

            const res = result.data.result.map((u) => this._expenseUserDetailsMapper.fromUserDto(u));
            return res;
        } catch (e) {
            console.error(e);
            return [];
        }
    }
}
