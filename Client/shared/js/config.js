window.API_BASE = (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) ? "http://127.0.0.1:5001" : "";

window.CONFIG = { API_BASE: window.API_BASE };