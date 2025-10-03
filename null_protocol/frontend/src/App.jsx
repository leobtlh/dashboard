// frontend/src/App.jsx
import React, { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Redirige automatiquement vers la page statique
    window.location.href = "/website/index.html";
  }, []);

  return null; // Rien à afficher dans React
}
