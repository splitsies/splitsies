import { LinkingOptions } from "@react-navigation/native";

export interface IAuthenticatedLinkingConfigurationProvider {
    provide(): LinkingOptions<ReactNavigation.RootParamList>;
}

export const IAuthenticatedLinkingConfigurationProvider = Symbol.for("IAuthenticatedLinkingConfigurationProvider");
