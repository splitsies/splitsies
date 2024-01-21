import { ICreateUserResult } from "./create-user-result-interface";

export class CreateUserResult implements ICreateUserResult {
    constructor(readonly success: boolean, readonly error: string | null) {}
}
