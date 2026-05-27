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
        ? `<span class="badge badge-green">${t("role_admin")}</span>`
        : `<span class="badge badge-blue">${t("role_analyst")}</span>`;

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">📊 ${t("nav_dashboard")}</h2>
          <p class="page-subtitle">${t("dashboard_welcome")}, <strong>${currentUser.name}</strong> ${roleBadge}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${playersRes.total}</div>
          <div class="stat-label">${t("dashboard_total_players")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color:#34d399">${active}</div>
          <div class="stat-label">${t("dashboard_active")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color:#fca5a5">${injured}</div>
          <div class="stat-label">${t("dashboard_injured")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color:#93c5fd">${reportsRes.total}</div>
          <div class="stat-label">${t("dashboard_reports")}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">👥 ${t("players_title")}</div>
        ${buildPlayersTable(players.slice(0, 5), true)}
      </div>

      ${
        reports.length > 0
          ? `
      <div class="card">
        <div class="card-title">📋 ${t("reports_title")}</div>
        ${buildReportsTable(reports.slice(0, 5), true)}
      </div>`
          : ""
      }
    `;
  } catch (e) {
    showAlert(e.message);
  }
}
