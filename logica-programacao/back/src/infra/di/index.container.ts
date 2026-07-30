import "reflect-metadata";
import {container} from "tsyringe";

import "@infra/di/containers/config.container";
import "@infra/di/containers/persistence.container";
import "@infra/di/containers/service.container";
import "@infra/di/containers/controller.container";

export {container};
