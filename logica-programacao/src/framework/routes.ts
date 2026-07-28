import {Router} from "express";
import {container} from "@infra/di/index.container";
import {PatientsController} from "@features/controllers/patients.controller";
import {buildPatientsRouter} from "@features/routes/patients.route";

const router: Router = Router();

const patientsController = container.resolve<PatientsController>("PatientsController");

router.use("/patients", buildPatientsRouter({
    controller: patientsController,
}));

export {router};
