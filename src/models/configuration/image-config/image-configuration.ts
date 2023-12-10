import { IImageConfiguration } from "./image-configuration-interface";
import config from "../../../config/image.config.json";
import { injectable } from "inversify";

@injectable()
export class ImageConfiguration implements IImageConfiguration {
    readonly quality: number;

    constructor() {
        this.quality = config.quality;
    }
}
