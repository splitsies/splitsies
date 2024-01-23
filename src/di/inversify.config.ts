import "reflect-metadata";
import { Container } from "inversify";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { ExpenseManager } from "../managers/expense-manager/expense-manager";
import { IApiConfig } from "../models/configuration/api-config/api-config-interface";
import { ApiConfig } from "../models/configuration/api-config/api-config";
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
    ExpenseMapper,
    ExpenseUpdateMapper,
    ExpenseUserDetailsMapper,
    IExpenseMapper,
    IExpenseUpdateMapper,
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
import { ICameraViewModel } from "../view-models/camera-view-model/camera-view-model-interface";
import { CameraViewModel } from "../view-models/camera-view-model/camera-view-model";
const container = new Container();

container.bind<IApiConfig>(IApiConfig).to(ApiConfig).inSingletonScope();
container.bind<IExpenseManager>(IExpenseManager).to(ExpenseManager).inSingletonScope();
container.bind<IUserManager>(IUserManager).to(UserManager).inSingletonScope();
container.bind<IExpenseApiClient>(IExpenseApiClient).to(ExpenseApiClient).inSingletonScope();
container.bind<IUsersApiClient>(IUsersApiClient).to(UsersApiClient).inSingletonScope();
container.bind<IAuthProvider>(IAuthProvider).to(AuthProvider).inSingletonScope();
container.bind<IColorConfiguration>(IColorConfiguration).to(ColorConfiguration).inSingletonScope();
container.bind<IStyleManager>(IStyleManager).to(StyleManager).inSingletonScope();
container.bind<IExpenseMapper>(IExpenseMapper).to(ExpenseMapper).inSingletonScope();
container.bind<IExpenseUpdateMapper>(IExpenseUpdateMapper).to(ExpenseUpdateMapper).inSingletonScope();
container.bind<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper).to(ExpenseUserDetailsMapper).inSingletonScope();
container.bind<IPersmissionRequester>(IPersmissionRequester).to(PermissionRequester).inSingletonScope();
container.bind<IImageConfiguration>(IImageConfiguration).to(ImageConfiguration).inSingletonScope();
container.bind<IRequestConfiguration>(IRequestConfiguration).to(RequestConfiguration).inSingletonScope();
container.bind<IPriceCalculator>(IPriceCalculator).to(PriceCalculator).inSingletonScope();
container.bind<IVenmoLinker>(IVenmoLinker).to(VenmoLinker).inSingletonScope();
container.bind<IVenmoConfiguration>(IVenmoConfiguration).to(VenmoConfiguration).inSingletonScope();
container.bind<IInviteViewModel>(IInviteViewModel).to(InviteViewModel).inSingletonScope();
container.bind<IHomeViewModel>(IHomeViewModel).to(HomeViewModel).inSingletonScope();
container.bind<IThemeViewModel>(IThemeViewModel).to(ThemeViewModel).inSingletonScope();
container.bind<IUiConfiguration>(IUiConfiguration).to(UiConfiguration).inSingletonScope();
export { container };
