import "reflect-metadata";
import {container} from "tsyringe";
import {PatientsController} from "@features/controllers/patients.controller";

container.registerSingleton<PatientsController>("PatientsController", PatientsController);

export {container}
