import { useEffect, useState } from "react";
import { trackActivity } from "../../shared/state/activityLog";
import { AsistenciaPage } from "./pages/AsistenciaPage";
import { BoletaPage } from "./pages/BoletaPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LiquidacionPage } from "./pages/LiquidacionPage";
import { LoginPage } from "./pages/LoginPage";
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

// Como se nombra cada pantalla en el registro interno de uso.
const ROUTE_LABELS: Record<Route, string> = {
  home: "Resumen",
  asistencia: "Asistencia",
  seguridad: "Seguridad",
  personal: "Personal",
  obras: "Obras",
  liquidacion: "Pagos",
  boleta: "Boleta de pago"
};

// Si la app queda en segundo plano mas de este tiempo, al volver pide
// ingresar de nuevo (en el celular "cerrar la app" muchas veces es solo
// mandarla al fondo, y sin esto nunca volveria a pasar por el login).
const BACKGROUND_LOGOUT_MS = 30 * 60 * 1000;

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
  // La sesion vive solo en memoria, a proposito: cerrar la app, cerrar la
  // pestana o recargar vuelve siempre a la pantalla de ingreso.
  const [loggedIn, setLoggedIn] = useState(false);

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

  // Registro interno de uso: un "login" al tocar Ingresar, una "seccion"
  // cada vez que se cambia de pantalla (incluida la primera despues de
  // ingresar) y un "logout" al salir.
  useEffect(() => {
    if (loggedIn) trackActivity("seccion", ROUTE_LABELS[route]);
  }, [route, loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    let hiddenAt: number | null = null;

    function handleVisibilityChange() {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt !== null && Date.now() - hiddenAt > BACKGROUND_LOGOUT_MS) {
        trackActivity("logout", "Sesion cerrada sola por inactividad");
        setLoggedIn(false);
      }
      hiddenAt = null;
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loggedIn]);

  function handleLogin() {
    trackActivity("login");
    setLoggedIn(true);
  }

  function handleLogout() {
    trackActivity("logout");
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {route === "home" ? <DashboardPage onNavigate={goTo} onLogout={handleLogout} /> : null}
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
