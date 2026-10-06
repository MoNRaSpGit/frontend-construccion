import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConstruccionApp } from "./features/construccion/ConstruccionApp";
import { AppUpdateNotice } from "./shared/components/AppUpdateNotice";
import "./styles/global.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConstruccionApp />
    <AppUpdateNotice />
  </StrictMode>
);
