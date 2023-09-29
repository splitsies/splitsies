import { IUserDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IUserManager {
    readonly user$: Observable<IUserDto | null>;
    createUser(user: Omit<IUserDto, "id">, password: string): Promise<IUserDto>;
}
