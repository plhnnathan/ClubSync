const posMap = {
  Goalkeeper: "pos_goalkeeper",
  "Right Back": "pos_right_back",
  "Left Back": "pos_left_back",
  "Center Back": "pos_center_back",
  "Defensive Midfielder": "pos_def_mid",
  Midfielder: "pos_mid",
  "Attacking Midfielder": "pos_att_mid",
  "Right Winger": "pos_right_wing",
  "Left Winger": "pos_left_wing",
  Striker: "pos_striker",
};
const footMap = { Right: "foot_right", Left: "foot_left", Both: "foot_both" };
const statusMap = {
  Active: "status_active",
  Injured: "status_injured",
  "On Loan": "status_loan",
};

async function renderPlayers() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const { data } = await request("GET", "/players");
    const isAdmin = currentUser.role === "admin";

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">👥 ${t("players_title")}</h2>
          <p class="page-subtitle">${data.length} ${t("dashboard_total_players").toLowerCase()}</p>
        </div>
        ${isAdmin ? `<button class="btn btn-primary" id="addPlayerBtn">+ ${t("players_add")}</button>` : ""}
      </div>
      <div class="card">
        <div class="table-wrap">${buildPlayersTable(data)}</div>
      </div>`;

    if (isAdmin) {
      document
        .getElementById("addPlayerBtn")
        .addEventListener("click", () => openPlayerModal());
    }
  } catch (e) {
    showAlert(e.message);
  }
}

function buildPlayersTable(players, compact = false) {
  if (!players.length) return `<p class="empty-state">${t("no_data")}</p>`;
  const isAdmin = currentUser.role === "admin";

  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${t("players_name")}</th>
          <th>${t("players_position")}</th>
          ${!compact ? `<th>${t("players_foot")}</th>` : ""}
          <th>${t("players_status")}</th>
          ${!compact ? `<th>${t("players_actions")}</th>` : ""}
        </tr>
      </thead>
      <tbody>
        ${players
          .map(
            (p) => `
          <tr>
            <td><span class="badge badge-blue">${p.jerseyNumber}</span></td>
            <td><strong>${p.name}</strong></td>
            <td><span data-i18n="${posMap[p.position]}">${t(posMap[p.position]) || p.position}</span></td>
            ${!compact ? `<td><span data-i18n="${footMap[p.dominantFoot]}">${t(footMap[p.dominantFoot]) || p.dominantFoot}</span></td>` : ""}
            <td>${statusBadge(p.status)}</td>
            ${
              !compact
                ? `
            <td>
              <div class="td-actions">
                <button class="btn btn-info btn-sm js-stats" data-id="${p._id}" data-i18n="btn_stats">${t("btn_stats")}</button>
                ${
                  isAdmin
                    ? `
                <button class="btn btn-primary btn-sm js-edit" data-id="${p._id}" data-i18n="btn_edit">${t("btn_edit")}</button>
                <button class="btn btn-danger btn-sm js-delete" data-id="${p._id}" data-i18n="btn_delete">${t("btn_delete")}</button>
                `
                    : ""
                }
              </div>
            </td>`
                : ""
            }
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
}

function statusBadge(status) {
  const mapClass = {
    Active: "badge-green",
    Injured: "badge-red",
    "On Loan": "badge-yellow",
  };
  return `<span class="badge ${mapClass[status] || "badge-gray"}" data-i18n="${statusMap[status]}">${t(statusMap[status]) || status}</span>`;
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("js-stats"))
    viewPlayerStats(e.target.dataset.id);
  if (e.target.classList.contains("js-edit"))
    openPlayerModal(e.target.dataset.id);
  if (e.target.classList.contains("js-delete"))
    deletePlayer(e.target.dataset.id);
});

