import {useSystemClock} from "../hooks/useSystemClock";
import type {QueueStat} from "../types/calls.types";
import "../styles/calls.scss";

type CallsStatsBarProps = {
    stats: QueueStat[];
};

export function CallsStatsBar({stats}: CallsStatsBarProps) {
    const time = useSystemClock();

    return (
        <footer className="calls-stats-bar">
            <div className="calls-stats-bar__items">
                {stats.map((stat) => (
                    <article className={`calls-stats-bar__item calls-stats-bar__item--${stat.tone}`} key={stat.label}>
                        <span aria-hidden="true"/>
                        <div>
                            <p>{stat.label}</p>
                            <strong>{stat.value}</strong>
                        </div>
                    </article>
                ))}
            </div>

            <div className="calls-stats-bar__clock">
                <p>Relogio do Sistema</p>
                <strong>{time}</strong>
            </div>
        </footer>
    );
}
