// Pantalla de ingreso SIN contraseña (09/10/2026, pedido explicito: "que
// vuelva al login... le da al boton y entra directo, pero para saber si
// se loguearon"). No protege nada: existe para que cada vez que alguien
// abre la app quede registrado un inicio de sesion (ver
// shared/state/activityLog.ts).
export function LoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <span className="brand-mark login-brand">
          <span className="brand-stripe" />
          Control de Obra
        </span>
        <p className="login-sub">Personal, asistencia, seguridad y pagos de tus obras.</p>
        <button type="button" className="primary-button login-button" onClick={onLogin} autoFocus>
          Ingresar
        </button>
      </div>
    </div>
  );
}
