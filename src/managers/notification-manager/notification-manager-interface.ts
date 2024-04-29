import { IBaseManager } from "../base-manager-interface";

export interface INotificationManager extends IBaseManager {}
export const INotificationManager = Symbol.for("INotificationManager");
