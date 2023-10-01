import { injectable } from "inversify";

@injectable()
export abstract class BaseManager {
    readonly initialized: Promise<void>;

    constructor() {
        let initResolver: () => void;

        this.initialized = new Promise<void>((resolve) => {
            initResolver = resolve;
        });

        setTimeout(async () => {
            await this.initialize();
            initResolver();
        }, 0);
    }

    protected abstract initialize(): Promise<any>;
}
