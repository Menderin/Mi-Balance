import { createRoot } from "react-dom/client";
import { Login } from "./login";
import { PublicPage } from "./public-page";
import "./tokens.css";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  location.pathname === "/inicio" ? (
    <PublicPage />
  ) : location.pathname === "/registro" ? (
    <PublicPage registration />
  ) : (
    <Login />
  ),
);
