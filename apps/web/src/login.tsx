import { useEffect, useState, type FormEvent } from "react";
import { BalanceScene } from "./balance-scene";
import { Brand } from "./brand";
import { PasswordField } from "./password-field";

type User = { name: string; email: string };
type View = "login" | "forgot" | "reset";
async function api(path: string, body?: object) {
  return fetch(path, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    signal: AbortSignal.timeout(15000),
    ...(body
      ? {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
}
export function Login() {
  const [theme] = useState(
    () => (["violet", "peach", "aqua"] as const)[Math.floor(Math.random() * 3)],
  );
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [view, setView] = useState<View>(
    location.pathname === "/recuperar" ? "reset" : "login",
  );
  const [token] = useState(() =>
    new URLSearchParams(location.search).get("token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (location.pathname === "/recuperar")
      history.replaceState(null, "", "/recuperar");
    let active = true;
    api("/api/me")
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (active) setUser(data.user);
        } else if (response.status !== 401) throw new Error();
      })
      .catch(() => {
        if (active)
          setError(
            "No pudimos conectar. Comprueba los servicios y recarga la página.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  function switchView(next: View) {
    setView(next);
    setPasswordVisible(false);
    setConfirmVisible(false);
    setError("");
    setMessage("");
    setPassword("");
    setConfirm("");
    history.replaceState(null, "", "/");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (view === "reset" && password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      if (view === "login") {
        const response = await api("/api/auth/sign-in/email", {
          email: email.trim().toLowerCase(),
          password,
          rememberMe: true,
        });
        if (!response.ok) {
          setError(
            response.status === 429
              ? "Demasiados intentos. Espera un momento y vuelve a intentar."
              : "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
          );
          return;
        }
        const session = await api("/api/me");
        if (!session.ok) throw new Error();
        setUser((await session.json()).user);
        setPassword("");
        setPasswordVisible(false);
        setConfirmVisible(false);
      } else if (view === "forgot") {
        const response = await api("/api/auth/request-password-reset", {
          email: email.trim().toLowerCase(),
          redirectTo: `${location.origin}/recuperar`,
        });
        if (!response.ok) throw new Error();
        setMessage(
          "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña. Revisa también la carpeta de spam.",
        );
      } else {
        const response = await api("/api/auth/reset-password", {
          token,
          newPassword: password,
        });
        if (!response.ok) {
          setError("El enlace venció o ya fue utilizado. Solicita uno nuevo.");
          return;
        }
        setUser(null);
        switchView("login");
        setMessage(
          "Contraseña actualizada. Inicia sesión con tu nueva contraseña.",
        );
      }
    } catch {
      setError(
        "No pudimos completar la solicitud. Intenta nuevamente en unos momentos.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await api("/api/auth/sign-out", {});
      if (!response.ok) throw new Error();
      setUser(null);
      switchView("login");
    } catch {
      setError("No pudimos cerrar la sesión. Intenta nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="app-shell" data-theme={theme}>
      <main className="auth-layout">
        <Brand backHref="/inicio" />
        <section className="auth-content" aria-labelledby="title">
          <h1 id="title">
            {loading
              ? "Un momento…"
              : user && view !== "reset"
                ? `Hola, ${user.name}`
                : view === "forgot"
                  ? "Recupera tu acceso"
                  : view === "reset"
                    ? "Nueva contraseña"
                    : "Bienvenido de nuevo"}
          </h1>
          {loading ? (
            <p role="status">Estamos comprobando tu sesión.</p>
          ) : user && view !== "reset" ? (
            <>
              <p>
                Has iniciado sesión como <strong>{user.email}</strong>.
              </p>
              <p>
                Pronto podrás configurar tu cuenta y registrar tus movimientos.
              </p>
              <button onClick={logout} disabled={busy}>
                Cerrar sesión
              </button>
            </>
          ) : view === "reset" && !token ? (
            <>
              <p>
                Este enlace no es válido. Solicita uno nuevo para recuperar tu
                acceso.
              </p>
              <button onClick={() => switchView("forgot")}>
                Solicitar otro enlace
              </button>
            </>
          ) : (
            <>
              <p>
                {view === "login"
                  ? "Ingresa a tu espacio de finanzas personales."
                  : view === "forgot"
                    ? "Escribe tu correo y te enviaremos un enlace válido por 30 minutos."
                    : "Elige una contraseña de entre 8 y 128 caracteres."}
              </p>
              <form onSubmit={submit}>
                {view !== "reset" && (
                  <label htmlFor="email">
                    Correo electrónico
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={busy}
                    />
                  </label>
                )}
                {view !== "forgot" && (
                  <PasswordField
                    id="password"
                    label={view === "reset" ? "Nueva contraseña" : "Contraseña"}
                    value={password}
                    visible={passwordVisible}
                    disabled={busy}
                    autoComplete={
                      view === "reset" ? "new-password" : "current-password"
                    }
                    onChange={setPassword}
                    onToggle={() => setPasswordVisible((current) => !current)}
                  />
                )}
                {view === "reset" && (
                  <PasswordField
                    id="confirm"
                    label="Confirma tu contraseña"
                    value={confirm}
                    visible={confirmVisible}
                    disabled={busy}
                    autoComplete="new-password"
                    onChange={setConfirm}
                    onToggle={() => setConfirmVisible((current) => !current)}
                  />
                )}
                <button type="submit" disabled={busy}>
                  {busy
                    ? "Procesando…"
                    : view === "login"
                      ? "Iniciar sesión"
                      : view === "forgot"
                        ? "Enviar enlace"
                        : "Guardar contraseña"}
                </button>
              </form>
              {view === "login" ? (
                <div className="login-help">
                  <div className="recovery">
                    <h2>¿Olvidaste tu contraseña?</h2>
                    <p>
                      No te preocupes,{" "}
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => switchView("forgot")}
                      >
                        pulsa aquí para recuperarla
                      </button>
                      .
                    </p>
                  </div>
                  <p className="registration-link">
                    ¿No tienes cuenta?{" "}
                    <a className="text-button" href="/registro">
                      Regístrate aquí
                    </a>
                  </p>
                  <p className="invitation-note">
                    El acceso es por invitación.
                  </p>
                </div>
              ) : (
                <button
                  className="text-button back"
                  disabled={busy}
                  onClick={() => switchView("login")}
                >
                  Volver al inicio de sesión
                </button>
              )}
            </>
          )}
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}
        </section>
        <aside className="illustration-panel" aria-hidden="true">
          <BalanceScene />
        </aside>
      </main>
    </div>
  );
}
