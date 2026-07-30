import {Icon} from "../../../shared/components/Icon/Icon";
import "../styles/calls.scss";

export function CallsTopbar() {
    return (
        <header className="calls-topbar">
            <div className="calls-topbar__left">
                <h1>UPA Gestao Central</h1>
                <label className="calls-topbar__search">
                    <Icon name="search"/>
                    <input placeholder="Buscar paciente ou senha..." type="search"/>
                </label>
            </div>

            <div className="calls-topbar__actions">
                <button type="button" aria-label="Notificacoes"><Icon name="bell"/></button>
                <button type="button" aria-label="Configuracoes"><Icon name="settings"/></button>
                <div className="calls-topbar__user">
                    <div>
                        <strong>Admin Central</strong>
                        <span>Gestor de Fluxo</span>
                    </div>
                    <div className="calls-topbar__avatar">AC</div>
                </div>
            </div>
        </header>
    );
}
