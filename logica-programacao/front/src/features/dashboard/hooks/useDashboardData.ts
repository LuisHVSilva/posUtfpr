import {useState} from "react";
import {DashboardService} from "../services/dashboard.service";
import type {DashboardData} from "../types/dashboard.types";

export function useDashboardData(): DashboardData {
  const [data] = useState(DashboardService.getMockData);
  return data;
}
