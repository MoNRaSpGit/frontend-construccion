import { useEffect, useState } from "react";
import { fetchAsistencias, fetchLiquidacion, fetchObras, fetchPersonal } from "../construccion.client";
import type { Obra, Personal } from "../construccion.types";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

type Route = "home" | "obras" | "personal" | "asistencia" | "liquidacion";

export function DashboardPage({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const [obras, setObras] = useState<Obra[] | null>(null);
  const [personal, setPersonal] = useState<Personal[] | null>(null);
  const [presentesHoy, setPresentesHoy] = useState<number | null>(null);
  const [gastoMes, setGastoMes] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchObras(),
      fetchPersonal(),
      fetchAsistencias(todayKey()),
      fetchLiquidacion(currentMonthKey())
    ])
      .then(([obrasData, personalData, asistenciasHoy, liquidacion]) => {
        setObras(obrasData);
        setPersonal(personalData);
        setPresentesHoy(asistenciasHoy.filter((item) => item.estado !== "ausente").length);
        setGastoMes(liquidacion.reduce((sum, item) => sum + item.totalAPagar, 0));
      })
      .catch(() => setErrorMessage("No se pudo cargar el resumen."));
  }, []);

  const personalActivo = personal?.filter((item) => item.activo).length ?? null;
  const obrasActivas = obras?.filter((item) => item.activa).length ?? null;

  return (
    <div className="obra-page">
      <header className="obra-header">
        <div>
          <span className="brand-mark">
            <span className="brand-stripe" />
            Control de Obra
          </span>
          <p>Resumen general del personal y las obras.</p>
        </div>
      </header>

      {errorMessage ? <p className="status-text status-error">{errorMessage}</p> : null}

      <div className="summary-grid">
        <SummaryCard label="Personal activo" value={personalActivo} />
        <SummaryCard label="Presentes hoy" value={presentesHoy} />
        <SummaryCard label="Obras activas" value={obrasActivas} />
        <SummaryCard label="Jornales este mes" value={gastoMes !== null ? `$${gastoMes.toFixed(0)}` : null} />
      </div>

      <h2 className="section-title">Accesos rapidos</h2>
      <div className="card-grid">
        <button type="button" className="list-card" onClick={() => onNavigate("asistencia")}>
          <div className="list-card-main">
            <span className="list-card-title">Marcar asistencia de hoy</span>
            <span className="list-card-sub">Presente, media jornada o ausente, por obra.</span>
          </div>
          <span className="tabbar-icon">{"\u{2705}"}</span>
        </button>

        <button type="button" className="list-card" onClick={() => onNavigate("personal")}>
          <div className="list-card-main">
            <span className="list-card-title">Personal</span>
            <span className="list-card-sub">Alta y edicion de trabajadores.</span>
          </div>
          <span className="tabbar-icon">{"\u{1F477}"}</span>
        </button>

        <button type="button" className="list-card" onClick={() => onNavigate("obras")}>
          <div className="list-card-main">
            <span className="list-card-title">Obras</span>
            <span className="list-card-sub">Sitios activos y finalizados.</span>
          </div>
          <span className="tabbar-icon">{"\u{1F3D7}"}</span>
        </button>

        <button type="button" className="list-card" onClick={() => onNavigate("liquidacion")}>
          <div className="list-card-main">
            <span className="list-card-title">Liquidacion mensual</span>
            <span className="list-card-sub">Cuanto hay que pagarle a cada uno.</span>
          </div>
          <span className="tabbar-icon">{"\u{1F4B0}"}</span>
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string | null }) {
  return (
    <div className="summary-card">
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-value">{value === null ? "..." : value}</div>
    </div>
  );
}
