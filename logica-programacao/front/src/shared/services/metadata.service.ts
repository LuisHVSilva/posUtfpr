import httpBase from "../../api/httpBase.api.ts";
import {MetadataUrl} from "../../api/endpoints.api.ts";
import {assertApiSuccess} from "../../api/apiResponse.util.ts";
import type {TriageType} from "../types/metadata.type.ts";


export class MetadataService {
    async listPriorities(): Promise<TriageType[]> {
        const {data} = await httpBase.get(MetadataUrl.priorities);
        assertApiSuccess<TriageType[]>(data);
        //
        return data.result;
    }
}

export const metadataService = new MetadataService();
