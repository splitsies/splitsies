import {
    CreateUserRequest,
    ExpenseUserDetails,
    IExpenseUserDetails,
    IExpenseUserDetailsMapper,
    IUserCredential,
    IUserDto,
} from "@splitsies/shared-models";
import { BehaviorSubject, Observable, first, lastValueFrom } from "rxjs";
import { IUserManager } from "./user-manager-interface";
import { injectable } from "inversify";
import { IUsersApiClient } from "../../api/users-api-client/users-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { resetGenericPassword, setGenericPassword, getGenericPassword, UserCredentials } from "react-native-keychain";
import { IPersmissionRequester } from "../../utils/permission-requester/permission-requester-interface";
import Contacts from "react-native-contacts";

@injectable()
export class UserManager extends BaseManager implements IUserManager {
    private readonly _client = lazyInject<IUsersApiClient>(IUsersApiClient);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);
    private readonly _permissionRequester = lazyInject<IPersmissionRequester>(IPersmissionRequester);
    private readonly _user$ = new BehaviorSubject<IUserCredential | null>(null);
    private readonly _contactUsers$ = new BehaviorSubject<IExpenseUserDetails[]>([]);

    constructor() {
        super();
    }

    protected async initialize(): Promise<any> {
        this._client.user$.subscribe({
            next: (user) => this.onUserUpdated(user),
        });

        const userCreds = (await getGenericPassword()) as UserCredentials;
        if (!userCreds) {
            return Promise.resolve();
        }

        const onInitialAuthResponse = lastValueFrom(this._client.user$.pipe(first((user) => !!user?.authToken)));

        if (!(await this.requestAuthenticate(userCreds.username, userCreds.password))) {
            return Promise.resolve();
        }

        return onInitialAuthResponse;
    }

    get expenseUserDetails(): IExpenseUserDetails {
        if (this._user$.value) {
            return this._expenseUserDetailsMapper.fromUserDto(this._user$.value.user);
        }

        throw new Error("Attempted to cast user details without an active user");
    }

    get user(): IUserCredential | null {
        return this._user$.value;
    }

    get user$(): Observable<IUserCredential | null> {
        return this._user$.asObservable();
    }

    get contactUsers$(): Observable<IExpenseUserDetails[]> {
        return this._contactUsers$.asObservable();
    }

    get userId(): string {
        return this.user?.user.id ?? "";
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

    async requestFindUsersByPhoneNumber(phoneNumbers: string[]): Promise<void> {
        const users = await this._client.requestFindUsersByPhoneNumber(phoneNumbers);
        this._contactUsers$.next(
            users.map((u) => this._expenseUserDetailsMapper.fromUserDto(u)).sort(this.userSortCompare),
        );
    }

    async requestUsersByIds(ids: string[]): Promise<IUserDto[]> {
        return this._client.requestUsersByIds(ids);
    }

    async requestAddGuestUser(givenName: string, familyName: string, phoneNumber: string): Promise<IUserDto> {
        const user = await this._client.requestAddGuestUser(givenName, familyName, phoneNumber);

        // Replace the user stub in contactUsers with the newly created guest, or add the user if needed
        const newUserDetails = this._expenseUserDetailsMapper.fromUserDto(user);
        const details = this._contactUsers$.value;
        const matchingUserIndex = details.findIndex((u) => u.phoneNumber === user.phoneNumber);

        if (matchingUserIndex > -1) {
            details.splice(matchingUserIndex, 1);
        }

        details.push(newUserDetails);
        this._contactUsers$.next(details.sort(this.userSortCompare));
        return user;
    }

    async requestUsersFromContacts(): Promise<void> {
        const permissionStatus = await this._permissionRequester.requestReadContacts();

        if (permissionStatus === "denied") {
            this._contactUsers$.next([]);
            return;
        }

        try {
            // Get contacts
            const contacts = await Contacts.getAll();
            const numbers: string[] = [];
            for (const c of contacts) {
                numbers.push(...c.phoneNumbers.map((n) => n.number.replace(/\D/g, "")));
            }

            // Do a search to find the ones existing as Splitsies users
            const splitsiesUsers = await this._client.requestFindUsersByPhoneNumber(numbers);
            const keyedByNumber = new Map<string, IUserDto>();

            for (const u of splitsiesUsers) {
                keyedByNumber.set(u.phoneNumber, u);
            }

            // Merge them together
            const contactUsers: IExpenseUserDetails[] = [];

            for (const c of contacts) {
                const accountPhoneNumber = c.phoneNumbers
                    .map((n) => n.number.replace(/\D/g, ""))
                    .find((n) => keyedByNumber.has(n));
                if (accountPhoneNumber && keyedByNumber.has(accountPhoneNumber)) {
                    const user = keyedByNumber.get(accountPhoneNumber);
                    contactUsers.push(this._expenseUserDetailsMapper.fromUserDto(user!));
                    continue;
                }

                contactUsers.push(
                    new ExpenseUserDetails(
                        false,
                        "",
                        c.givenName,
                        c.familyName,
                        c.phoneNumbers[0].number.replace(/\D/g, ""),
                    ),
                );
            }

            this._contactUsers$.next(contactUsers.sort(this.userSortCompare));
        } catch (e) {
            console.error(e);
        }
    }

    private userSortCompare(user1: IExpenseUserDetails, user2: IExpenseUserDetails): number {
        return user1.givenName.toUpperCase() > user2.givenName.toUpperCase()
            ? 1
            : user1.givenName.toUpperCase() < user2.givenName.toUpperCase()
            ? -1
            : 0;
    }
}
