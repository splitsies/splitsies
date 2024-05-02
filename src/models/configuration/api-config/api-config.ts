import { IApiConfig } from "./api-config-interface";
export class ApiConfig implements IApiConfig {
    readonly expense: string;
    readonly expenseSocket: string;
    readonly users: string;
    readonly ocr: string;
    readonly notification: string;

    constructor(config: IApiConfig) {
        this.expense = config.expense;
        this.expenseSocket = config.expenseSocket;
        this.users = config.users;
        this.ocr = config.ocr;
        this.notification = config.notification;
    }
}
