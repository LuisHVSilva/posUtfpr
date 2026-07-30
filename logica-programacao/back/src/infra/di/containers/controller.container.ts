import "reflect-metadata";
import {container} from "tsyringe";
import {PatientsController} from "@features/controllers/patients.controller";
import {QueueController} from "@features/controllers/queue.controller";

container.registerSingleton<PatientsController>("PatientsController", PatientsController);
container.registerSingleton<QueueController>("QueueController", QueueController);

export {container}
