import { injectable } from "inversify";
import { IAppManager } from "./app-manager-interface";

@injectable()
export class AppManager implements IAppManager {
    private _resolver = () => {};

    readonly initialized: Promise<void> = new Promise((resolve) => {
        this._resolver = resolve;
    });

    initialize(): void {
        this._resolver();
    }
}
