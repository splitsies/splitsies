import { IVersion } from "../../models/version/version-interface";

export interface IVersionApiClient {
    getMinimumSupportedVersion(): Promise<IVersion>;
    getLatestStableVersion(): Promise<IVersion>;
}

export const IVersionApiClient = Symbol.for("IVersionApiClient");
