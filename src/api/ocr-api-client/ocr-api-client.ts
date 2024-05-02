import { injectable } from "inversify";
import { IOcrApiClient } from "./ocr-api-client-interface";
import { IExpenseDto } from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";

@injectable()
export class OcrApiClient extends ClientBase implements IOcrApiClient {
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);

    constructor() {
        super();
    }

    async scanImage(base64Image: string): Promise<IExpenseDto | null> {
        await this.initialized;
        const uri = `${this._config.ocr}process`;

        try {
            const result = await this.postJson<IExpenseDto>(
                uri,
                {
                    image: base64Image,
                },
                this._authProvider.provideAuthHeader(),
            );

            if (!result?.success) {
                console.error(`Error on request: ${result.data}`);
            }

            return result.data;
        } catch (e) {
            console.error(`Error on request: ${e}`);
            return null;
        }
    }
}
