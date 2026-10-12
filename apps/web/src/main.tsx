import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setStatus("loading");
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch("/api/health/ready", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok || (await response.json()).status !== "ok")
          throw new Error();
        if (active) setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  return (
    <main>
      <p className="brand">MI BALANCE</p>
      <h1>Tu dinero, con contexto.</h1>
      <p>Una forma de entender qué tienes y en qué se convierte.</p>
      <section aria-live="polite">
        <span className={`indicator ${status}`} />
        <h2>
          {status === "loading"
            ? "Conectando…"
            : status === "ready"
              ? "Todo listo para comenzar"
              : "No pudimos conectar"}
        </h2>
        <p>
          {status === "ready"
            ? "La conexión está disponible. Pronto podrás registrar tus movimientos."
            : status === "loading"
              ? "Estamos comprobando que todo esté disponible."
              : "Comprueba que los servicios estén activos e intenta nuevamente."}
        </p>
        <button
          disabled={status === "loading"}
          onClick={() => setAttempt(attempt + 1)}
        >
          {status === "error" ? "Reintentar" : "Comprobar conexión"}
        </button>
      </section>
      <footer>La primera versión está en construcción.</footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
