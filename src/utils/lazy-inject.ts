import { container } from "../di/inversify.config";
import { interfaces } from "inversify";

export const lazyInject = <T>(sym: interfaces.ServiceIdentifier<T>): T => container.get<T>(sym);
