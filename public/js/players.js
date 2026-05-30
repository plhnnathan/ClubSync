const positionMap = {
  Goalkeeper: "pos_goalkeeper",
  "Right Back": "pos_rb",
  "Left Back": "pos_lb",
  "Center Back": "pos_cb",
  "Defensive Midfielder": "pos_dm",
  Midfielder: "pos_cm",
  "Attacking Midfielder": "pos_am",
  "Right Winger": "pos_rw",
  "Left Winger": "pos_lw",
  Striker: "pos_st",
};

const footMap = {
  Right: "foot_right",
  Left: "foot_left",
  Both: "foot_both",
};

const statusMap = {
  Active: "status_active",
  Injured: "status_injured",
  "On Loan": "status_loan",
};

function getSafeTranslation(map, rawValue) {
  if (!rawValue) return "-";
  let engValue = rawValue;
  if (Object.values(map).includes(rawValue)) {
    engValue = Object.keys(map).find((k) => map[k] === rawValue);
  }
  if (!map[engValue]) return rawValue;

  const i18nKey = map[engValue];
  let translated = typeof t === "function" ? t(i18nKey) : i18nKey;

  if (translated === i18nKey) {
    const manual = {
      pos_goalkeeper: "Goleiro",
      pos_rb: "Lateral Direito",
      pos_lb: "Lateral Esquerdo",
      pos_cb: "Zagueiro",
      pos_dm: "Volante",
      pos_cm: "Meio-Campo",
      pos_am: "Meia Atacante",
      pos_rw: "Ponta Direita",
      pos_lw: "Ponta Esquerda",
      pos_st: "Atacante",
      foot_right: "Destro",
      foot_left: "Canhoto",
      foot_both: "Ambidestro",
      status_active: "Ativo",
      status_injured: "Lesionado",
      status_loan: "Emprestado",
    };
    translated = manual[i18nKey] || engValue;
  }
  return translated;
}

function getSafeEngValue(map, rawValue) {
  if (Object.values(map).includes(rawValue))
    return Object.keys(map).find((k) => map[k] === rawValue);
  return rawValue;
}

async function renderPlayers() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const { data } = await request("GET", "/players");
    const isAdmin = currentUser.role === "admin";
    let tableContent = "";

    if (data.length === 0) {
      tableContent = `
        <div class="empty-state">
          <span class="empty-emoji">🤷‍♂️</span>
          <p>${t("no_data")}</p>
          ${isAdmin ? `<button class="btn btn-primary" onclick="seedGaloPlayers()" style="margin-top: 1rem;">🐔 Carregar Elenco do Galo</button>` : ""}
        </div>`;
    } else {
      tableContent = buildPlayersTable(data);
    }

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title"><span class="emoji">👥</span> ${t("players_title")}</h2>
          <p class="page-subtitle">${data.length} ${t("dashboard_total_players").toLowerCase()}</p>
        </div>
        ${isAdmin ? `<button class="btn btn-primary" id="addPlayerBtn">+ ${t("players_add")}</button>` : ""}
      </div>
      <div class="card">
        <div class="table-wrap">${tableContent}</div>
      </div>`;

    if (isAdmin) {
      const addBtn = document.getElementById("addPlayerBtn");
      if (addBtn) addBtn.addEventListener("click", () => openPlayerModal());
    }
  } catch (e) {
    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div><h2 class="page-title"><span class="emoji">👥</span> ${t("players_title")}</h2></div>
      </div>
      <div class="empty-state">
        <span class="empty-emoji">⚠️</span>
        <p>Erro na API: ${e.message}</p>
      </div>`;
    showAlert(e.message);
  }
}

