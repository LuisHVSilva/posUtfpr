import {injectable} from "tsyringe";
import type {Request, Response} from "express";
import {ApiResponseUtil} from "@shared/utils/apiResponse.util";
import {StatusCodes} from "http-status-codes";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";


@injectable()
export class MetadataController {
    constructor() {
    }

    async listPriorities(_req: Request, res: Response): Promise<Response> {
        try {
            const result = PriorityVo.getMetadata();

            return ApiResponseUtil.success(
                res,
                result,
                StatusCodes.OK,
            );
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }
}
