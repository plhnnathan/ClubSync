async function renderReports() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const { data } = await request("GET", "/match-reports");

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">📋 ${t("reports_title")}</h2>
          <p class="page-subtitle">${data.length} ${t("dashboard_reports").toLowerCase()}</p>
        </div>
        <button class="btn btn-primary" id="addReportBtn">+ ${t("reports_add")}</button>
      </div>
      <div class="card">
        <div class="table-wrap">${buildReportsTable(data)}</div>
      </div>`;

    document
      .getElementById("addReportBtn")
      .addEventListener("click", openReportModal);
  } catch (e) {
    showAlert(e.message);
  }
}

function buildReportsTable(reports, compact = false) {
  if (!reports.length) return `<p class="empty-state">${t("no_data")}</p>`;
  const isAdmin = currentUser.role === "admin";

  return `
    <table>
      <thead>
        <tr>
          <th>${t("reports_player")}</th>
          <th>${t("reports_opponent")}</th>
          <th>${t("reports_date")}</th>
          <th>${t("reports_min")}</th>
          <th>${t("reports_goals")}</th>
          <th>${t("reports_assists")}</th>
          <th>${t("reports_rating")}</th>
          ${!compact && isAdmin ? `<th>${t("reports_actions")}</th>` : ""}
        </tr>
      </thead>
      <tbody>
        ${reports
          .map((r) => {
            const ratingClass =
              r.sofascoreRating >= 7
                ? "badge-green"
                : r.sofascoreRating >= 5
                  ? "badge-yellow"
                  : "badge-red";
            return `
            <tr>
              <td><strong>${r.playerId?.name || "—"}</strong></td>
              <td>${r.opponent}</td>
              <td>${new Date(r.matchDate).toLocaleDateString()}</td>
              <td>${r.minutesPlayed}'</td>
              <td>${r.goals}</td>
              <td>${r.assists}</td>
              <td><span class="badge ${ratingClass}">${r.sofascoreRating}</span></td>
              ${
                !compact && isAdmin
                  ? `
              <td>
                <button class="btn btn-danger btn-sm js-del-report" data-id="${r._id}">${t("btn_delete")}</button>
              </td>`
                  : ""
              }
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("js-del-report"))
    deleteReport(e.target.dataset.id);
});

async function openReportModal() {
  try {
    const { data: players } = await request("GET", "/players");
    document.getElementById("reportModalTitle").textContent =
      t("modal_add_report");
    document.getElementById("reportModalBody").innerHTML = `
      <div class="form-group">
        <label>${t("form_player")}</label>
        <select id="rPlayer">
          ${players.map((p) => `<option value="${p._id}">${p.name} · #${p.jerseyNumber}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>${t("form_opponent")}</label>
        <input type="text" id="rOpponent" placeholder="FC Rival" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>${t("form_date")}</label>
          <input type="date" id="rDate" />
        </div>
        <div class="form-group">
          <label>${t("form_minutes")}</label>
          <input type="number" id="rMinutes" value="90" min="0" max="120" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>${t("form_goals")}</label>
          <input type="number" id="rGoals" value="0" min="0" />
        </div>
        <div class="form-group">
          <label>${t("form_assists")}</label>
          <input type="number" id="rAssists" value="0" min="0" />
        </div>
      </div>
      <div class="form-group">
        <label>${t("form_rating")}</label>
        <input type="number" id="rRating" value="7.0" min="0" max="10" step="0.1" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="saveReportBtn">${t("form_save")}</button>
        <button class="btn btn-ghost" onclick="closeModal('reportModal')">${t("form_cancel")}</button>
      </div>`;

    document
      .getElementById("saveReportBtn")
      .addEventListener("click", saveReport);
    openModal("reportModal");
  } catch (e) {
    showAlert(e.message);
  }
}

async function saveReport() {
  const playerId = document.getElementById("rPlayer").value;
  const opponent = document.getElementById("rOpponent").value.trim();
  const matchDate = document.getElementById("rDate").value;
  if (!opponent || !matchDate) {
    showAlert(t("err_fill"));
    return;
  }

  const body = {
    playerId,
    opponent,
    matchDate,
    minutesPlayed: parseInt(document.getElementById("rMinutes").value),
    goals: parseInt(document.getElementById("rGoals").value),
    assists: parseInt(document.getElementById("rAssists").value),
    sofascoreRating: parseFloat(document.getElementById("rRating").value),
  };

  try {
    await request("POST", "/match-reports", body);
    closeModal("reportModal");
    renderReports();
  } catch (e) {
    showAlert(e.message);
  }
}

async function deleteReport(id) {
  if (!confirm(t("confirm_delete"))) return;
  try {
    await request("DELETE", `/match-reports/${id}`);
    renderReports();
  } catch (e) {
    showAlert(e.message);
  }
}
