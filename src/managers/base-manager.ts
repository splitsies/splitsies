import { injectable } from "inversify";

@injectable()
export abstract class BaseManager {
    constructor() {
        setTimeout(() => this.subscribe(), 0);
    }

    protected abstract subscribe(): void;
}
