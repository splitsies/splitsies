import { injectable } from "inversify";
import { IVersionApiClient } from "./version-api-client-interface";
import { Version } from "../../models/version/version";
import { IVersion } from "../../models/version/version-interface";
import Config from "react-native-config";
import { IDataResponse } from "@splitsies/shared-models";

/**
 * This client does **not** extend ClientBase due to it being required by ClientBase itself to
 * initialize the proper API configuration dependent on the current minimum and stable versions
 * provided by the backend service.
 */
@injectable()
export class VersionApiClient implements IVersionApiClient {
    private readonly _endpoint: string = "https://3bagj5p6y2.execute-api.us-east-1.amazonaws.com/production";

    constructor() {

        if (Config.STAGE !== "production") {
            this._endpoint = "https://842gezrnph.execute-api.us-east-1.amazonaws.com/devpr"
        }
    }

    async getMinimumSupportedVersion(): Promise<IVersion> {
        try {
            const response = await this.get<string>(`${this._endpoint}/minimum`);
            return new Version(response?.data);
        } catch {
            return new Version("N/A");
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
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });

        const dataResponse = await response.json();

        if (!dataResponse.success) {
            console.error(`endpoint = ${url}, response - ${JSON.stringify(response, null, 2)}`);
            throw new Error(dataResponse.data);
        }

        return dataResponse;
    }
}
