import {Router} from "express";
import {container} from "@infra/di/index.container";
import {PatientsController} from "@features/controllers/patients.controller";
import {buildPatientsRouter} from "@features/routes/patients.route";
import {QueueController} from "@features/controllers/queue.controller";
import {buildQueueRouter} from "@features/routes/queue.route";
import {RoomsController} from "@features/controllers/rooms.controller";
import {buildRoomsRouter} from "@features/routes/rooms.route";
import {buildMetadataRouter} from "@features/routes/metadata.route";
import {MetadataController} from "@features/controllers/metadata.controller";

const router: Router = Router();

const patientsController = container.resolve<PatientsController>("PatientsController");
const queueController = container.resolve<QueueController>("QueueController");
const roomsController = container.resolve<RoomsController>("RoomsController");
const metadataRouter = container.resolve<MetadataController>("MetadataController");

router.use("/patients", buildPatientsRouter({
    controller: patientsController,
}));

router.use("/queue", buildQueueRouter({
    controller: queueController,
}));

router.use("/rooms", buildRoomsRouter({
    controller: roomsController,
}));

router.use("/metadata", buildMetadataRouter({
    controller: metadataRouter,
}))

export {router};
