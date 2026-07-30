import {useQuery} from "@tanstack/react-query";
import {callsService} from "../services/calls.service";

export function useCallsData() {
    return useQuery({
        queryKey: ["callsPageData"],
        queryFn: () => callsService.getPageData()
    });
}
