import httpBase from "../../../api/httpBase.api.ts";
import {assertApiSuccess} from "../../../api/apiResponse.util.ts";
import {QueueUrl} from "../../../api/endpoints.api.ts";
import type {CallsPageData} from "../types/calls.types";

export class CallsService {
    async getPageData(): Promise<CallsPageData> {
        const {data} = await httpBase.get(QueueUrl.calls);
        assertApiSuccess<CallsPageData["display"]>(data);

        return {
            display: data.result,
        };
    }
}

export const callsService = new CallsService();
