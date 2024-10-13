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
import { IRegionSelectionStrategy } from "../../strategies/region-selection-strategy/region-selection-strategy.i";

@injectable()
export class ApiConfigurationProvider extends BaseManager implements IApiConfigurationProvider {
    private readonly _versionManager = lazyInject<IVersionManager>(IVersionManager);
    private readonly _regionSelectionStrategy = lazyInject<IRegionSelectionStrategy>(IRegionSelectionStrategy);
    private _apiConfiguration: IApiConfig = localConfig["us-east-1"];
    private _region: "us-east-1" | "us-west-1" = "us-east-1";

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        await this._versionManager.initialized;

        // Ideally this isn't done client-side, but it's free this way.
        this._region = await this._regionSelectionStrategy.byLowestLatency();
        this._apiConfiguration = new ApiConfig(this.provideConfig());
    }

    async provide(): Promise<IApiConfig> {
        await this.initialized;
        return this._apiConfiguration;
    }

    private provideConfig(): IApiConfig {
        if (this._versionManager.isPrerelease) {
            return stagingConfig[this._region] ?? stagingConfig["us-east-1"];
        }

        console.log(`Setting up ${Config.STAGE} API endpoints for ${this._region}`);
        switch (Config.STAGE) {
            case "local":
                return localConfig["us-east-1"];
            // case "lan":
            //     // require this one as a special case - since the file isn't in
            //     // git, it may not exist
            //     try {
            //         const c = require("../../config/api-lan.config.json");
            //         return c;
            //     } catch (e) {
            //         console.warn("Could not import the LAN api configuration. Defaulting to local configuration.");
            //         return localConfig;
            //     }
            case "dev-pr":
                return devPrConfig[this._region] ?? devPrConfig["us-east-1"];
            case "staging":
                return stagingConfig[this._region] ?? stagingConfig["us-east-1"];
            case "production":
                return productionConfig[this._region] ?? productionConfig["us-east-1"];
            default:
                return localConfig["us-east-1"];
        }
    }
}
