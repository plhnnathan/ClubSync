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
  const activeBtn = document.querySelector(`[data-nav="${view}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  const navUser = document.getElementById("navUser");
  if (currentUser && navUser) {
    const roleLabel =
      currentUser.role === "admin" ? t("role_admin") : t("role_analyst");
    const roleClass = currentUser.role === "admin" ? "primary" : "secondary";
    navUser.innerHTML = `
      <span class="nav-username">${currentUser.name}</span>
      <span class="badge badge-${roleClass}">${roleLabel}</span>`;
  }

  updateLangBtn();
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
  // Apply theme and brand colors from localStorage
  applyTheme();
  applyBrandColors();

  const savedLogo = localStorage.getItem("clubLogo");
  const savedName = localStorage.getItem("clubName");
  if (savedName && authToken) updateNavBrand(savedLogo || "", savedName);

  updateLangBtn();

  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.addEventListener("click", cycleLang);

  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.nav);
      if (navLinks) navLinks.classList.remove("open");
    });
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
