import { IDataResponse } from "@splitsies/shared-models";
import { injectable } from "inversify";

/**
 * Base class for providing HTTP response parsing for Splitsies APIs,
 * which require responses to be an IDataResponse in the body.response
 */
@injectable()
export abstract class ClientBase {
    parseResponse<T>(response: any): IDataResponse<T> {
        return response as IDataResponse<T>;
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
        return this.parseResponse(dataResponse);
    }

    async postJson<T>(url: string, body: any = {}, headers: any = {}): Promise<IDataResponse<T>> {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(body),
        });

        const dataResponse = await response.json();
        return this.parseResponse(dataResponse);
    }
}
