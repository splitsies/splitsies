import { CreateUserRequest, IDataResponse, IUserDto } from "@splitsies/shared-models";

export interface IUsersApiClient {
    getById(id: string): Promise<IDataResponse<IUserDto>>;
    create(user: CreateUserRequest): Promise<IDataResponse<IUserDto>>;
}

export const IUsersApiClient = Symbol.for("IUsersApiClient");
