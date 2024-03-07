import { injectable } from "inversify";
import { IClipboardUtility } from "./clipboard-utility-interface";
import Clipboard from "@react-native-clipboard/clipboard";

@injectable()
export class ClipboardUtility implements IClipboardUtility {
    copyToClipboard(data: string): void {
        Clipboard.setString(data);
    }
}
