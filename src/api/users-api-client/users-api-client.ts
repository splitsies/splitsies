import { inject, injectable } from "inversify";
import { ILogger } from "@splitsies/utils";
import { IUsersApiClient } from "./users-api-client-interface";
import { CreateUserRequest, DataResponse, IDataResponse, IUserDto } from "@splitsies/shared-models";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { ClientBase } from "../client-base";

@injectable()
export class UsersApiClient extends ClientBase implements IUsersApiClient {
    constructor(
        @inject(ILogger) private readonly _logger: ILogger,
        @inject(IApiConfig) private readonly _apiConfiguration: IApiConfig,
    ) {
        super();
    }

    async create(user: CreateUserRequest): Promise<IDataResponse<IUserDto>> {
        try {
            const result = await this.postJson<IUserDto>(`${this._apiConfiguration.uri.users}${id}`);

            if (!result?.success) {
                this._logger.error(`Error on request: ${result.data}`);
            }

            return result;
        } catch (e) {
            this._logger.error(`Error on request: ${e}`);
            return new DataResponse(e.statusCode, undefined);
        }
    }

    async getById(id: string): Promise<IDataResponse<IUserDto>> {
        try {
            const result = await this.get<IUserDto>(`${this._apiConfiguration.uri.users}${id}`);

            if (!result?.success) {
                this._logger.error(`Error on request: ${result.data}`);
            }

            return result;
        } catch (e) {
            this._logger.error(`Error on request: ${e}`);
            return new DataResponse(e.statusCode, undefined);
        }
    }
}
