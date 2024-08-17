import { getStateFromPath, LinkingOptions } from "@react-navigation/native";
import { injectable } from "inversify";
import { IAuthenticatedLinkingConfigurationProvider } from "./authenticated-linking-configuration-provider.i";
import { lazyInject } from "../../utils/lazy-inject";
import { IUserManager } from "../../managers/user-manager/user-manager-interface";
import { linking, unauthenticatedLinking } from "../../config/linking.config";
import { Linking } from "react-native";

@injectable()
export class AuthenticatedLinkingConfigurationProvider implements IAuthenticatedLinkingConfigurationProvider {
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);

    provide(): LinkingOptions<ReactNavigation.RootParamList> {
        return {
            ...linking,
            // Initialially prevents the deep link from navigating into the app
            // if authentication hasn't happened yet. Once authentication is successful,
            // links to the appropriate route
            getStateFromPath: (path: string, config: any) => {
                if (this._userManager.user) {
                    const state = getStateFromPath(path, config);
                    return state;
                } else {
                    const unauthorizedState = getStateFromPath(path, unauthenticatedLinking.config);

                    this._userManager.initialized.then(() => {
                        if (this._userManager.user) {
                            Linking.openURL(`${linking.prefixes[0]}${path}`);
                        }
                    });

                    return unauthorizedState;
                }
            },
        };
    }
}
