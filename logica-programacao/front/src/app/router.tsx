import {DashboardPage} from "../features/dashboard";
import {CallsPage} from "../features/calls";
import {PacientsPage} from "../features/pacients";

export class AppRouter {
    static render() {
        const path = window.location.pathname;

        if (path === "/senhas" || path === "/chamadas") {
            return <CallsPage/>;
        }

        if (path === "/pacientes") {
            return <PacientsPage/>;
        }

        return <DashboardPage/>;
    }
}
