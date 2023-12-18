import { injectable } from "inversify";
import { IApiConfig } from "./api-config-interface";
import localConfig from "../../../config/api-local.config.json";
import devPrConfig from "../../../config/api-dev-pr.config.json";
import stagingConfig from "../../../config/api-staging.config.json";
import Config from "react-native-config";

@injectable()
export class ApiConfig implements IApiConfig {
    readonly expense: string;
    readonly expenseSocket: string;
    readonly users: string;

    constructor() {
        const config = this.provideConfig();

        this.expense = config.expense;
        this.expenseSocket = config.expenseSocket;
        this.users = config.users;
    }

    private provideConfig() {
        console.trace(`Setting up ${Config.STAGE} API endpoints.`);
        switch (Config.STAGE) {
            case "local":
                return localConfig;
            case "dev-pr":
                return devPrConfig;
            case "staging":
                return stagingConfig;
            default:
                return localConfig;
        }
    }
}
