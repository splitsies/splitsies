import { IDataResponse } from "@splitsies/shared-models";
import { injectable } from "inversify";
import { BaseManager } from "../managers/base-manager";
import { lazyInject } from "../utils/lazy-inject";
import { IApiConfigurationProvider } from "../providers/api-configuration-provider/api-configuration-provider-interface";
import { IApiConfig } from "../models/configuration/api-config/api-config-interface";

/**
 * Base class for providing HTTP response parsing for Splitsies APIs,
 * which require responses to be an IDataResponse in the body.response
 */
@injectable()
export abstract class ClientBase extends BaseManager {
    private readonly _apiConfigurationProvider = lazyInject<IApiConfigurationProvider>(IApiConfigurationProvider);

    protected _config: IApiConfig = undefined!;
    protected _scanPageKeys = new Map<string, Record<string, object> | null>();

    protected async initialize(): Promise<void> {
        await this._apiConfigurationProvider.initialized;
        this._config = await this._apiConfigurationProvider.provide();
    }

    parseResponse<T>(response: any): IDataResponse<T> {
        return response as IDataResponse<T>;
    }

    async get<T>(url: string, headers: any = {}): Promise<IDataResponse<T>> {
        return await this.runWithExponentialBackoff(
            () =>
                fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...headers,
                    },
                }),
            url,
        );
    }

    async postJson<T>(url: string, body: any = {}, headers: any = {}): Promise<IDataResponse<T>> {
        return await this.runWithExponentialBackoff(
            () =>
                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...headers,
                    },
                    body: JSON.stringify(body),
                }),
            url,
        );
    }

    async putJson<T>(url: string, body: any = {}, headers: any = {}): Promise<IDataResponse<T>> {
        return await this.runWithExponentialBackoff(
            () =>
                fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...headers,
                    },
                    body: JSON.stringify(body),
                }),
            url,
        );
    }

    async delete(url: string, headers: any = {}): Promise<void> {
        await this.runWithExponentialBackoff(
            () =>
                fetch(url, {
                    method: "DELETE",
                    headers: {
                        ...headers,
                    },
                }),
            url,
        );
    }

    private async runWithExponentialBackoff<T>(
        request: () => Promise<Response>,
        endpoint: string,
    ): Promise<IDataResponse<T>> {
        const maxRetries = 5;
        const baseWaitTimeMs = 50;

        let response: Response | undefined = undefined;
        let dataResponse: IDataResponse<T> | undefined = undefined;
        let retries = 0;

        do {
            try {
                response = await request();
            } catch (e) {
                console.error(`error on fetch. url=${endpoint}`, e);
                throw e;
            }

            if ((response.headers as unknown as any)?.map?.["x-amzn-errortype"] && response.status === 500) {
                // Could be rate limiting errors - need to dig in to how to change
                // APIGW response from a proxy integration error status code
                const requestCooldownMs = baseWaitTimeMs * 2 ** retries;
                await new Promise<void>((res) => setTimeout(() => res(), requestCooldownMs));
                console.log(`Hitting ${endpoint} again after ${requestCooldownMs}. Retries=${retries++}`, response);
                continue;
            }

            const parsedResponse = await response.json();
            if (!parsedResponse.success) {
                console.error(`endpoint = ${endpoint}, response - ${JSON.stringify(response, null, 2)}`);
                throw new Error(parsedResponse.data);
            }

            dataResponse = this.parseResponse(parsedResponse);
        } while (dataResponse === undefined && retries <= maxRetries);

        if (dataResponse) {
            return dataResponse;
        }

        console.error(`endpoint = ${endpoint} failed after ${maxRetries} retries`);
        throw new Error();
    }
}
