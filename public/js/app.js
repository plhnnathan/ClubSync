function navigate(view) {
  if (!authToken) {
    renderLogin();
    return;
  }

  document.getElementById("navbar").classList.remove("hidden");
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  const active = document.querySelector(`[data-nav="${view}"]`);
  if (active) active.classList.add("active");

  const navUser = document.getElementById("navUser");
  if (currentUser) {
    const roleLabel =
      currentUser.role === "admin" ? t("role_admin") : t("role_analyst");
    navUser.innerHTML = `${currentUser.name} <span class="badge badge-${currentUser.role === "admin" ? "green" : "blue"}" style="font-size:.7rem">${roleLabel}</span>`;
  }

  applyI18n();

  const views = {
    dashboard: renderDashboard,
    players: renderPlayers,
    reports: renderReports,
  };
  if (views[view]) views[view]();
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("langBtn").textContent =
    currentLang === "en" ? "🌐 PT-BR" : "🌐 EN";

  document.getElementById("langBtn").addEventListener("click", toggleLang);

  document.querySelector(".btn-logout").addEventListener("click", logout);

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  if (authToken) navigate("dashboard");
  else renderLogin();
});
