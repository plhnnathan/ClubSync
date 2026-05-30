async function navigate(view) {
  if (!authToken) {
    if (typeof renderLogin === "function") renderLogin();
    return;
  }

  if (!localStorage.getItem("clubName")) {
    try {
      const { data } = await request("GET", "/club");
      if (data) {
        const savedPrimary = localStorage.getItem("clubColor");
        const savedSecondary = localStorage.getItem("clubSecondary");

        const finalPrimary = data.primaryColor || savedPrimary || "#00c853";
        const finalSecondary =
          data.secondaryColor || savedSecondary || "#3b82f6";

        localStorage.setItem("clubColor", finalPrimary);
        localStorage.setItem("clubSecondary", finalSecondary);
        localStorage.setItem("clubLogo", data.logoUrl || "");
        localStorage.setItem("clubName", data.name || "ClubSync");

        if (typeof applyPrimaryColor === "function")
          applyPrimaryColor(finalPrimary);
        if (typeof applySecondaryColor === "function")
          applySecondaryColor(finalSecondary);
        if (typeof updateNavBrand === "function")
          updateNavBrand(data.logoUrl, data.name);
      }
    } catch (_) {}
  }

  document.getElementById("topbar")?.classList.remove("hidden");
  document.getElementById("sidebar")?.classList.remove("hidden", "open");

  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  const active = document.querySelector(`[data-nav="${view}"]`);
  if (active) active.classList.add("active");

  const navUser = document.getElementById("navUser");
  if (currentUser && navUser) {
    const roleLabel =
      currentUser.role === "admin"
        ? typeof t === "function"
          ? t("role_admin")
          : "Admin"
        : typeof t === "function"
          ? t("role_analyst")
          : "Analyst";

    const initials = (currentUser.name || "?")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    navUser.innerHTML = `
      <span class="nav-avatar">${initials}</span>
      <div style="display:flex; flex-direction:column; align-items:flex-start;">
        <span>${currentUser.name}</span>
        <span class="badge badge-${currentUser.role === "admin" ? "primary" : "secondary"}"
          style="font-size:.6rem; padding: 0.1rem 0.4rem;">${roleLabel}</span>
      </div>`;
  }

  if (typeof applyI18n === "function") applyI18n();

  const views = {};
  if (typeof renderDashboard === "function") views.dashboard = renderDashboard;
  if (typeof renderPlayers === "function") views.players = renderPlayers;
  if (typeof renderReports === "function") views.reports = renderReports;
  if (typeof renderGames === "function") views.games = renderGames;
  if (typeof renderSettings === "function") views.settings = renderSettings;

  if (views[view]) {
    views[view]();
  } else {
    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div><h2 class="page-title"><span class="emoji">🚧</span> Erro de Carregamento</h2></div>
      </div>
      <div class="empty-state">
        <span class="empty-emoji">⚠️</span>
        <p>O arquivo responsável por esta tela não foi encontrado ou possui um erro de sintaxe.</p>
        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-muted);">Verifique se você copiou o código completo (incluindo as chaves finais <b>}</b>) no arquivo correspondente.</p>
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof applyTheme === "function") applyTheme();

  if (authToken) {
    const savedLogo = localStorage.getItem("clubLogo");
    const savedName = localStorage.getItem("clubName");
    if (savedName && typeof updateNavBrand === "function")
      updateNavBrand(savedLogo || "", savedName);
  }

  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn && typeof toggleTheme === "function")
    themeBtn.addEventListener("click", toggleTheme);

  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn && typeof logout === "function")
    logoutBtn.addEventListener("click", logout);

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });

  const collapseBtn = document.getElementById("collapseBtn");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });
  }

  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });
  }

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (typeof closeModal === "function") closeModal(btn.dataset.close);
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && typeof closeModal === "function")
        closeModal(overlay.id);
    });
  });

  if (authToken) navigate("dashboard");
  else if (typeof renderLogin === "function") renderLogin();
});
