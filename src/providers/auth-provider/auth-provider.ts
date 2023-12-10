import { injectable } from "inversify";
import { IAuthProvider } from "./auth-provider-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { IUserManager } from "../../managers/user-manager/user-manager-interface";

@injectable()
export class AuthProvider implements IAuthProvider {
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);

    provideIdentity(): string {
        return this._userManager.user?.user?.id ?? "";
    }

    provideAuthToken(): string {
        return this._userManager.user?.authToken ?? "";
    }

    provideAuthHeader(): { Authorization: string } {
        return { Authorization: `Bearer ${this.provideAuthToken()}` };
    }
}
