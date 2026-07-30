import {Icon} from "../../../shared/components/Icon/Icon";
import type {CallPanel} from "../types/calls.types";
import "../styles/calls.scss";

type CallPanelCardProps = {
    panel: CallPanel;
};

export function CallPanelCard({panel}: CallPanelCardProps) {
    const panelIcon = panel.tone === "triage" ? "stethoscope" : "medicalBox";

    return (
        <section className={`call-panel call-panel--${panel.tone}`}>
            <header className="call-panel__header">
                <h2>{panel.title}</h2>
                <Icon name={panelIcon}/>
            </header>

            <div className="call-panel__body">
                <article className="call-panel__current">
                    <span>Chamando Agora</span>
                    <strong>{panel.currentCode}</strong>
                    <p><Icon name="door"/>{panel.currentRoom}</p>
                </article>

                <div className="call-panel__history">
                    <h3>Ultimas Chamadas</h3>
                    <div>
                        {panel.history.map((item) => (
                            <article key={`${item.code}-${item.room}`}>
                                <strong>{item.code}</strong>
                                <span>{item.room}</span>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
