import { injectable } from "inversify";
import { IUiConfiguration } from "./ui-configuration-interface";
import config from "../../../config/ui.config.json";

@injectable()
export class UiConfiguration implements IUiConfiguration {
    constructor(
        readonly sizes = config.sizes,
    ) {}
}
