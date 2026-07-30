import {Router} from "express";
import {PatientsController} from "@features/controllers/patients.controller";
import {asyncHandlerMiddleware} from "@shared/middleware/asyncHandler.middleware";

type buildPatientsRouterDeps = {
    controller: PatientsController;
};

function buildPatientsRouter(deps: buildPatientsRouterDeps): Router {
    const {
        controller,
    } = deps;
    const router: Router = Router();

    router.post(
        "/",
        asyncHandlerMiddleware((req, res) =>
            controller.registerPatient(req, res))
    );

    router.get(
        "/summary",
        asyncHandlerMiddleware((req, res) =>
            controller.summary(req, res))
    );

    router.get(
        "/",
        asyncHandlerMiddleware((req, res) =>
            controller.listPatients(req, res))
    );

    router.patch(
        "/:id",
        asyncHandlerMiddleware((req, res) =>
            controller.updatePatient(req, res))
    );

    return router;
}

export {buildPatientsRouter};


