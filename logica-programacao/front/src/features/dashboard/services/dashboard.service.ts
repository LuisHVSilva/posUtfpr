import type {DashboardData} from "../types/dashboard.types";

export class DashboardService {
  static getMockData(): DashboardData {
    return {summary: {activeRooms: 12, waitingPatients: 24, averageWait: "14m", emergencies: 3}, rooms: [
      {id: 1, name: "Consultório 01", specialty: "Clínica Médica", status: "active", ticket: "A-402", patient: "Carlos Alberto Silva"},
      {id: 2, name: "Consultório 02", specialty: "Emergência", status: "emergency", ticket: "E-001", patient: "Maria José Souza"},
      {id: 3, name: "Consultório 03", specialty: "Triagem", status: "closed"},
      {id: 4, name: "Consultório 04", specialty: "Pediatria", status: "active", ticket: "P-122", patient: "Lucas Mendes (Menor)"},
      {id: 5, name: "Consultório 05", specialty: "Geral", status: "active", ticket: "A-403", patient: "Fernando Costa"},
      {id: 6, name: "Consultório 06", specialty: "Observação 2", status: "active", ticket: "T-089", patient: "Ana Paula Lima"}
    ]};
  }

  // Implementação backend: substituir este método por um cliente HTTP quando a API estiver disponível.
  // static async getData(): Promise<DashboardData> { return apiClient.get("/dashboard"); }
}
