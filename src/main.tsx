// import { StrictMode } from "react";

import "react-vant/lib/index.css";
import "./index.css";
import App from "./App.tsx";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
