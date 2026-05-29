let currentTheme = localStorage.getItem("theme") || "light";

function applyTheme() {
  if (currentTheme === "light") {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
  } else {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
  }
  const navBtn = document.getElementById("themeBtn");
  if (navBtn) navBtn.textContent = currentTheme === "light" ? "🌙" : "☀️";
  updateAuthThemeBtn();
}

function updateAuthThemeBtn() {
  const authBtn = document.getElementById("authThemeBtn");
  if (authBtn) authBtn.textContent = currentTheme === "light" ? "🌙" : "☀️";
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);
  applyTheme();
}

async function navigate(view) {
  if (!authToken) {
    renderLogin();
    return;
  }

  // Load and apply club branding if not cached
  if (!localStorage.getItem("clubColor")) {
    try {
      const { data } = await request("GET", "/club");
      if (data.primaryColor) {
        localStorage.setItem("clubColor", data.primaryColor);
        localStorage.setItem("clubSecondary", data.secondaryColor || "#3b82f6");
        localStorage.setItem("clubLogo", data.logoUrl || "");
        localStorage.setItem("clubName", data.name || "ClubSync");
        applyPrimaryColor(data.primaryColor);
        applySecondaryColor(data.secondaryColor);
        updateNavBrand(data.logoUrl, data.name);
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
    navUser.innerHTML = `${currentUser.name} <span class="badge badge-${currentUser.role === "admin" ? "green" : "blue"}" style="font-size:.65rem">${roleLabel}</span>`;
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

  // Apply saved club branding
  const savedColor = localStorage.getItem("clubColor");
  const savedSecondary = localStorage.getItem("clubSecondary");
  const savedLogo = localStorage.getItem("clubLogo");
  const savedName = localStorage.getItem("clubName");

  if (savedColor) applyPrimaryColor(savedColor);
  if (savedSecondary) applySecondaryColor(savedSecondary);
  if (savedName && authToken) updateNavBrand(savedLogo || "", savedName);

  const langBtn = document.getElementById("langBtn");
  const themeBtn = document.getElementById("themeBtn");

  langBtn.textContent = currentLang === "pt" ? "🌐 EN" : "🌐 PT-BR";

  themeBtn.addEventListener("click", toggleTheme);
  langBtn.addEventListener("click", toggleLang);

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
