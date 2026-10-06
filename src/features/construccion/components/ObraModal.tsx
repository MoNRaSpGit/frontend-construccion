import { useState, type FormEvent } from "react";

type ObraModalProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: (nombre: string, direccion: string) => void;
};

export function ObraModal({ isSubmitting, errorMessage, onCancel, onConfirm }: ObraModalProps) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombre.trim() || isSubmitting) return;
    onConfirm(nombre.trim(), direccion.trim());
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="obra-modal-title">
        <h2 id="obra-modal-title">Nueva obra</h2>

        <form onSubmit={handleSubmit}>
          <label className="modal-field">
            <span>Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Edificio Costanera"
              autoFocus
              disabled={isSubmitting}
            />
          </label>

          <label className="modal-field">
            <span>Direccion (opcional)</span>
            <input
              type="text"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              placeholder="Calle y numero"
              disabled={isSubmitting}
            />
          </label>

          {errorMessage ? <p className="modal-error">{errorMessage}</p> : null}

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting || !nombre.trim()}>
              {isSubmitting ? "Guardando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
