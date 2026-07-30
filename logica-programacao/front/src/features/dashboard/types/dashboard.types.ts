export type RoomStatus = "active" | "emergency" | "closed";

export type Room = {id: number; name: string; specialty: string; status: RoomStatus; ticket?: string; patient?: string};
export type DashboardSummary = {activeRooms: number; waitingPatients: number; averageWait: string; emergencies: number};
export type DashboardData = {summary: DashboardSummary; rooms: Room[]};
