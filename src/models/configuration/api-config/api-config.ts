import { injectable } from "inversify";
import { IApiConfig } from "./api-config-interface";
import config from "../../../config/api-dev-pr.config.json";

@injectable()
export class ApiConfig implements IApiConfig {
    readonly expense: string;
    readonly expenseSocket: string;
    readonly users: string;

    constructor() {
        this.expense = config.expense;
        this.expenseSocket = config.expenseSocket;
        this.users = config.users;
    }
}
