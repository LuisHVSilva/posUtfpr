import type {ReactNode} from "react";
import {Icon} from "../../shared/components/Icon/Icon";
import "./AdminLayout.scss";

type AdminLayoutProps = {children: ReactNode; activePath: string};
type NavigationItem = {label: string; path: string; icon: "dashboard" | "ticket" | "patients"};

const navigationItems: NavigationItem[] = [
  {label: "Dashboard", path: "/dashboard", icon: "dashboard"},
  {label: "Chamadas de Senha", path: "/chamadas", icon: "ticket"},
  {label: "Gestão de Pacientes", path: "/pacientes", icon: "patients"}
];

export function AdminLayout({children, activePath}: AdminLayoutProps) {
  return <div className="admin-layout">
    <aside className="admin-layout__sidebar"><div className="admin-layout__identity"><Icon name="hospital" size="1.8rem" /><div><strong>UPA Central</strong><span>Administração</span></div></div><nav className="admin-layout__side-nav" aria-label="Módulos"><div>{navigationItems.map((item) => <a className={activePath === item.path ? "is-active" : ""} href={item.path} key={item.path}><Icon name={item.icon} /><span>{item.label}</span></a>)}</div><div className="admin-layout__side-footer"><a href="/suporte"><Icon name="help" /><span>Suporte</span></a><a className="is-danger" href="/"><Icon name="logout" /><span>Sair</span></a></div></nav></aside>
    <main className="admin-layout__main">{children}</main>
  </div>;
}
