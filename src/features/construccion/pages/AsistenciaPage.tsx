import { useEffect, useMemo, useState } from "react";
import { fetchAsistencias, fetchObras, fetchPersonal, saveAsistencias } from "../construccion.client";
import type { Asistencia, AsistenciaEstado, Obra, Personal } from "../construccion.types";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const ESTADO_LABEL: Record<AsistenciaEstado, string> = {
  presente: "Presente",
  media: "Media",
  ausente: "Ausente"
};

export function AsistenciaPage() {
  const [fecha, setFecha] = useState(todayKey());
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraFiltro, setObraFiltro] = useState<string>("");
  const [personal, setPersonal] = useState<Personal[] | null>(null);
  const [marcas, setMarcas] = useState<Record<number, AsistenciaEstado>>({});
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
    Promise.all([fetchPersonal(), fetchAsistencias(fecha)])
      .then(([personalData, asistenciasData]) => {
        setPersonal(personalData.filter((item) => item.activo));
        const marcasIniciales: Record<number, AsistenciaEstado> = {};
        asistenciasData.forEach((item: Asistencia) => {
          marcasIniciales[item.personalId] = item.estado;
        });
        setMarcas(marcasIniciales);
      })
      .catch(() => setErrorMessage("No se pudo cargar la asistencia."));
  }, [fecha]);

  const personalFiltrado = useMemo(() => {
    if (!personal) return [];
    if (!obraFiltro) return personal;
    return personal.filter((item) => item.obraId === Number(obraFiltro));
  }, [personal, obraFiltro]);

  function obraNombre(obraId: number | null) {
    if (!obraId) return "Sin asignar";
    return obras.find((obra) => obra.id === obraId)?.nombre ?? "Sin asignar";
  }

  function setEstado(personalId: number, estado: AsistenciaEstado) {
    setMarcas((prev) => ({ ...prev, [personalId]: estado }));
    setSavedMessage(null);
  }

  async function handleGuardar() {
    const items = personalFiltrado
      .filter((item) => marcas[item.id])
      .map((item) => ({ personalId: item.id, estado: marcas[item.id] }));

    if (items.length === 0) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveAsistencias(fecha, items);
      setSavedMessage(`Guardado: ${items.length} marcados.`);
    } catch {
      setErrorMessage("No se pudo guardar la asistencia.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="obra-page">
      <header className="obra-header">
        <div>
          <h1>Asistencia</h1>
          <p>Marca quien trabajo ese dia, por obra.</p>
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
          {personalFiltrado.length === 0 ? <p className="status-text">No hay personal activo para mostrar.</p> : null}
          {personalFiltrado.map((item) => {
            const estadoActual = marcas[item.id];
            return (
              <div key={item.id} className="asistencia-row">
                <div className="asistencia-name">
                  <strong>{item.nombre}</strong>
                  <span>
                    {item.cargo} &middot; {obraNombre(item.obraId)}
                  </span>
                </div>
                <div className="estado-toggle">
                  {(Object.keys(ESTADO_LABEL) as AsistenciaEstado[]).map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      className={estadoActual === estado ? `active-${estado}` : ""}
                      onClick={() => setEstado(item.id, estado)}
                    >
                      {ESTADO_LABEL[estado]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {personalFiltrado.length > 0 ? (
        <button type="button" className="primary-button" style={{ marginTop: 16 }} onClick={handleGuardar} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar asistencia"}
        </button>
      ) : null}
    </div>
  );
}
