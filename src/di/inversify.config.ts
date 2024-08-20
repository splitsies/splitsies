import "reflect-metadata";
import { Container } from "inversify";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { ExpenseManager } from "../managers/expense-manager/expense-manager";
import { IUsersApiClient } from "../api/users-api-client/users-api-client-interface";
import { UsersApiClient } from "../api/users-api-client/users-api-client";
import { IExpenseApiClient } from "../api/expense-api-client/expense-api-client-interface";
import { ExpenseApiClient } from "../api/expense-api-client/expense-api-client";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { UserManager } from "../managers/user-manager/user-manager";
import { IAuthProvider } from "../providers/auth-provider/auth-provider-interface";
import { AuthProvider } from "../providers/auth-provider/auth-provider";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { ColorConfiguration } from "../models/configuration/color-config/color-configuration";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { StyleManager } from "../managers/style-manager/style-manager";
import {
    ExpenseMessageParametersMapper,
    ExpenseUserDetailsMapper,
    IExpenseMessageParametersMapper,
    IExpenseUserDetailsMapper,
} from "@splitsies/shared-models";
import { IPersmissionRequester } from "../utils/permission-requester/permission-requester-interface";
import { PermissionRequester } from "../utils/permission-requester/permission-requester";
import { IImageConfiguration } from "../models/configuration/image-config/image-configuration-interface";
import { ImageConfiguration } from "../models/configuration/image-config/image-configuration";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { RequestConfiguration } from "../models/configuration/request-config/request-configuration";
import { IPriceCalculator } from "../utils/price-calculator/price-calculator-interface";
import { PriceCalculator } from "../utils/price-calculator/price-calculator";
import { IVenmoLinker } from "../utils/venmo-linker/venmo-linker-interface";
import { VenmoLinker } from "../utils/venmo-linker/venmo-linker";
import { IVenmoConfiguration } from "../models/configuration/venmo-configuration/venmo-configuration-interface";
import { VenmoConfiguration } from "../models/configuration/venmo-configuration/venmo-configuration";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { InviteViewModel } from "../view-models/invite-view-model/invite-view-model";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { HomeViewModel } from "../view-models/home-view-model/home-view-model";
import { IThemeViewModel } from "../view-models/theme-view-model/theme-view-model-interface";
import { ThemeViewModel } from "../view-models/theme-view-model/theme-view-model";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { UiConfiguration } from "../models/configuration/ui-configuration/ui-configuration";
import { ITransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder-interface";
import { TransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder";
import { IClipboardUtility } from "../utils/clipboard-utility/clipboard-utility-interface";
import { ClipboardUtility } from "../utils/clipboard-utility/clipboard-utility";
import { IAdManager } from "../managers/ad-manager/ad-manager-interface";
import { AdManager } from "../managers/ad-manager/ad-manager";
import { IAdConfiguration } from "../models/configuration/ad-configuration/ad-configuration-interface";
import { AdConfiguration } from "../models/configuration/ad-configuration/ad-configuration";
import { IExpenseMapper } from "../mappers/expense-mapper-interface";
import { ExpenseMapper } from "../mappers/expense-mapper";
import { IOcrApiClient } from "../api/ocr-api-client/ocr-api-client-interface";
import { OcrApiClient } from "../api/ocr-api-client/ocr-api-client";
import { IUserCache } from "../utils/user-cache/user-cache-interface";
import { UserCache } from "../utils/user-cache/user-cache";
import { IExpenseJoinRequestMapper } from "../mappers/expense-join-request-mapper/expense-join-request-mapper-interface";
import { ExpenseJoinRequestMapper } from "../mappers/expense-join-request-mapper/expense-join-request-mapper";
import { INotificationManager } from "../managers/notification-manager/notification-manager-interface";
import { NotificationManager } from "../managers/notification-manager/notification-manager";
import { INotificationApiClient } from "../api/notification-api-client/notification-api-client-interface";
import { NotificationApiClient } from "../api/notification-api-client/notification-api-client";
import { IMessageHub } from "../hubs/message-hub/message-hub-interface";
import { IWritableMessageHub } from "../hubs/writable-message-hub/writable-message-hub-interface";
import { WritableMessageHub } from "../hubs/writable-message-hub/writable-message-hub";
import { ISettingsManager } from "../managers/settings-manager/settings-manager-interface";
import { SettingsManager } from "../managers/settings-manager/settings-manager";
import { IVersionApiClient } from "../api/version-api-client/version-api-client-interface";
import { VersionApiClient } from "../api/version-api-client/version-api-client";
import { IApiConfigurationProvider } from "../providers/api-configuration-provider/api-configuration-provider-interface";
import { ApiConfigurationProvider } from "../providers/api-configuration-provider/api-configuration-provider";
import { IVersionManager } from "../managers/version-manager/version-manager-interface";
import { VersionManager } from "../managers/version-manager/version-manager";
import { IAppManager } from "../managers/app-manager/app-manager-interface";
import { AppManager } from "../managers/app-manager/app-manager";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { ExpenseViewModel } from "../view-models/expense-view-model/expense-view-model";
import { IPushMessageHandlerProvider } from "../providers/push-message-handler-provider/push-message-handler-provider-interface";
import { PushMessageHandlerProvider } from "../providers/push-message-handler-provider/push-message-handler-provider";
import { IBalanceCalculator } from "../utils/balance-calculator/balance-calculator-interface";
import { BalanceCalculator } from "../utils/balance-calculator/balance-calculator";
import { IAuthenticatedLinkingConfigurationProvider } from "../providers/authenticated-linking-configuration-provider/authenticated-linking-configuration-provider.i";
import { AuthenticatedLinkingConfigurationProvider } from "../providers/authenticated-linking-configuration-provider/authenticated-linking-configuration-provider";
import { ITutorialManager } from "../managers/tutorial-manager/tutorial-manager.i";
import { TutorialManager } from "../managers/tutorial-manager/tutorial-manager";
import { ITutorialConfiguration } from "../models/configuration/tutorial-configuration/tutorial-configuration.i";
import { TutorialConfiguration } from "../models/configuration/tutorial-configuration/tutorial-configuration";
import {
    IRunningTotalCalculator,
    IRunningTotalculator,
} from "../utils/running-total-calculator/running-total-calculator.i";
import { RunningTotalCalculator } from "../utils/running-total-calculator/running-total-calculator";
import { IExpenseMessageStrategy } from "../strategies/expense-message-strategy/expense-message-strategy.i";
import { ExpenseMessageStrategy } from "../strategies/expense-message-strategy/expense-message-strategy";
const container = new Container({ defaultScope: "Singleton" });

const messageHub = new WritableMessageHub();
container.bind<IWritableMessageHub>(IWritableMessageHub).toConstantValue(messageHub);
container.bind<IMessageHub>(IMessageHub).toConstantValue(messageHub);
container.bind<IApiConfigurationProvider>(IApiConfigurationProvider).to(ApiConfigurationProvider);
container.bind<IExpenseManager>(IExpenseManager).to(ExpenseManager);
container.bind<IUserManager>(IUserManager).to(UserManager);
container.bind<IExpenseApiClient>(IExpenseApiClient).to(ExpenseApiClient);
container.bind<IUsersApiClient>(IUsersApiClient).to(UsersApiClient);
container.bind<IAuthProvider>(IAuthProvider).to(AuthProvider);
container.bind<IColorConfiguration>(IColorConfiguration).to(ColorConfiguration);
container.bind<IStyleManager>(IStyleManager).to(StyleManager);
container.bind<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper).to(ExpenseUserDetailsMapper);
container.bind<IPersmissionRequester>(IPersmissionRequester).to(PermissionRequester);
container.bind<IImageConfiguration>(IImageConfiguration).to(ImageConfiguration);
container.bind<IRequestConfiguration>(IRequestConfiguration).to(RequestConfiguration);
container.bind<IPriceCalculator>(IPriceCalculator).to(PriceCalculator);
container.bind<IVenmoLinker>(IVenmoLinker).to(VenmoLinker);
container.bind<IVenmoConfiguration>(IVenmoConfiguration).to(VenmoConfiguration);
container.bind<IInviteViewModel>(IInviteViewModel).to(InviteViewModel);
container.bind<IHomeViewModel>(IHomeViewModel).to(HomeViewModel);
container.bind<IThemeViewModel>(IThemeViewModel).to(ThemeViewModel);
container.bind<IUiConfiguration>(IUiConfiguration).to(UiConfiguration);
container.bind<IExpenseMessageParametersMapper>(IExpenseMessageParametersMapper).to(ExpenseMessageParametersMapper);

container.bind<ITransactionNoteBuilder>(ITransactionNoteBuilder).to(TransactionNoteBuilder);
container.bind<IClipboardUtility>(IClipboardUtility).to(ClipboardUtility);
container.bind<IAdManager>(IAdManager).to(AdManager);
container.bind<IAdConfiguration>(IAdConfiguration).to(AdConfiguration);
container.bind<IExpenseMapper>(IExpenseMapper).to(ExpenseMapper);

container.bind<IOcrApiClient>(IOcrApiClient).to(OcrApiClient);
container.bind<IUserCache>(IUserCache).to(UserCache);
container.bind<IExpenseJoinRequestMapper>(IExpenseJoinRequestMapper).to(ExpenseJoinRequestMapper);
container.bind<INotificationManager>(INotificationManager).to(NotificationManager);
container.bind<INotificationApiClient>(INotificationApiClient).to(NotificationApiClient);
container.bind<ISettingsManager>(ISettingsManager).to(SettingsManager);
container.bind<IVersionApiClient>(IVersionApiClient).to(VersionApiClient).inTransientScope();
container.bind<IVersionManager>(IVersionManager).to(VersionManager);
container.bind<IAppManager>(IAppManager).to(AppManager);
container.bind<IExpenseViewModel>(IExpenseViewModel).to(ExpenseViewModel);
container.bind<IPushMessageHandlerProvider>(IPushMessageHandlerProvider).to(PushMessageHandlerProvider);
container.bind<IBalanceCalculator>(IBalanceCalculator).to(BalanceCalculator);
container
    .bind<IAuthenticatedLinkingConfigurationProvider>(IAuthenticatedLinkingConfigurationProvider)
    .to(AuthenticatedLinkingConfigurationProvider);
container.bind<ITutorialManager>(ITutorialManager).to(TutorialManager);
container.bind<ITutorialConfiguration>(ITutorialConfiguration).to(TutorialConfiguration);
container.bind<IRunningTotalCalculator>(IRunningTotalculator).to(RunningTotalCalculator);
container.bind<IExpenseMessageStrategy>(IExpenseMessageStrategy).to(ExpenseMessageStrategy);

export { container };
