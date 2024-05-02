import { injectable } from "inversify";
import { BaseManager } from "../../managers/base-manager";
import { IApiConfigurationProvider } from "./api-configuration-provider-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { ApiConfig } from "../../models/configuration/api-config/api-config";
import { IVersionManager } from "../../managers/version-manager/version-manager-interface";
import Config from "react-native-config";
import localConfig from "../../config/api-local.config.json";
import devPrConfig from "../../config/api-dev-pr.config.json";
import stagingConfig from "../../config/api-staging.config.json";
import productionConfig from "../../config/api-production.config.json";

@injectable()
export class ApiConfigurationProvider extends BaseManager implements IApiConfigurationProvider {

    private readonly _versionManager = lazyInject<IVersionManager>(IVersionManager);
    private _apiConfiguration: IApiConfig = localConfig;

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        await this._versionManager.initialized;        
        this._apiConfiguration = this._versionManager.isPrerelease
            ? new ApiConfig(stagingConfig)
            : new ApiConfig(this.provideConfig());
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