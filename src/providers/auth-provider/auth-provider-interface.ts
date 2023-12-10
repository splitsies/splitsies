export interface IAuthProvider {
    provideIdentity(): string;
    provideAuthToken(): string;
    provideAuthHeader(): { Authorization: string };
}

export const IAuthProvider = Symbol.for("IAuthProvider");
