import {Router} from "express";
import {asyncHandlerMiddleware} from "@shared/middleware/asyncHandler.middleware";
import {RoomsController} from "@features/controllers/rooms.controller";

type buildPatientsRouterDeps = {
    controller: RoomsController;
};

function buildRoomsRouter(deps: buildPatientsRouterDeps): Router {
    const {
        controller,
    } = deps;
    const router: Router = Router();

    router.get(
        "/summary",
        asyncHandlerMiddleware((req, res) =>
            controller.summary(req, res),
        ),
    );

    return router;
}

export {buildRoomsRouter};


