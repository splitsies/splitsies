import { IDataResponse } from "@splitsies/shared-models";
import { injectable } from "inversify";

/**
 * Base class for providing HTTP response parsing for Splitsies APIs,
 * which require responses to be an IDataResponse in the body.response
 */
@injectable()
export abstract class ClientBase {
    protected _scanPageKeys = new Map<string, Record<string, object> | null>();

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

        if (!dataResponse.success) {
            console.error(`endpoint = ${url}, response - ${JSON.stringify(response, null, 2)}`);
            throw new Error(dataResponse.data);
        }

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

        if (!dataResponse.success) {
            console.error(`endpoint = ${url}, response - ${JSON.stringify(response, null, 2)}`);
            throw new Error(dataResponse.data);
        }

        return this.parseResponse(dataResponse);
    }

    async putJson<T>(url: string, body: any = {}, headers: any = {}): Promise<IDataResponse<T>> {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(body),
        });

        const dataResponse = await response.json();

        if (!dataResponse.success) {
            console.error(`endpoint = ${url}, response - ${JSON.stringify(response, null, 2)}`);
            throw new Error(dataResponse.data);
        }

        return this.parseResponse(dataResponse);
    }

    async delete(url: string, headers: any = {}): Promise<void> {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                ...headers,
            },
        });

        const dataResponse = await response.json();

        if (!dataResponse.success) {
            console.error(`DELETE endpoint = ${url}, response - ${JSON.stringify(response, null, 2)}`);
            throw new Error();
        }
    }
}
