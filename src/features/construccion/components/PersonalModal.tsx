import { useState, type FormEvent } from "react";
import { CARGOS } from "../construccion.types";
import type { Obra } from "../construccion.types";

type PersonalModalProps = {
  obras: Obra[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: (input: {
    nombre: string;
    cargo: string;
    telefono: string;
    obraId: number | undefined;
    jornal: number;
    fechaIngreso: string;
  }) => void;
};

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function PersonalModal({ obras, isSubmitting, errorMessage, onCancel, onConfirm }: PersonalModalProps) {
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState<string>(CARGOS[2]);
  const [telefono, setTelefono] = useState("");
  const [obraId, setObraId] = useState<string>("");
  const [jornal, setJornal] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(todayKey());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const jornalNumber = Number(jornal);
    if (!nombre.trim() || !jornal || Number.isNaN(jornalNumber) || jornalNumber <= 0 || isSubmitting) return;

    onConfirm({
      nombre: nombre.trim(),
      cargo,
      telefono: telefono.trim(),
      obraId: obraId ? Number(obraId) : undefined,
      jornal: jornalNumber,
      fechaIngreso
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="personal-modal-title">
        <h2 id="personal-modal-title">Nuevo trabajador</h2>

        <form onSubmit={handleSubmit}>
          <label className="modal-field">
            <span>Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Nombre y apellido"
              autoFocus
              disabled={isSubmitting}
            />
          </label>

          <label className="modal-field">
            <span>Cargo</span>
            <select value={cargo} onChange={(event) => setCargo(event.target.value)} disabled={isSubmitting}>
              {CARGOS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="modal-field">
            <span>Obra asignada</span>
            <select value={obraId} onChange={(event) => setObraId(event.target.value)} disabled={isSubmitting}>
              <option value="">Sin asignar</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="modal-field">
            <span>Jornal ($/dia)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={jornal}
              onChange={(event) => setJornal(event.target.value)}
              placeholder="2500"
              disabled={isSubmitting}
            />
          </label>

          <label className="modal-field">
            <span>Celular</span>
            <input
              type="tel"
              value={telefono}
              onChange={(event) => setTelefono(event.target.value)}
              placeholder="099123456"
              disabled={isSubmitting}
            />
          </label>

          <label className="modal-field">
            <span>Fecha de ingreso</span>
            <input
              type="date"
              value={fechaIngreso}
              onChange={(event) => setFechaIngreso(event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          {errorMessage ? <p className="modal-error">{errorMessage}</p> : null}

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting || !nombre.trim() || !jornal}>
              {isSubmitting ? "Guardando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
