import React from "react";
import ReactDOM from "react-dom/client";
import AdminApp from "./AdminApp";
import "../index.css";

// The /natlus admin panel is a SEPARATE entry point from the public site.
// It opens directly with no login, no password and no session gate, exactly
// as the specification requires. It is never linked from the public site.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
);
