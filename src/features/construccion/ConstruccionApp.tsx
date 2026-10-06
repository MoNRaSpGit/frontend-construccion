import { useEffect, useState } from "react";
import { AsistenciaPage } from "./pages/AsistenciaPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LiquidacionPage } from "./pages/LiquidacionPage";
import { ObrasPage } from "./pages/ObrasPage";
import { PersonalPage } from "./pages/PersonalPage";

type Route = "home" | "obras" | "personal" | "asistencia" | "liquidacion";

const TABS: { route: Route; label: string; icon: string }[] = [
  { route: "home", label: "Resumen", icon: "\u{1F4CB}" },
  { route: "asistencia", label: "Asistencia", icon: "\u{2705}" },
  { route: "personal", label: "Personal", icon: "\u{1F477}" },
  { route: "obras", label: "Obras", icon: "\u{1F3D7}" },
  { route: "liquidacion", label: "Pagos", icon: "\u{1F4B0}" }
];

function readRoute(): Route {
  const hash = window.location.hash.replace("#", "");
  if (hash === "obras" || hash === "personal" || hash === "asistencia" || hash === "liquidacion") {
    return hash;
  }
  return "home";
}

export function ConstruccionApp() {
  const [route, setRoute] = useState<Route>(readRoute());

  useEffect(() => {
    function handleHashChange() {
      setRoute(readRoute());
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function goTo(nextRoute: Route) {
    window.location.hash = nextRoute === "home" ? "" : nextRoute;
    setRoute(nextRoute);
  }

  return (
    <>
      {route === "home" ? <DashboardPage onNavigate={goTo} /> : null}
      {route === "obras" ? <ObrasPage /> : null}
      {route === "personal" ? <PersonalPage /> : null}
      {route === "asistencia" ? <AsistenciaPage /> : null}
      {route === "liquidacion" ? <LiquidacionPage /> : null}

      <nav className="tabbar">
        {TABS.map((tab) => (
          <button
            key={tab.route}
            type="button"
            className={route === tab.route ? "tabbar-item tabbar-item-active" : "tabbar-item"}
            onClick={() => goTo(tab.route)}
          >
            <span className="tabbar-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
