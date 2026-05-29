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
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  stack.appendChild(alert);

  setTimeout(() => {
    alert.style.transition = "opacity .3s ease";
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, 3800);
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}
