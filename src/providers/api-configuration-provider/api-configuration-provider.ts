import { injectable } from "inversify";
import { BaseManager } from "../../managers/base-manager";
import { IApiConfigurationProvider } from "./api-configuration-provider-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { IVersionApiClient } from "../../api/version-api-client/version-api-client-interface";

import App from "../../../package.json";
import { Version } from "../../models/version/version";


import localConfig from "../../config/api-local.config.json";
import devPrConfig from "../../config/api-dev-pr.config.json";
import stagingConfig from "../../config/api-staging.config.json";
import productionConfig from "../../config/api-production.config.json";

import Config from "react-native-config";
import { ApiConfig } from "../../models/configuration/api-config/api-config";




@injectable()
export class ApiConfigurationProvider extends BaseManager implements IApiConfigurationProvider {

    private readonly _versionApiClient = lazyInject<IVersionApiClient>(IVersionApiClient);
    private _apiConfiguration: IApiConfig = undefined!;

    constructor() {
        super();

    }

    protected async initialize(): Promise<void> {
        if (Config.STAGE !== "production") {
            this._apiConfiguration = this.provideConfig();
            return;
        }

        const latestStableVersion = await this._versionApiClient.getLatestStableVersion();
        const appVersion = new Version(App.version);

        this._apiConfiguration = (appVersion.isGreater(latestStableVersion))
            // This means we're on a store review build, so point to staging
            ? new ApiConfig(stagingConfig)

            // Otherwise, point to stable production
            : new ApiConfig(productionConfig);
    }

    async provide(): Promise<IApiConfig> {
        await this.initialized;
        return this._apiConfiguration;
    }

    private provideConfig(): IApiConfig {
        console.log(`Setting up ${Config.STAGE} API endpoints.`);
        switch (Config.STAGE) {
            case "local":
                return localConfig;
            case "lan":
                // require this one as a special case - since the file isn't in
                // git, it may not exist
                try {
                    const c = require("../../config/api-lan.config.json");
                    return c;
                } catch (e) {
                    console.warn("Could not import the LAN api configuration. Defaulting to local configuration.");
                    return localConfig;
                }
            case "dev-pr":
                return devPrConfig;
            case "staging":
                return stagingConfig;
            case "production":
                return productionConfig;
            default:
                return localConfig;
        }
    }
}