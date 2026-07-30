import {RoomCard} from "./RoomCard";
import type {Room} from "../types/dashboard.types";

export function RoomGrid({rooms, onFinish}: { rooms: Room[]; onFinish: (roomId: number) => void }) {
    return (
        <section className="room-grid" aria-label="Salas de atendimento">{
            rooms.map((room) =>
                <RoomCard key={room.id}
                          room={room}
                          onFinish={onFinish}/>)
        }
        </section>
    )
}
