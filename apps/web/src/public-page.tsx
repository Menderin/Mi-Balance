import { useState } from "react";
import { Brand } from "./brand";
import { BalanceScene } from "./balance-scene";

export function PublicPage({
  registration = false,
}: {
  registration?: boolean;
}) {
  const [theme] = useState(
    () => (["violet", "peach", "aqua"] as const)[Math.floor(Math.random() * 3)],
  );
  return (
    <div className="app-shell" data-theme={theme}>
      <main className="auth-layout">
        <Brand backHref={registration ? "/inicio" : undefined} />
        <section className="auth-content" aria-labelledby="title">
          <h1 id="title">
            {registration
              ? "Una invitación para empezar"
              : "Tu dinero, más claro."}
          </h1>
          {registration ? (
            <>
              <p>
                Mi Balance está en acceso temprano. Para crear tu cuenta
                necesitarás un enlace de invitación.
              </p>
              <p className="registration-notice">
                El registro por invitación aún está en preparación.
              </p>
              <p>¿Ya tienes una cuenta?</p>
              <a className="primary-link" href="/">
                Iniciar sesión
              </a>
            </>
          ) : (
            <>
              <p>
                Un espacio para entender cuánto dinero tienes y en qué se
                convierte.
              </p>
              <p>
                Estamos construyendo Mi Balance. El acceso y la recuperación ya
                están disponibles para quienes tienen una cuenta; las funciones
                de finanzas personales están en desarrollo.
              </p>
              <a className="primary-link" href="/">
                Iniciar sesión
              </a>
              <p className="registration-link">
                ¿No tienes cuenta?{" "}
                <a className="text-button" href="/registro">
                  Regístrate aquí
                </a>
              </p>
              <p className="invitation-note">El acceso es por invitación.</p>
            </>
          )}
        </section>
        <aside className="illustration-panel" aria-hidden="true">
          <BalanceScene />
        </aside>
      </main>
    </div>
  );
}
