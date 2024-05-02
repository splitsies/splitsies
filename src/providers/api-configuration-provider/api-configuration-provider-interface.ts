import { IBaseManager } from "../../managers/base-manager-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";

export interface IApiConfigurationProvider extends IBaseManager {
    provide(): Promise<IApiConfig>;
}

export const IApiConfigurationProvider = Symbol.for("IApiConfigurationProvider");