function buildPlayersTable(players, compact = false) {
  const isAdmin = currentUser.role === "admin";
  return `
    <table>
      <thead>
        <tr>
          <th>${t("players_name")}</th>
          <th>${t("players_position")}</th>
          ${!compact ? `<th>Idade/Nac.</th>` : ""}
          <th>${t("players_status")}</th>
          ${!compact ? `<th>${t("players_actions")}</th>` : ""}
        </tr>
      </thead>
      <tbody>
        ${players
          .map((p) => {
            const avatar = p.photoUrl
              ? `<img src="${p.photoUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--surface-2)">`
              : `<div style="width:36px;height:36px;border-radius:50%;background:var(--surface-3);display:grid;place-items:center;font-weight:bold;font-size:0.8rem">${p.name.substring(0, 2).toUpperCase()}</div>`;
            return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:0.8rem">
                ${avatar}
                <div style="display:flex;flex-direction:column">
                  <strong>${p.name}</strong>
                  <span style="font-size:0.75rem;color:var(--text-muted)">Camisa #${p.jerseyNumber}</span>
                </div>
              </div>
            </td>
            <td>${getSafeTranslation(positionMap, p.position)}</td>
            ${!compact ? `<td><span style="font-size:0.8rem">${p.nationality || "-"}<br>${p.birthDate || "-"}</span></td>` : ""}
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
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

function statusBadge(status) {
  const engStatus = getSafeEngValue(statusMap, status) || status;
  let badgeClass = "badge-gray";
  if (engStatus === "Active") badgeClass = "badge-green";
  if (engStatus === "Injured") badgeClass = "badge-red";
  if (engStatus === "On Loan") badgeClass = "badge-yellow";
  return `<span class="badge ${badgeClass}">${getSafeTranslation(statusMap, status)}</span>`;
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
      player = (await request("GET", `/players/${id}`)).data;
    } catch (e) {}
  }

  const positions = Object.keys(positionMap);
  const feet = Object.keys(footMap);
  const statuses = Object.keys(statusMap);

  const safePos = getSafeEngValue(positionMap, player.position);
  const safeFoot = getSafeEngValue(footMap, player.dominantFoot);
  const safeStatus = getSafeEngValue(statusMap, player.status);

  document.getElementById("playerModalBody").innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>${t("form_name")}</label>
        <input type="text" id="pName" value="${player.name || ""}" placeholder="Ex: Gabriel Silva" />
      </div>
      <div class="form-group">
        <label>${t("form_jersey")}</label>
        <input type="number" id="pJersey" value="${player.jerseyNumber || ""}" min="1" max="99" />
      </div>
    </div>
    <div class="form-group">
      <label>URL da Foto (Opcional)</label>
      <input type="url" id="pPhoto" value="${player.photoUrl || ""}" placeholder="https://link.com/foto.jpg" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Nacionalidade</label>
        <input type="text" id="pNat" value="${player.nationality || ""}" placeholder="Ex: Brasil" />
      </div>
      <div class="form-group">
        <label>Data de Nascimento</label>
        <input type="date" id="pDob" value="${player.birthDate || ""}" />
      </div>
    </div>
    <div class="form-group">
      <label>${t("form_position")}</label>
      <select id="pPosition">
        ${positions.map((p) => `<option value="${p}" ${safePos === p ? "selected" : ""}>${getSafeTranslation(positionMap, p)}</option>`).join("")}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>${t("form_foot")}</label>
        <select id="pFoot">
          ${feet.map((f) => `<option value="${f}" ${safeFoot === f ? "selected" : ""}>${getSafeTranslation(footMap, f)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>${t("form_status")}</label>
        <select id="pStatus">
          ${statuses.map((s) => `<option value="${s}" ${safeStatus === s ? "selected" : ""}>${getSafeTranslation(statusMap, s)}</option>`).join("")}
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
    photoUrl: document.getElementById("pPhoto").value.trim(),
    nationality: document.getElementById("pNat").value.trim(),
    birthDate: document.getElementById("pDob").value,
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
    const displayPos = getSafeTranslation(positionMap, player.position);

    const avatar = player.photoUrl
      ? `<img src="${player.photoUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--primary);margin:0 auto 1rem">`
      : `<div style="width:80px;height:80px;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;font-weight:bold;font-size:2rem;margin:0 auto 1rem">${player.name.substring(0, 2).toUpperCase()}</div>`;

    document.getElementById("playerModalTitle").textContent = t("stats_title");
    document.getElementById("playerModalBody").innerHTML = `
      <div style="text-align:center;margin-bottom:1.5rem">
        ${avatar}
        <div style="font-size:1.4rem;font-weight:800">${player.name}</div>
        <div style="color:var(--text-muted);font-size:.9rem;margin-bottom:0.5rem">
          ${displayPos} · #${player.jerseyNumber} · ${player.nationality || "Desconhecido"}
        </div>
        ${statusBadge(player.status)}
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

async function seedGaloPlayers() {
  const galo = [
    {
      name: "Everson",
      jerseyNumber: 22,
      nationality: "Brasil",
      position: "Goalkeeper",
      dominantFoot: "Right",
      status: "Active",
    },
    {
      name: "Guilherme Arana",
      jerseyNumber: 13,
      nationality: "Brasil",
      position: "Left Back",
      dominantFoot: "Left",
      status: "Active",
    },
    {
      name: "Renzo Saravia",
      jerseyNumber: 26,
      nationality: "Argentina",
      position: "Right Back",
      dominantFoot: "Right",
      status: "Active",
    },
    {
      name: "Rodrigo Battaglia",
      jerseyNumber: 21,
      nationality: "Argentina",
      position: "Defensive Midfielder",
      dominantFoot: "Right",
      status: "Active",
    },
    {
      name: "Gustavo Scarpa",
      jerseyNumber: 6,
      nationality: "Brasil",
      position: "Attacking Midfielder",
      dominantFoot: "Left",
      status: "Active",
    },
    {
      name: "Paulinho",
      jerseyNumber: 10,
      nationality: "Brasil",
      position: "Striker",
      dominantFoot: "Right",
      status: "Active",
    },
    {
      name: "Hulk",
      jerseyNumber: 7,
      nationality: "Brasil",
      position: "Striker",
      dominantFoot: "Left",
      status: "Active",
    },
  ];
  try {
    for (const p of galo) await request("POST", "/players", p);
    renderPlayers();
    showAlert("Elenco carregado com sucesso!", "success");
  } catch (e) {
    showAlert(e.message);
  }
}
