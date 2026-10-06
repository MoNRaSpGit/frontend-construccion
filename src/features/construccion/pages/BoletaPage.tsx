import { useEffect, useState } from "react";
import { fetchLiquidacion, fetchObras, fetchPersonal } from "../construccion.client";
import type { LiquidacionItem, Obra, Personal } from "../construccion.types";

const EMPRESA_NOMBRE = "Constructora Vanguardia SRL";
const EMPRESA_RUT = "21 456789 0012";
const EMPRESA_DIRECCION = "Bulevar Artigas 2845, Montevideo";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

// RUT/CI inventado pero estable por persona (siempre el mismo numero para
// el mismo trabajador, pedido explicito: "rut inventado" para que la
// boleta se vea prolija y completa).
function rutFalso(personalId: number, nombre: string) {
  let seed = personalId * 7919;
  for (let i = 0; i < nombre.length; i++) seed += nombre.charCodeAt(i) * (i + 1);
  const base = seed % 900000;
  const digits = String(1000000 + base).slice(-6);
  const verificador = seed % 9;
  return `C.I. ${digits.slice(0, 3)}.${digits.slice(3)}-${verificador}`;
}

function formatMoney(value: number) {
  return `$ ${value.toLocaleString("es-UY", { maximumFractionDigits: 0 })}`;
}

function formatMesLabel(mes: string) {
  const [anio, mesNumero] = mes.split("-").map(Number);
  return `${MESES[mesNumero - 1]} ${anio}`;
}

function formatFechaHoy() {
  const now = new Date();
  return now.toLocaleDateString("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function BoletaPage({ personalId, mes, onBack }: { personalId: number; mes: string; onBack: () => void }) {
  const [persona, setPersona] = useState<Personal | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [item, setItem] = useState<LiquidacionItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPersonal(), fetchObras(), fetchLiquidacion(mes)])
      .then(([personalData, obrasData, liquidacionData]) => {
        const encontrada = personalData.find((candidato) => candidato.id === personalId) ?? null;
        const liquidacionItem = liquidacionData.find((candidato) => candidato.personalId === personalId) ?? null;
        setPersona(encontrada);
        setObras(obrasData);
        setItem(liquidacionItem);
      })
      .catch(() => setErrorMessage("No se pudo armar la boleta."));
  }, [personalId, mes]);

  if (errorMessage) {
    return (
      <div className="obra-page">
        <p className="status-text status-error">{errorMessage}</p>
        <button type="button" className="ghost-button no-print" onClick={onBack}>
          Volver
        </button>
      </div>
    );
  }

  if (!persona || !item) {
    return (
      <div className="obra-page">
        <p className="status-text">Cargando boleta...</p>
      </div>
    );
  }

  const obraNombre = persona.obraId ? obras.find((obra) => obra.id === persona.obraId)?.nombre ?? "Sin asignar" : "Sin asignar";
  const diasPagados = item.diasPresentes + item.diasMedios * 0.5;

  return (
    <div className="obra-page boleta-page">
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button type="button" className="ghost-button" onClick={onBack}>
          {"‹"} Volver a Pagos
        </button>
        <button type="button" className="primary-button" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="boleta-card">
        <div className="boleta-header">
          <div>
            <div className="boleta-empresa">{EMPRESA_NOMBRE}</div>
            <div className="boleta-empresa-sub">RUT {EMPRESA_RUT}</div>
            <div className="boleta-empresa-sub">{EMPRESA_DIRECCION}</div>
          </div>
          <div className="boleta-folio">
            <div className="boleta-folio-label">Boleta de pago</div>
            <div className="boleta-folio-num">N.o {String(persona.id).padStart(4, "0")}-{mes.replace("-", "")}</div>
            <div className="boleta-folio-fecha">Emitida el {formatFechaHoy()}</div>
          </div>
        </div>

        <div className="boleta-divider" />

        <div className="boleta-datos">
          <div>
            <span className="boleta-datos-label">Trabajador</span>
            <strong>{persona.nombre}</strong>
          </div>
          <div>
            <span className="boleta-datos-label">Documento</span>
            <strong>{rutFalso(persona.id, persona.nombre)}</strong>
          </div>
          <div>
            <span className="boleta-datos-label">Cargo</span>
            <strong>{persona.cargo}</strong>
          </div>
          <div>
            <span className="boleta-datos-label">Obra</span>
            <strong>{obraNombre}</strong>
          </div>
          <div>
            <span className="boleta-datos-label">Periodo liquidado</span>
            <strong>{formatMesLabel(mes)}</strong>
          </div>
        </div>

        <table className="boleta-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Detalle</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dias completos trabajados</td>
              <td>{item.diasPresentes} dia(s)</td>
              <td>{formatMoney(item.diasPresentes * item.jornal)}</td>
            </tr>
            <tr>
              <td>Medias jornadas</td>
              <td>{item.diasMedios} dia(s)</td>
              <td>{formatMoney(item.diasMedios * item.jornal * 0.5)}</td>
            </tr>
            <tr>
              <td>Jornal diario de referencia</td>
              <td>{diasPagados} dia(s) pagos</td>
              <td>{formatMoney(item.jornal)}</td>
            </tr>
            <tr className="boleta-subtotal">
              <td colSpan={2}>Subtotal jornales</td>
              <td>{formatMoney(item.totalJornales)}</td>
            </tr>
            <tr>
              <td>Anticipos descontados</td>
              <td>Adelantos del mes</td>
              <td className="boleta-negativo">
                {item.totalAnticipos > 0 ? `- ${formatMoney(item.totalAnticipos)}` : formatMoney(0)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="boleta-total">
          <span>Total neto a pagar</span>
          <strong>{formatMoney(item.totalAPagar)}</strong>
        </div>

        <div className="boleta-firmas">
          <div className="boleta-firma">
            <div className="boleta-firma-linea" />
            <span>Firma del empleador</span>
          </div>
          <div className="boleta-firma">
            <div className="boleta-firma-linea" />
            <span>Firma del trabajador</span>
          </div>
        </div>
      </div>
    </div>
  );
}
