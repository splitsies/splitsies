import { IRequestConfiguration } from "./request-configuration-interface";
import config from "../../../config/request.config.json";
import { injectable } from "inversify";

@injectable()
export class RequestConfiguration implements IRequestConfiguration {
    readonly connectionTimeoutMs: number;

    constructor() {
        this.connectionTimeoutMs = config.connectionTimeoutMs;
    }
}
