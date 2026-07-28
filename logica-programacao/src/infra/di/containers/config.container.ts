import "reflect-metadata";
import {container} from "tsyringe";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {ILogger} from "@infra/logger/logger.interface";
import {Logger} from "@infra/logger/logger";
import {APP_PATH} from "@infra/logger/logger.constants";

container.registerSingleton<JsonFileStore<any>>("JsonFileStore", JsonFileStore);
container.registerSingleton<ILogger>("ILogger", Logger);

container.register<ILogger>("ILogger", {
    useFactory: () =>
        new Logger({logFolder: APP_PATH,}),
});
export {container}