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

export { container };
