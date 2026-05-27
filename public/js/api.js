const API_BASE = "http://localhost:3000/api";

let authToken = localStorage.getItem("token");

function setToken(token) {
  authToken = token;
  localStorage.setItem("token", token);
}

function clearToken() {
  authToken = null;
  localStorage.removeItem("token");
}

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(API_BASE + path, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function showAlert(message, type = "error") {
  document.querySelectorAll(".alert").forEach((el) => el.remove());

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  const target =
    document.querySelector(".auth-box") || document.querySelector("#app");
  if (target) target.prepend(alert);

  setTimeout(() => alert.remove(), 4000);
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}
