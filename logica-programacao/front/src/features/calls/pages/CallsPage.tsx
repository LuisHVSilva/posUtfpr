import {AdminLayout} from "../../../layouts/AdminLayout/AdminLayout";
import {Icon} from "../../../shared/components/Icon/Icon";
import {useCallsData} from "../hooks/useCallsData";
import {CallPanelCard} from "../components/CallPanelCard";
import {CallsStatsBar} from "../components/CallsStatsBar";
import {CallsTopbar} from "../components/CallsTopbar";
import "../styles/calls.scss";

export function CallsPage() {
    const {data} = useCallsData();

    if (!data) {
        return <AdminLayout activePath="/senhas"><h1>Erro de dado</h1></AdminLayout>;
    }

    const {display} = data;

    return (
        <AdminLayout activePath="/senhas" mainClassName="admin-layout__main--flush">
            <div className="calls-display">
                <CallsTopbar/>

                <div className="calls-display__canvas">
                    <section className="calls-alert" aria-label={display.alert}>
                        <div>
                            <Icon name="warning"/>
                            <strong>{display.alert}</strong>
                        </div>
                        <span>{display.systemStatus}</span>
                    </section>

                    <section className="calls-display__panels" aria-label="Painel de chamadas">
                        {display.panels.map((panel) => <CallPanelCard panel={panel} key={panel.title}/>)}
                    </section>

                    <CallsStatsBar stats={display.stats}/>
                </div>
            </div>
        </AdminLayout>
    );
}
