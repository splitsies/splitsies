import { injectable } from "inversify";
import { IVersionManager } from "./version-manager-interface";
import { BaseManager } from "../base-manager";
import { lazyInject } from "../../utils/lazy-inject";
import { IVersionApiClient } from "../../api/version-api-client/version-api-client-interface";
import { version } from "../../../package.json";
import { Version } from "../../models/version/version";
import Config from "react-native-config";

@injectable()
export class VersionManager extends BaseManager implements IVersionManager {    
    private _requiresUpdate = false;
    private _isPrerelease = false;

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        const versionApiClient = lazyInject<IVersionApiClient>(IVersionApiClient);
        const currentAppVersion = new Version(version);

        const minimumSupportedVersion = await versionApiClient.getMinimumSupportedVersion();
        this._requiresUpdate = minimumSupportedVersion.isGreater(currentAppVersion);

        if (Config.STAGE !== "production") {
            this._isPrerelease = false;
            return;
        }

        const latestStableVersion = await versionApiClient.getLatestStableVersion();
        this._isPrerelease = currentAppVersion.isGreater(latestStableVersion);
    }

    get requiresUpdate(): boolean {
        return this._requiresUpdate;
    }
    
    get isPrerelease(): boolean {
        return this._isPrerelease;
    }
}