import { useEffect, useState } from "react";
import { ObraModal } from "../components/ObraModal";
import { createObra, fetchObras, updateObra } from "../construccion.client";
import type { Obra } from "../construccion.types";

export function ObrasPage() {
  const [obras, setObras] = useState<Obra[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  function reload() {
    fetchObras()
      .then(setObras)
      .catch(() => setErrorMessage("No se pudieron cargar las obras."));
  }

  useEffect(reload, []);

  async function handleCreate(nombre: string, direccion: string) {
    setIsSubmitting(true);
    setModalError(null);
    try {
      await createObra({ nombre, direccion });
      setIsModalOpen(false);
      reload();
    } catch {
      setModalError("No se pudo crear la obra.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActiva(obra: Obra) {
    try {
      await updateObra(obra.id, { activa: !obra.activa });
      reload();
    } catch {
      setErrorMessage("No se pudo actualizar la obra.");
    }
  }

  return (
    <div className="obra-page">
      <header className="obra-header">
        <div>
          <h1>Obras</h1>
          <p>Sitios de trabajo activos y finalizados.</p>
        </div>
      </header>

      {errorMessage ? <p className="status-text status-error">{errorMessage}</p> : null}
      {!obras && !errorMessage ? <p className="status-text">Cargando...</p> : null}

      {obras ? (
        <div className="card-grid">
          {obras.length === 0 ? <p className="status-text">Todavia no hay obras creadas.</p> : null}
          {obras.map((obra) => (
            <div key={obra.id} className="list-card">
              <div className="list-card-main">
                <span className="list-card-title">{obra.nombre}</span>
                <span className="list-card-sub">{obra.direccion || "Sin direccion"}</span>
              </div>
              <div className="row-actions">
                <span className={obra.activa ? "pill pill-ok" : "pill pill-muted"}>
                  {obra.activa ? "Activa" : "Finalizada"}
                </span>
                <button type="button" className="icon-button" onClick={() => toggleActiva(obra)}>
                  {obra.activa ? "Finalizar" : "Reactivar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <button type="button" className="fab" onClick={() => setIsModalOpen(true)} aria-label="Nueva obra">
        +
      </button>

      {isModalOpen ? (
        <ObraModal
          isSubmitting={isSubmitting}
          errorMessage={modalError}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleCreate}
        />
      ) : null}
    </div>
  );
}
