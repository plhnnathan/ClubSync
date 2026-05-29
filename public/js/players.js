async function renderPlayers() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const { data } = await request("GET", "/players");
    const isAdmin = currentUser.role === "admin";

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title"><span class="emoji">👥</span> ${t("players_title")}</h2>
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
            <td><span class="badge badge-secondary">${p.jerseyNumber}</span></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.position}</td>
            ${!compact ? `<td>${p.dominantFoot}</td>` : ""}
            <td>${statusBadge(p.status)}</td>
            ${
              !compact
                ? `
            <td>
              <div class="td-actions">
                <button class="btn btn-info btn-sm js-stats" data-id="${p._id}">${t("btn_stats")}</button>
                ${
                  isAdmin
                    ? `
                <button class="btn btn-primary btn-sm js-edit" data-id="${p._id}">${t("btn_edit")}</button>
                <button class="btn btn-danger btn-sm js-delete" data-id="${p._id}">${t("btn_delete")}</button>
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
  const map = {
    Active: "badge-green",
    Injured: "badge-red",
    "On Loan": "badge-yellow",
  };
  return `<span class="badge ${map[status] || "badge-gray"}">${status}</span>`;
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
  document.getElementById("playerModalTitle").textContent = id
    ? t("modal_edit_player")
    : t("modal_add_player");

  let player = {};
  if (id) {
    try {
      const res = await request("GET", `/players/${id}`);
      player = res.data;
    } catch (e) {}
  }

  const positions = [
    "Goalkeeper",
    "Right Back",
    "Left Back",
    "Center Back",
    "Defensive Midfielder",
    "Midfielder",
    "Attacking Midfielder",
    "Right Winger",
    "Left Winger",
    "Striker",
  ];
  const feet = ["Right", "Left", "Both"];
  const statuses = ["Active", "Injured", "On Loan"];

  document.getElementById("playerModalBody").innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>${t("form_name")}</label>
        <input type="text" id="pName" value="${player.name || ""}" placeholder="Gabriel Silva" />
      </div>
      <div class="form-group">
        <label>${t("form_jersey")}</label>
        <input type="number" id="pJersey" value="${player.jerseyNumber || ""}" min="1" max="99" />
      </div>
    </div>
    <div class="form-group">
      <label>${t("form_position")}</label>
      <select id="pPosition">
        ${positions.map((p) => `<option ${player.position === p ? "selected" : ""}>${p}</option>`).join("")}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>${t("form_foot")}</label>
        <select id="pFoot">
          ${feet.map((f) => `<option ${player.dominantFoot === f ? "selected" : ""}>${f}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>${t("form_status")}</label>
        <select id="pStatus">
          ${statuses.map((s) => `<option ${player.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" id="savePlayerBtn">${t("form_save")}</button>
      <button class="btn btn-ghost" onclick="closeModal('playerModal')">${t("form_cancel")}</button>
    </div>`;

  document
    .getElementById("savePlayerBtn")
    .addEventListener("click", () => savePlayer(id));
  openModal("playerModal");
}

async function savePlayer(id) {
  const name = document.getElementById("pName").value.trim();
  const jerseyNumber = parseInt(document.getElementById("pJersey").value);
  if (!name || !jerseyNumber) {
    showAlert(t("err_fill"));
    return;
  }

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

    document.getElementById("playerModalTitle").textContent = t("stats_title");
    document.getElementById("playerModalBody").innerHTML = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:1.3rem;font-weight:700">${player.name}</div>
        <div style="color:var(--text-muted);font-size:.9rem">${player.position} · #${player.jerseyNumber} · ${statusBadge(player.status)}</div>
      </div>

      <div class="stats-grid" style="grid-template-columns:1fr 1fr;margin-bottom:1rem">
        <div class="stat-card" style="--accent:var(--primary)">
          <div class="stat-number">${stats.matchesPlayed}</div>
          <div class="stat-label">${t("stats_matches")}</div>
        </div>
        <div class="stat-card" style="--accent:#22c55e">
          <div class="stat-number">${stats.totalGoals}</div>
          <div class="stat-label">${t("stats_goals")}</div>
        </div>
        <div class="stat-card" style="--accent:var(--secondary)">
          <div class="stat-number">${stats.totalAssists}</div>
          <div class="stat-label">${t("stats_assists")}</div>
        </div>
        <div class="stat-card" style="--accent:var(--text-muted)">
          <div class="stat-number">${stats.totalMinutesPlayed}</div>
          <div class="stat-label">${t("stats_minutes")}</div>
        </div>
      </div>

      <div class="card" style="margin:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
          <span style="font-size:.85rem;color:var(--text-muted)">${t("stats_avg")}</span>
          <strong style="color:var(--warning);font-size:1.1rem">${avg}</strong>
        </div>
        <div class="rating-track">
          <div class="rating-fill" style="width:${pct}%;background:${avg >= 7 ? "var(--primary)" : avg >= 5 ? "var(--warning)" : "var(--danger)"}"></div>
        </div>
      </div>`;

    openModal("playerModal");
  } catch (e) {
    showAlert(e.message);
  }
}
