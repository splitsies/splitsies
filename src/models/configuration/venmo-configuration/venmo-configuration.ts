import { injectable } from "inversify";
import { IVenmoConfiguration } from "./venmo-configuration-interface";
import config from "../../../config/venmo.config.json";

@injectable()
export class VenmoConfiguration implements IVenmoConfiguration {
    constructor(
        readonly deepLinkUrl = config.deepLinkUrl,
        readonly placeholders = config.placeholders,
        readonly maxNoteLength = config.maxNoteLength,
    ) {}
}
