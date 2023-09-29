import "reflect-metadata";
import { Container } from "inversify";
// import { ILogger, Logger } from "@splitsies/utils";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { ExpenseManager } from "../managers/expense-manager/expense-manager";
import { IApiConfig } from "../models/configuration/api-config/api-config-interface";
import { ApiConfig } from "../models/configuration/api-config/api-config";
import { IUsersApiClient } from "../api/users-api-client/users-api-client-interface";
import { UsersApiClient } from "../api/users-api-client/users-api-client";
// import { ILogger, Logger } from "@splitsies/utils";
import { IExpenseApiClient } from "../api/expense-api-client/expense-api-client-interface";
import { ExpenseApiClient } from "../api/expense-api-client/expense-api-client";
const container = new Container();

// container.bind<ILogger>(ILogger).to(Logger).inSingletonScope();

container.bind<IApiConfig>(IApiConfig).to(ApiConfig).inSingletonScope();
container.bind<IExpenseManager>(IExpenseManager).to(ExpenseManager).inSingletonScope();
container.bind<IExpenseApiClient>(IExpenseApiClient).to(ExpenseApiClient).inSingletonScope();
container.bind<IUsersApiClient>(IUsersApiClient).to(UsersApiClient).inSingletonScope();

export { container };
