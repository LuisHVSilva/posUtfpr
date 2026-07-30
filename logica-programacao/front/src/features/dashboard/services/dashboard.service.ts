import type {DashboardData} from "../types/dashboard.types";
import httpBase from "../../../api/httpBase.api.ts";
import {RoomsUrl} from "../../../api/endpoints.api.ts";
import {assertApiSuccess} from "../../../api/apiResponse.util.ts";

export class DashboardService {
    async getData(): Promise<DashboardData> {
        const {data} = await httpBase.get(RoomsUrl.summary);
        assertApiSuccess<DashboardData>(data);

        return data.result;
    }
}

export const dashboardService = new DashboardService();
