import {RoomCard} from "./RoomCard";
import type {Room} from "../types/dashboard.types";


type Props = {
    rooms: Room[],
    onStartFinishAttendance: (room: Room) => void,
}

export function RoomGrid({rooms, onStartFinishAttendance}: Props) {
    return (
        <section className="room-grid" aria-label="Salas de atendimento">{
            rooms.map((room) =>
                <RoomCard
                    key={room.id}
                    room={room}
                    onStartFinishAttendance={onStartFinishAttendance}
                />
            )
        }
        </section>
    )
}
