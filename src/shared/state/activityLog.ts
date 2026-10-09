import { API_BASE_URL } from "../config/api";

// Registro interno de uso (09/10/2026, pedido explicito: "es para ver si
// mi cliente la esta usando"). No hay pantalla que lo muestre: la app
// avisa sola al backend cuando alguien ingresa, sale, cambia de pestana
// o guarda algo, y se consulta con
// backend/scripts/inspect-construccion-activity.js.
//
// "Quien" es un id que se genera solo la primera vez y queda guardado en
// el navegador -- es lo mas parecido a un login sin pedirle nada a nadie.
// Para que NUESTRAS propias pruebas no se confundan con las del cliente:
// entrar una vez con ?yo=1 en la direccion marca ese navegador como
// nuestro (el id pasa a empezar con "yo-").
const VISITOR_KEY = "construccion-visitor-id";

export type ActivityEvent = "login" | "logout" | "seccion" | "accion";

function randomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function resolveVisitorId() {
  try {
    const markAsOwn = new URLSearchParams(window.location.search).get("yo") === "1";
    let visitorId = window.localStorage.getItem(VISITOR_KEY);

    if (!visitorId || (markAsOwn && !visitorId.startsWith("yo-"))) {
      visitorId = `${markAsOwn ? "yo-" : ""}${randomId()}`.slice(0, 40);
      window.localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch {
    // Navegacion privada / storage bloqueado: igual se registra, pero
    // cada recarga cuenta como un visitante distinto.
    return randomId();
  }
}

// En localhost no se registra nada: el backend local apunta a la base
// real y las pruebas de desarrollo ensuciarian el registro.
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const visitorId = resolveVisitorId();

// Nunca rompe ni demora la app: si el aviso falla, se pierde y listo.
export function trackActivity(event: ActivityEvent, detail?: string) {
  if (isLocal) return;

  fetch(`${API_BASE_URL}/api/v1/construccion/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, event, detail: detail?.slice(0, 200) }),
    keepalive: true
  }).catch(() => {});
}
