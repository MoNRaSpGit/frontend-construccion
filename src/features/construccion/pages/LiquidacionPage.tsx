import { useEffect, useState, type FormEvent } from "react";
import { createAnticipo, fetchLiquidacion } from "../construccion.client";
import type { LiquidacionItem } from "../construccion.types";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function LiquidacionPage() {
  const [mes, setMes] = useState(currentMonthKey());
  const [items, setItems] = useState<LiquidacionItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [anticipoAbierto, setAnticipoAbierto] = useState<number | null>(null);
  const [anticipoMonto, setAnticipoMonto] = useState("");
  const [isSavingAnticipo, setIsSavingAnticipo] = useState(false);

  function reload() {
    fetchLiquidacion(mes)
      .then(setItems)
      .catch(() => setErrorMessage("No se pudo calcular la liquidacion."));
  }

  useEffect(reload, [mes]);

  async function handleAnticipoSubmit(event: FormEvent<HTMLFormElement>, personalId: number) {
    event.preventDefault();
    const monto = Number(anticipoMonto);
    if (!monto || monto <= 0 || isSavingAnticipo) return;

    setIsSavingAnticipo(true);
    try {
      await createAnticipo({ personalId, fecha: todayKey(), monto });
      setAnticipoAbierto(null);
      setAnticipoMonto("");
      reload();
    } catch {
      setErrorMessage("No se pudo registrar el anticipo.");
    } finally {
      setIsSavingAnticipo(false);
    }
  }

  const totalGeneral = items?.reduce((sum, item) => sum + item.totalAPagar, 0) ?? 0;

  return (
    <div className="obra-page">
      <header className="obra-header">
        <div>
          <h1>Liquidacion</h1>
          <p>Jornales del mes menos anticipos, por trabajador.</p>
        </div>
      </header>

      <div className="day-picker">
        <input type="month" value={mes} onChange={(event) => setMes(event.target.value)} />
      </div>

      {errorMessage ? <p className="status-text status-error">{errorMessage}</p> : null}
      {!items && !errorMessage ? <p className="status-text">Cargando...</p> : null}

      {items && items.length > 0 ? (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-label">Total a pagar</div>
            <div className="summary-card-value">${totalGeneral.toFixed(0)}</div>
          </div>
        </div>
      ) : null}

      {items ? (
        <div className="card-grid">
          {items.length === 0 ? <p className="status-text">No hay personal activo para liquidar.</p> : null}
          {items.map((item) => (
            <div key={item.personalId} className="liquidacion-row">
              <div className="liquidacion-head">
                <span className="list-card-title">{item.nombre}</span>
                <span className="liquidacion-total">${item.totalAPagar.toFixed(0)}</span>
              </div>
              <div className="liquidacion-detail">
                <span>{item.cargo}</span>
                <span>{item.diasPresentes} dias completos</span>
                <span>{item.diasMedios} medios dias</span>
                <span>Jornal ${item.jornal}</span>
                {item.totalAnticipos > 0 ? <span>Anticipos: -${item.totalAnticipos.toFixed(0)}</span> : null}
              </div>

              {anticipoAbierto === item.personalId ? (
                <form className="liquidacion-anticipo-form" onSubmit={(event) => handleAnticipoSubmit(event, item.personalId)}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Monto del anticipo"
                    value={anticipoMonto}
                    onChange={(event) => setAnticipoMonto(event.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="icon-button" disabled={isSavingAnticipo}>
                    {isSavingAnticipo ? "..." : "Registrar"}
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setAnticipoAbierto(null);
                      setAnticipoMonto("");
                    }}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="icon-button"
                  style={{ marginTop: 10 }}
                  onClick={() => setAnticipoAbierto(item.personalId)}
                >
                  + Anticipo
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
