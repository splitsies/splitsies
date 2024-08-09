import { IBaseManager } from "../base-manager-interface";

export interface IAppManager extends IBaseManager {
    initialize(): Promise<void>;
}
export const IAppManager = Symbol.for("IAppManager");
