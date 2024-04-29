export interface IApiConfig {
    readonly expense: string;
    readonly expenseSocket: string;
    readonly users: string;
    readonly ocr: string;
    readonly notification: string;
}

export const IApiConfig = Symbol.for("IApiConfig");
