import "reflect-metadata";
import {container} from "tsyringe";
import {PatientsController} from "@features/controllers/patients.controller";
import {QueueController} from "@features/controllers/queue.controller";
import {RoomsController} from "@features/controllers/rooms.controller";
import {MetadataController} from "@features/controllers/metadata.controller";

container.registerSingleton<PatientsController>("PatientsController", PatientsController);
container.registerSingleton<QueueController>("QueueController", QueueController);
container.registerSingleton<RoomsController>("RoomsController", RoomsController);
container.registerSingleton<MetadataController>("MetadataController", MetadataController);

export {container}
