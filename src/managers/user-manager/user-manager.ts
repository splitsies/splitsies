import { CreateUserRequest, IUserDto } from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IUserManager } from "./user-manager-interface";
import { inject, injectable } from "inversify";
import { IUsersApiClient } from "../../api/users-api-client/users-api-client-interface";

@injectable()
export class UserManager implements IUserManager {
    private readonly _user$ = new BehaviorSubject<IUserDto | null>(null);

    constructor(@inject(IUsersApiClient) private readonly _client: IUsersApiClient) {}

    get user$(): Observable<IUserDto | null> {
        return this._user$.asObservable();
    }

    async createUser(user: Omit<IUserDto, "id">, password: string): Promise<IUserDto> {
        const response = await this._client.create({
            givenName: user.givenName,
            familyName: user.familyName,
            email: user.email,
            password: password,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            middleName: user.middleName,
        } as CreateUserRequest);

        return response.data;
    }
}
