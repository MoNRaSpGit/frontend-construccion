import { useEffect, useState } from "react";
import { PersonalModal } from "../components/PersonalModal";
import { createPersonal, fetchObras, fetchPersonal, updatePersonal } from "../construccion.client";
import type { Obra, Personal } from "../construccion.types";

export function PersonalPage() {
  const [personal, setPersonal] = useState<Personal[] | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  function reload() {
    Promise.all([fetchPersonal(), fetchObras()])
      .then(([personalData, obrasData]) => {
        setPersonal(personalData);
        setObras(obrasData);
      })
      .catch(() => setErrorMessage("No se pudo cargar el personal."));
  }

  useEffect(reload, []);

  async function handleCreate(input: {
    nombre: string;
    cargo: string;
    telefono: string;
    obraId: number | undefined;
    jornal: number;
    fechaIngreso: string;
  }) {
    setIsSubmitting(true);
    setModalError(null);
    try {
      await createPersonal(input);
      setIsModalOpen(false);
      reload();
    } catch {
      setModalError("No se pudo crear el trabajador.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActivo(item: Personal) {
    try {
      await updatePersonal(item.id, { activo: !item.activo });
      reload();
    } catch {
      setErrorMessage("No se pudo actualizar el trabajador.");
    }
  }

  function obraNombre(obraId: number | null) {
    if (!obraId) return "Sin asignar";
    return obras.find((obra) => obra.id === obraId)?.nombre ?? "Sin asignar";
  }

  return (
    <div className="obra-page">
      <header className="obra-header">
        <div>
          <h1>Personal</h1>
          <p>Trabajadores y a que obra estan asignados.</p>
        </div>
      </header>

      {errorMessage ? <p className="status-text status-error">{errorMessage}</p> : null}
      {!personal && !errorMessage ? <p className="status-text">Cargando...</p> : null}

      {personal ? (
        <div className="card-grid">
          {personal.length === 0 ? <p className="status-text">Todavia no hay personal cargado.</p> : null}
          {personal.map((item) => (
            <div key={item.id} className="list-card">
              <div className="list-card-main">
                <span className="list-card-title">{item.nombre}</span>
                <span className="list-card-sub">
                  {item.cargo} &middot; {obraNombre(item.obraId)} &middot; ${item.jornal}/dia
                </span>
              </div>
              <div className="row-actions">
                <span className={item.activo ? "pill pill-ok" : "pill pill-muted"}>
                  {item.activo ? "Activo" : "Inactivo"}
                </span>
                <button type="button" className="icon-button" onClick={() => toggleActivo(item)}>
                  {item.activo ? "Dar de baja" : "Reactivar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <button type="button" className="fab" onClick={() => setIsModalOpen(true)} aria-label="Nuevo trabajador">
        +
      </button>

      {isModalOpen ? (
        <PersonalModal
          obras={obras.filter((obra) => obra.activa)}
          isSubmitting={isSubmitting}
          errorMessage={modalError}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleCreate}
        />
      ) : null}
    </div>
  );
}
