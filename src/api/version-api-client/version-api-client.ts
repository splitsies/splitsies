import { injectable } from "inversify";
import { IVersionApiClient } from "./version-api-client-interface";
import { Version } from "../../models/version/version";
import { IVersion } from "../../models/version/version-interface";
import Config from "react-native-config";
import { DataResponse, IDataResponse } from "@splitsies/shared-models";

/**
 * This client does **not** extend ClientBase due to it being required by ClientBase itself to
 * initialize the proper API configuration dependent on the current minimum and stable versions
 * provided by the backend service.
 */
@injectable()
export class VersionApiClient implements IVersionApiClient {
    private readonly _endpoint: string = "https://d3kcws6fbmdvqa.cloudfront.net";

    constructor() {
        if (Config.STAGE !== "production") {
            this._endpoint = "https://d46l1kpqh90vh.cloudfront.net";
        }
    }

    async getMinimumSupportedVersion(): Promise<IVersion> {
        try {
            const response = await this.get<string>(`${this._endpoint}/minimum`);
            return new Version(response?.data);
        } catch {
            // On errors getting data allow the user to use the app. Chances are they don't have signal,
            // so they won't be able to login anyway.
            return new Version("0.0.0");
        }
    }

    async getLatestStableVersion(): Promise<IVersion> {
        try {
            const response = await this.get<string>(`${this._endpoint}/stable`);
            return new Version(response?.data);
        } catch {
            return new Version("N/A");
        }
    }

    async get<T>(url: string, headers: any = {}): Promise<IDataResponse<T>> {
        const response = await fetch(url, { method: "GET", headers });

        const dataResponse = await response.json();
        if (response.status !== 200) {
            console.error(`endpoint = ${url}, response - ${JSON.stringify(dataResponse, null, 2)}`);
            throw new Error(dataResponse.data);
        }

        return new DataResponse(200, dataResponse.data);
    }
}
