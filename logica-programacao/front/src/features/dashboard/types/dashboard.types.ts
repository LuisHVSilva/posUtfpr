export type RoomStatus = "active" | "emergency" | "closed";

export type Room = {
    id: number;
    name: string;
    specialty: string;
    queueType: "TRIAGE" | "TREATMENT";
    status: RoomStatus;
    ticket?: string;
    patient?: string;
};

export type DashboardSummary = {
    activeRooms: number;
    waitingPatients: number;
    averageWait: string;
    emergencies: number
};

// export type DashboardData = { summary: DashboardSummary; rooms: Room[] };
export type DashboardData = {
    activeRooms: number;
    waitingPatients: number;
    averageWait: string;
    emergencies: number; rooms: Room[]
};
