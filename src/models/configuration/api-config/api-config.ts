import { injectable } from "inversify";
import { IApiConfig } from "./api-config-interface";
import config from "../../../config/api-local.config.json";
import { Platform } from "react-native";

@injectable()
export class ApiConfig implements IApiConfig {
    readonly expense: string;
    readonly expenseSocket: string;
    readonly users: string;

    constructor() {
        this.expense = Platform.OS !== "android" ? config.expense : config.expense.replace("localhost", "10.0.2.2");
        this.expenseSocket = Platform.OS !== "android" ? config.expenseSocket : config.expenseSocket.replace("localhost", "10.0.2.2");
        this.users = Platform.OS !== "android" ? config.users : config.users.replace("localhost", "10.0.2.2");
    }
}
