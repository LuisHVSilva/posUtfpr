import {Router} from "express";
import {asyncHandlerMiddleware} from "@shared/middleware/asyncHandler.middleware";
import {MetadataController} from "@features/controllers/metadata.controller";

type buildMetadataRouterDeps = {
    controller: MetadataController;
};

function buildMetadataRouter(deps: buildMetadataRouterDeps): Router {
    const {
        controller,
    } = deps;
    const router: Router = Router();

    router.get(
        "/priorities",
        asyncHandlerMiddleware((req, res) =>
            controller.listPriorities(req, res))
    );

    return router;
}

export {buildMetadataRouter};


