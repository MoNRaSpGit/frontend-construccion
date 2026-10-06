import { useEffect, useState } from "react";
import { AsistenciaPage } from "./pages/AsistenciaPage";
import { BoletaPage } from "./pages/BoletaPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LiquidacionPage } from "./pages/LiquidacionPage";
import { ObrasPage } from "./pages/ObrasPage";
import { PersonalPage } from "./pages/PersonalPage";
import { SeguridadPage } from "./pages/SeguridadPage";

type Route = "home" | "obras" | "personal" | "asistencia" | "seguridad" | "liquidacion" | "boleta";

type ParsedRoute = { route: Route; boleta?: { personalId: number; mes: string } };

const TABS: { route: Route; label: string; icon: string }[] = [
  { route: "home", label: "Resumen", icon: "\u{1F4CB}" },
  { route: "asistencia", label: "Asistencia", icon: "\u{2705}" },
  { route: "seguridad", label: "Seguridad", icon: "\u{1F9BA}" },
  { route: "personal", label: "Personal", icon: "\u{1F477}" },
  { route: "obras", label: "Obras", icon: "\u{1F3D7}" },
  { route: "liquidacion", label: "Pagos", icon: "\u{1F4B0}" }
];

const BOLETA_PATTERN = /^boleta\/(\d+)\/(\d{4}-\d{2})$/;

function parseRoute(): ParsedRoute {
  const hash = window.location.hash.replace("#", "");

  const boletaMatch = hash.match(BOLETA_PATTERN);
  if (boletaMatch) {
    return { route: "boleta", boleta: { personalId: Number(boletaMatch[1]), mes: boletaMatch[2] } };
  }

  if (hash === "obras" || hash === "personal" || hash === "asistencia" || hash === "seguridad" || hash === "liquidacion") {
    return { route: hash };
  }

  return { route: "home" };
}

export function ConstruccionApp() {
  const [parsed, setParsed] = useState<ParsedRoute>(parseRoute());

  useEffect(() => {
    function handleHashChange() {
      setParsed(parseRoute());
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function goTo(nextRoute: Route) {
    window.location.hash = nextRoute === "home" ? "" : nextRoute;
    setParsed({ route: nextRoute });
  }

  function goToBoleta(personalId: number, mes: string) {
    window.location.hash = `boleta/${personalId}/${mes}`;
    setParsed({ route: "boleta", boleta: { personalId, mes } });
  }

  const route = parsed.route;

  return (
    <>
      {route === "home" ? <DashboardPage onNavigate={goTo} /> : null}
      {route === "obras" ? <ObrasPage /> : null}
      {route === "personal" ? <PersonalPage /> : null}
      {route === "asistencia" ? <AsistenciaPage /> : null}
      {route === "seguridad" ? <SeguridadPage /> : null}
      {route === "liquidacion" ? <LiquidacionPage onPagar={goToBoleta} /> : null}
      {route === "boleta" && parsed.boleta ? (
        <BoletaPage personalId={parsed.boleta.personalId} mes={parsed.boleta.mes} onBack={() => goTo("liquidacion")} />
      ) : null}

      {route !== "boleta" ? (
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
      ) : null}
    </>
  );
}
