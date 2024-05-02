import { injectable } from "inversify";
import { IUsersApiClient } from "./users-api-client-interface";
import {
    CreateUserRequest,
    IDataResponse,
    IExpenseUserDetails,
    IExpenseUserDetailsMapper,
    IScanResult,
    IUserCredential,
    IUserDto,
} from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { BehaviorSubject, Observable } from "rxjs";
import { lazyInject } from "../../utils/lazy-inject";
import { ICreateUserResult } from "../../models/create-user-result/create-user-result-interface";
import { CreateUserResult } from "../../models/create-user-result/create-user-result";
import { IUserCache } from "../../utils/user-cache/user-cache-interface";

@injectable()
export class UsersApiClient extends ClientBase implements IUsersApiClient {
    private readonly _userCache = lazyInject<IUserCache>(IUserCache);
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
            return new CreateUserResult(false, (e as any).message as unknown as string);
        }
    }

    async requestFindUsersByPhoneNumber(phoneNumbers: string[]): Promise<IExpenseUserDetails[]> {
        
        const remaining = phoneNumbers.filter((p) => !this._userCache.hasPhoneNumber(p));
        const cachedUsers = phoneNumbers
            .filter((p) => this._userCache.hasPhoneNumber(p))
            .map((p) => this._userCache.getByPhoneNumber(p)) as IExpenseUserDetails[];

        if (remaining.length === 0) return cachedUsers;

        const users: IExpenseUserDetails[] = cachedUsers;
        const url = `${this._config.users}?phoneNumbers=${remaining.join(",")}`;
        let result = undefined;
        let lastKey = undefined;

        const timeout = Date.now() + 15000;
        do {
            try {
                result = await this.get<IScanResult<IUserDto>>(url + (lastKey ? `&lastKey=${lastKey}` : ""));
                lastKey = result?.data?.lastEvaluatedKey
                    ? encodeURIComponent(JSON.stringify(result?.data?.lastEvaluatedKey))
                    : undefined;
                users.push(...result.data.result.map((u) => this._expenseUserDetailsMapper.fromUserDto(u)));
            } catch (e) {
                console.error(e);
                return users;
            }
        } while (result?.data?.lastEvaluatedKey && Date.now() < timeout);

        users.forEach((u) => this._userCache.add(u));
        return [...users, cachedUsers].filter((u) => u !== undefined) as IExpenseUserDetails[];
    }

    async requestUsersByIds(ids: string[]): Promise<IExpenseUserDetails[]> {
        
        if (ids.length === 0) return [];
        const users = ids.map((i) => this._userCache.get(i)).filter((u) => u !== undefined) as IExpenseUserDetails[];
        const uncachedIds = ids.filter((id) => !users.find((u) => u.id === id));
        if (uncachedIds.length === 0) return users;

        try {
            const url = `${this._config.users}?ids=${uncachedIds.join(",")}`;
            const timeout = Date.now() + 15000;
            let response: IDataResponse<IScanResult<IUserDto>>;
            let lastKey = undefined;

            do {
                response = await this.get<IScanResult<IUserDto>>(url + (lastKey ? `&lastKey=${lastKey}` : ""));
                lastKey = response?.data?.lastEvaluatedKey
                    ? encodeURIComponent(JSON.stringify(response?.data?.lastEvaluatedKey))
                    : undefined;
                if (!response?.success) continue;
                users.push(...response.data.result.map((u) => this._expenseUserDetailsMapper.fromUserDto(u)));
            } while (response?.data?.lastEvaluatedKey && Date.now() < timeout);

            for (const user of users) {
                this._userCache.add(user);
            }

            return users;
        } catch (e) {
            console.error(`Error on request: ${e}`);
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
        if (reset && this._scanPageKeys.has(pageKey)) {
            this._scanPageKeys.delete(pageKey);
        }

        if (!search) return [];

        let url = `${this._config.users}?filter=${encodeURIComponent(search)}`;
        if (this._scanPageKeys.has(pageKey)) {
            url = url.concat(`&lastKey=${encodeURIComponent(JSON.stringify(this._scanPageKeys.get(pageKey)))}`);
        }

        try {
            const result = await this.get<IScanResult<IUserDto>>(url);
            if (result.data.lastEvaluatedKey) {
                this._scanPageKeys.set(pageKey, result.data.lastEvaluatedKey);
            }

            const res = result.data.result.map((u) => this._expenseUserDetailsMapper.fromUserDto(u));
            return res;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async deleteUser(): Promise<void> {
        
        if (!this._user$.value) {
            return;
        }

        const url = `${this._config.users}/${this._user$.value.user.id}`;
        await this.delete(url, { Authorization: `Bearer ${this._user$.value.authToken}` });
        this._user$.next(null);
    }
}
