async function renderDashboard() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const [playersRes, reportsRes] = await Promise.all([
      request("GET", "/players"),
      request("GET", "/match-reports"),
    ]);

    const players = playersRes.data;
    const reports = reportsRes.data;
    const active = players.filter((p) => p.status === "Active").length;
    const injured = players.filter((p) => p.status === "Injured").length;

    const roleBadge =
      currentUser.role === "admin"
        ? `<span class="badge badge-primary">${t("role_admin")}</span>`
        : `<span class="badge badge-secondary">${t("role_analyst")}</span>`;

    const statCard = (accent, icon, value, label) => `
      <div class="stat-card" style="--accent:${accent}">
        <div class="stat-top">
          <div class="stat-number">${value}</div>
          <div class="stat-icon">${icon}</div>
        </div>
        <div class="stat-label">${label}</div>
      </div>`;

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title"><span class="emoji">📊</span> ${t("nav_dashboard")}</h2>
          <p class="page-subtitle">${t("dashboard_welcome")}, <strong>${currentUser.name}</strong> ${roleBadge}</p>
        </div>
      </div>

      <div class="stats-grid">
        ${statCard("var(--primary)", "👥", playersRes.total, t("dashboard_total_players"))}
        ${statCard("#22c55e", "✅", active, t("dashboard_active"))}
        ${statCard("#ef4444", "🩹", injured, t("dashboard_injured"))}
        ${statCard("var(--secondary)", "📋", reportsRes.total, t("dashboard_reports"))}
      </div>

      <div class="card">
        <div class="card-title"><span class="dot"></span> ${t("players_title")}</div>
        ${buildPlayersTable(players.slice(0, 5), true)}
      </div>

      ${
        reports.length > 0
          ? `
      <div class="card">
        <div class="card-title"><span class="dot"></span> ${t("reports_title")}</div>
        ${buildReportsTable(reports.slice(0, 5), true)}
      </div>`
          : ""
      }
    `;
  } catch (e) {
    showAlert(e.message);
  }
}
