async function navigate(view) {
  if (!authToken) {
    renderLogin();
    return;
  }

  if (!localStorage.getItem("clubColor")) {
    try {
      const { data } = await request("GET", "/club");
      if (data.primaryColor) {
        applyPrimaryColor(data.primaryColor, true);
        applySecondaryColor(data.secondaryColor || "#3b82f6", true);
        updateNavBrand(data.logoUrl, data.name);
        localStorage.setItem("clubName", data.name);
        localStorage.setItem("clubLogo", data.logoUrl || "");
      }
    } catch (_) {}
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
    navUser.innerHTML = `${currentUser.name} <span class="badge badge-${currentUser.role === "admin" ? "primary" : "secondary"}" style="font-size:.65rem">${roleLabel}</span>`;
  }

  applyI18n();

  const views = {
    dashboard: renderDashboard,
    players: renderPlayers,
    reports: renderReports,
    settings: renderSettings,
  };

  if (views[view]) views[view]();
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  applyBrandColors();

  const savedLogo = localStorage.getItem("clubLogo");
  const savedName = localStorage.getItem("clubName");
  if (savedName && authToken) updateNavBrand(savedLogo || "", savedName);

  const langBtn = document.getElementById("langBtn");
  const themeBtn = document.getElementById("themeBtn");

  langBtn.textContent = currentLang === "en" ? "🌐 PT-BR" : "🌐 EN";

  themeBtn.addEventListener("click", toggleTheme);
  langBtn.addEventListener("click", toggleLang);

  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", () => logout());

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
