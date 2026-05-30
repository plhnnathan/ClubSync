async function navigate(view) {
  if (!authToken) {
    renderLogin();
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

        applyPrimaryColor(finalPrimary);
        applySecondaryColor(finalSecondary);
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
      currentUser.role === "admin" ? t("role_admin") : t("role_analyst");
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

  applyI18n();

  const views = {
    dashboard: renderDashboard,
    players: renderPlayers,
    reports: renderReports,
    games: renderGames,
    settings: renderSettings,
  };

  if (views[view]) views[view]();
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  if (authToken) {
    const savedLogo = localStorage.getItem("clubLogo");
    const savedName = localStorage.getItem("clubName");
    if (savedName) updateNavBrand(savedLogo || "", savedName);
  }

  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

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
