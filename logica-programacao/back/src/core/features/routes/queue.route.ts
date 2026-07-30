import {Router} from "express";
import {asyncHandlerMiddleware} from "@shared/middleware/asyncHandler.middleware";
import {QueueController} from "@features/controllers/queue.controller";

type buildPatientsRouterDeps = {
    controller: QueueController;
};

function buildQueueRouter(deps: buildPatientsRouterDeps): Router {
    const {
        controller,
    } = deps;
    const router: Router = Router();

    router.get(
        "/calls",
        asyncHandlerMiddleware((req, res) =>
            controller.callsDisplay(req, res),
        ),
    );

    router.post(
        "/attendance",
        asyncHandlerMiddleware((req, res) =>
            controller.registerAttendance(req, res),
        ),
    );

    router.patch(
        "/triage/:roomId/finish",
        asyncHandlerMiddleware((req, res) =>
            controller.finishTriage(req, res),
        ),
    );

    router.patch(
        "/attendance/:roomId/finish",
        asyncHandlerMiddleware((req, res) =>
            controller.finishAttendance(req, res),
        ),
    );

    return router;
}

export {buildQueueRouter};


