import { useEffect, useMemo, useState } from "react";
import { fetchAsistencias, fetchObras, fetchPersonal, fetchSeguridad, saveSeguridad } from "../construccion.client";
import type { Obra, Personal, SeguridadItem } from "../construccion.types";
import { SEGURIDAD_ITEMS, SEGURIDAD_ITEM_LABELS } from "../construccion.types";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

type Marca = {
  cumple: boolean;
  faltantes: SeguridadItem[];
};

export function SeguridadPage() {
  const [fecha, setFecha] = useState(todayKey());
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraFiltro, setObraFiltro] = useState<string>("");
  const [personal, setPersonal] = useState<Personal[] | null>(null);
  const [presentesHoy, setPresentesHoy] = useState<Set<number>>(new Set());
  const [marcas, setMarcas] = useState<Record<number, Marca>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchObras()
      .then(setObras)
      .catch(() => setErrorMessage("No se pudieron cargar las obras."));
  }, []);

  useEffect(() => {
    setSavedMessage(null);
    Promise.all([fetchPersonal(), fetchAsistencias(fecha), fetchSeguridad(fecha)])
      .then(([personalData, asistenciasData, seguridadData]) => {
        setPersonal(personalData.filter((item) => item.activo));
        setPresentesHoy(new Set(asistenciasData.filter((item) => item.estado !== "ausente").map((item) => item.personalId)));

        const marcasIniciales: Record<number, Marca> = {};
        seguridadData.forEach((item) => {
          marcasIniciales[item.personalId] = { cumple: item.cumple, faltantes: item.itemsFaltantes };
        });
        setMarcas(marcasIniciales);
      })
      .catch(() => setErrorMessage("No se pudo cargar el control de seguridad."));
  }, [fecha]);

  const personalFiltrado = useMemo(() => {
    if (!personal) return [];
    const presentes = personal.filter((item) => presentesHoy.has(item.id));
    if (!obraFiltro) return presentes;
    return presentes.filter((item) => item.obraId === Number(obraFiltro));
  }, [personal, presentesHoy, obraFiltro]);

  function obraNombre(obraId: number | null) {
    if (!obraId) return "Sin asignar";
    return obras.find((obra) => obra.id === obraId)?.nombre ?? "Sin asignar";
  }

  function marcaDe(personalId: number): Marca {
    return marcas[personalId] ?? { cumple: true, faltantes: [] };
  }

  function setCumple(personalId: number, cumple: boolean) {
    setMarcas((prev) => ({
      ...prev,
      [personalId]: cumple ? { cumple: true, faltantes: [] } : { cumple: false, faltantes: marcaDe(personalId).faltantes }
    }));
    setSavedMessage(null);
  }

  function toggleItem(personalId: number, item: SeguridadItem) {
    const actual = marcaDe(personalId);
    const faltantes = actual.faltantes.includes(item)
      ? actual.faltantes.filter((value) => value !== item)
      : [...actual.faltantes, item];
    setMarcas((prev) => ({ ...prev, [personalId]: { cumple: false, faltantes } }));
    setSavedMessage(null);
  }

  async function handleGuardar() {
    if (personalFiltrado.length === 0) return;

    const items = personalFiltrado.map((item) => {
      const marca = marcaDe(item.id);
      return { personalId: item.id, cumple: marca.cumple, itemsFaltantes: marca.faltantes };
    });

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveSeguridad(fecha, items);
      setSavedMessage(`Guardado: ${items.length} controlados.`);
    } catch {
      setErrorMessage("No se pudo guardar el control de seguridad.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="obra-page">
      <header className="obra-header">
        <div>
          <h1>Seguridad</h1>
          <p>Control de EPP de los que asistieron ese dia.</p>
        </div>
      </header>

      <div className="day-picker">
        <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
      </div>

      <div className="obra-filter">
        <select value={obraFiltro} onChange={(event) => setObraFiltro(event.target.value)}>
          <option value="">Todas las obras</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nombre}
            </option>
          ))}
        </select>
      </div>

      {errorMessage ? <p className="status-text status-error">{errorMessage}</p> : null}
      {savedMessage ? <p className="status-text">{savedMessage}</p> : null}
      {!personal && !errorMessage ? <p className="status-text">Cargando...</p> : null}

      {personal ? (
        <div className="card-grid">
          {personalFiltrado.length === 0 ? (
            <p className="status-text">No hay nadie marcado como presente ese dia todavia.</p>
          ) : null}
          {personalFiltrado.map((item) => {
            const marca = marcaDe(item.id);
            return (
              <div key={item.id} className="asistencia-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div className="asistencia-name">
                    <strong>{item.nombre}</strong>
                    <span>
                      {item.cargo} &middot; {obraNombre(item.obraId)}
                    </span>
                  </div>
                  <div className="estado-toggle">
                    <button
                      type="button"
                      className={marca.cumple ? "active-presente" : ""}
                      onClick={() => setCumple(item.id, true)}
                    >
                      Cumple
                    </button>
                    <button
                      type="button"
                      className={!marca.cumple ? "active-ausente" : ""}
                      onClick={() => setCumple(item.id, false)}
                    >
                      No cumple
                    </button>
                  </div>
                </div>

                {!marca.cumple ? (
                  <div className="card-grid" style={{ gap: 6 }}>
                    {SEGURIDAD_ITEMS.map((seguridadItem) => (
                      <label key={seguridadItem} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                        <input
                          type="checkbox"
                          checked={marca.faltantes.includes(seguridadItem)}
                          onChange={() => toggleItem(item.id, seguridadItem)}
                        />
                        Le falta {SEGURIDAD_ITEM_LABELS[seguridadItem]}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {personalFiltrado.length > 0 ? (
        <button type="button" className="primary-button" style={{ marginTop: 16 }} onClick={handleGuardar} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar seguridad"}
        </button>
      ) : null}
    </div>
  );
}