async function openPlayerModal(id = null) {
  const titleEl = document.getElementById("playerModalTitle");
  titleEl.dataset.i18n = id ? "modal_edit_player" : "modal_add_player";
  titleEl.textContent = t(titleEl.dataset.i18n);

  let player = {};
  if (id) {
    try {
      const res = await request("GET", `/players/${id}`);
      player = res.data;
    } catch (e) {}
  }

  document.getElementById("playerModalBody").innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label data-i18n="form_name">${t("form_name")}</label>
        <input type="text" id="pName" value="${player.name || ""}" placeholder="Gabriel Silva" />
      </div>
      <div class="form-group">
        <label data-i18n="form_jersey">${t("form_jersey")}</label>
        <input type="number" id="pJersey" value="${player.jerseyNumber || ""}" min="1" max="99" />
      </div>
    </div>
    <div class="form-group">
      <label data-i18n="form_position">${t("form_position")}</label>
      <select id="pPosition">
        ${Object.keys(posMap)
          .map(
            (p) =>
              `<option value="${p}" data-i18n="${posMap[p]}" ${player.position === p ? "selected" : ""}>${t(posMap[p])}</option>`,
          )
          .join("")}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label data-i18n="form_foot">${t("form_foot")}</label>
        <select id="pFoot">
          ${Object.keys(footMap)
            .map(
              (f) =>
                `<option value="${f}" data-i18n="${footMap[f]}" ${player.dominantFoot === f ? "selected" : ""}>${t(footMap[f])}</option>`,
            )
            .join("")}
        </select>
      </div>
      <div class="form-group">
        <label data-i18n="form_status">${t("form_status")}</label>
        <select id="pStatus">
          ${Object.keys(statusMap)
            .map(
              (s) =>
                `<option value="${s}" data-i18n="${statusMap[s]}" ${player.status === s ? "selected" : ""}>${t(statusMap[s])}</option>`,
            )
            .join("")}
        </select>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" id="savePlayerBtn" data-i18n="form_save">${t("form_save")}</button>
      <button class="btn btn-ghost" onclick="closeModal('playerModal')" data-i18n="form_cancel">${t("form_cancel")}</button>
    </div>`;

  document
    .getElementById("savePlayerBtn")
    .addEventListener("click", () => savePlayer(id));
  openModal("playerModal");
}

async function savePlayer(id) {
  const name = document.getElementById("pName").value.trim();
  const jerseyNumber = parseInt(document.getElementById("pJersey").value);
  if (!name || !jerseyNumber) return showAlert(t("err_fill"));

  const body = {
    name,
    jerseyNumber,
    position: document.getElementById("pPosition").value,
    dominantFoot: document.getElementById("pFoot").value,
    status: document.getElementById("pStatus").value,
  };

  try {
    if (id) await request("PATCH", `/players/${id}`, body);
    else await request("POST", "/players", body);
    closeModal("playerModal");
    renderPlayers();
  } catch (e) {
    showAlert(e.message);
  }
}

async function deletePlayer(id) {
  if (!confirm(t("confirm_delete"))) return;
  try {
    await request("DELETE", `/players/${id}`);
    renderPlayers();
  } catch (e) {
    showAlert(e.message);
  }
}

async function viewPlayerStats(id) {
  try {
    const res = await request("GET", `/players/${id}/stats`);
    const { player, stats } = res.data;
    const avg = stats.averageRating || 0;
    const pct = (avg / 10) * 100;

    const titleEl = document.getElementById("playerModalTitle");
    titleEl.dataset.i18n = "stats_title";
    titleEl.textContent = t("stats_title");

    document.getElementById("playerModalBody").innerHTML = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:1.3rem;font-weight:700">${player.name}</div>
        <div style="color:var(--text-muted);font-size:.9rem" data-i18n="${posMap[player.position]}">${t(posMap[player.position]) || player.position} · #${player.jerseyNumber} · ${statusBadge(player.status)}</div>
      </div>
      <div class="stats-grid" style="grid-template-columns:1fr 1fr;margin-bottom:1rem">
        <div class="stat-card">
          <div class="stat-number">${stats.matchesPlayed}</div>
          <div class="stat-label" data-i18n="stats_matches">${t("stats_matches")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color:#34d399">${stats.totalGoals}</div>
          <div class="stat-label" data-i18n="stats_goals">${t("stats_goals")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color:#93c5fd">${stats.totalAssists}</div>
          <div class="stat-label" data-i18n="stats_assists">${t("stats_assists")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color:var(--text-muted)">${stats.totalMinutesPlayed}</div>
          <div class="stat-label" data-i18n="stats_minutes">${t("stats_minutes")}</div>
        </div>
      </div>
      <div class="card" style="margin:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
          <span style="font-size:.85rem;color:var(--text-muted)" data-i18n="stats_avg">${t("stats_avg")}</span>
          <strong style="color:var(--yellow);font-size:1.1rem">${avg}</strong>
        </div>
        <div class="rating-track">
          <div class="rating-fill" style="width:${pct}%;background:${avg >= 7 ? "var(--green)" : avg >= 5 ? "var(--yellow)" : "var(--red)"}"></div>
        </div>
      </div>`;
    openModal("playerModal");
  } catch (e) {
    showAlert(e.message);
  }
}
