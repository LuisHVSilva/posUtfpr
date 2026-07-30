import {useQuery} from "@tanstack/react-query";
import type {DashboardData} from "../types/dashboard.types";
import {dashboardService} from "../services/dashboard.service.ts";
import type {TriageType} from "../../../shared/types/metadata.type.ts";
import {metadataService} from "../../../shared/services/metadata.service.ts";

export function useDashboardData() {
    return useQuery<DashboardData>({
        queryKey: ["dashboardData"],
        queryFn: (): Promise<DashboardData> => dashboardService.getData(),
        staleTime: 1000 * 60,
        retry: 1,
    });
}

export function usePriorityDashboardList() {
    return useQuery<TriageType[]>({
        queryKey: ["prioritiesList"],
        queryFn: (): Promise<TriageType[]> => metadataService.listPriorities(),
        staleTime: 1000 * 60,
        retry: 1,
    })
}