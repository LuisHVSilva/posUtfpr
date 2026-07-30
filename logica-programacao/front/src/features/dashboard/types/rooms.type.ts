export type RoomsType = {
    id?: number;
    name: string;
    isActive: boolean;
    isEmpty: boolean;
    type: string;
}

export type RoomsInfoResponse = {
    rooms: RoomsType[],
    totalActives: number,
    totalInactives: number
}