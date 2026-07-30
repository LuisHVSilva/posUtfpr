import {Router} from "express";
import {container} from "@infra/di/index.container";
import {PatientsController} from "@features/controllers/patients.controller";
import {buildPatientsRouter} from "@features/routes/patients.route";
import {QueueController} from "@features/controllers/queue.controller";
import {buildQueueRouter} from "@features/routes/queue.route";

const router: Router = Router();

const patientsController = container.resolve<PatientsController>("PatientsController");
const queueController = container.resolve<QueueController>("QueueController");

router.use("/patients", buildPatientsRouter({
    controller: patientsController,
}));

router.use("/queue", buildQueueRouter({
    controller: queueController,
}));

export {router};
