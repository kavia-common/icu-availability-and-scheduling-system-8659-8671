import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import "./styles/_variables.scss"; // ensure CSS variables are available
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
