import {Button} from "../../../shared/components/Button/Button";
import {Card} from "../../../shared/components/Card/Card";
import {Icon} from "../../../shared/components/Icon/Icon";
import type {Room} from "../types/dashboard.types";
import "../styles/dashboard.scss";

type RoomCardProps = { room: Room; onFinish: (roomId: number) => void };
const statusLabels = {active: "ABERTO", emergency: "CRÍTICO", closed: "FECHADO"};

export function RoomCard({room, onFinish}: RoomCardProps) {
    const isClosed = room.status === "closed";
    return (
        <Card className={`room-card room-card--${room.status}`}>
            <div className="room-card__bar"/>
            <div className="room-card__body">
                <div className="room-card__heading">
                    <div>
                        <h3>{room.name}</h3>
                        <span>{room.specialty}</span>
                    </div>
                    <span className="status-badge">{statusLabels[room.status]}</span>
                </div>
                {isClosed ?
                    <div className="room-card__closed">
                        <Icon name="lock" size="1.8rem"/>
                        <span>Sala<br/>Indisponível</span>
                    </div>
                    :
                    <div className="room-card__details">
                        <div>
                            <span className="room-card__label">Senha atual</span>
                            <strong>{room.ticket}</strong>
                        </div>
                        <div>
                            <span className="room-card__label">Paciente</span>
                            <b>{room.patient}</b>
                        </div>
                    </div>
                }
            </div>
            <footer className="room-card__footer">
                <Button disabled={isClosed}
                        variant={room.status === "emergency" ? "danger" : "neutral"}
                        fullWidth
                        icon={<Icon name={isClosed ? "lock" : "check"}/>}
                        onClick={() => onFinish(room.id)}>{isClosed ? "Abrir Sala" : "Finalizar Atendimento"}
                </Button>
            </footer>
        </Card>
    );
}
