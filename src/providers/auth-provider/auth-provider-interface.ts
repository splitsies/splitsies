export interface IAuthProvider {
    provideAuthToken(): string;
    provideAuthHeader(): { Authorization: string };
}

export const IAuthProvider = Symbol.for("IAuthProvider");
