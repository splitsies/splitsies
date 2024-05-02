import { IBaseManager } from "../base-manager-interface";

export interface IVersionManager extends IBaseManager {
    readonly requiresUpdate: boolean;
    readonly isPrerelease: boolean;
}

export const IVersionManager = Symbol.for("IVersionManager");
