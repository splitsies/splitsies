import "reflect-metadata";
import { Container } from "inversify";
import { ILogger, Logger } from "@splitsies/utils";
const container = new Container();

container.bind<ILogger>(ILogger).to(Logger).inSingletonScope();

export { container };
