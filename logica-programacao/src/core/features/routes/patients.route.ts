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
        "/new",
        asyncHandlerMiddleware((req, res) =>
            controller.registerPatient(req, res))
    );

    return router;
}

export {buildPatientsRouter};


