export interface IApiConfig {
    readonly expense: string;
    readonly expenseSocket: string;
    readonly users: string;
}

export const IApiConfig = Symbol.for("IApiConfig");
