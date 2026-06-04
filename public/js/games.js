const statFields = [
  { id: "possession", label: "Posse de bola", type: "percent" },
  { id: "xg", label: "Gols esperados (xG)", type: "decimal" },
  { id: "bigChances", label: "Grandes chances", type: "number" },
  { id: "shots", label: "Finalizações", type: "number" },
  { id: "saves", label: "Defesas do goleiro", type: "number" },
  { id: "corners", label: "Escanteios", type: "number" },
  { id: "fouls", label: "Faltas", type: "number" },
  { id: "passes", label: "Passes", type: "number" },
  { id: "tackles", label: "Desarmes", type: "number" },
  { id: "freeKicks", label: "Faltas (Tiros Diretos)", type: "number" },
  { id: "yellowCards", label: "Cartões amarelos", type: "number" },
];

async function renderGames() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  let data = [];
  const isAdmin = currentUser && currentUser.role === "admin";

  try {
    const res = await request("GET", "/games");
    if (res && res.data) data = res.data;
  } catch (e) {
    console.warn(e);
  }

  let content = "";
  if (data.length === 0) {
    content = `
      <div class="empty-state">
        <span class="empty-emoji">🏟️</span>
        <p>${t("no_data")}</p>
        ${isAdmin ? `<button class="btn btn-primary" onclick="seedGaloGames()" style="margin-top: 1rem;">🐔 Carregar Jogos</button>` : ""}
      </div>`;
  } else {
    content = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Confronto</th>
            <th>Placar</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map((g) => {
              const normalize = (str) =>
                str
                  ? str
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase()
                      .trim()
                  : "";
              const myTeamNorm = normalize(
                localStorage.getItem("clubName") || "Atlético Mineiro",
              );

              const isHomeMyTeam = normalize(g.homeTeam) === myTeamNorm;
              const isAwayMyTeam = normalize(g.awayTeam) === myTeamNorm;

              const homeDisplay = isHomeMyTeam
                ? `<strong>${g.homeTeam}</strong>`
                : g.homeTeam;
              const awayDisplay = isAwayMyTeam
                ? `<strong>${g.awayTeam}</strong>`
                : g.awayTeam;

              let badgeClass = "badge-primary";
              let badgeStyle = "";

              if (g.homeScore !== null && g.awayScore !== null) {
                if (
                  (isHomeMyTeam && g.homeScore < g.awayScore) ||
                  (isAwayMyTeam && g.awayScore < g.homeScore)
                ) {
                  badgeClass = "badge-danger";
                  badgeStyle =
                    "background-color: #ef4444 !important; color: #fff !important; border: none !important;";
                }
              }

              return `
            <tr>
              <td>${g.date ? g.date.split("T")[0].split("-").reverse().join("/") : "-"}</td>
              <td>${homeDisplay} x ${awayDisplay}</td>
              <td><span class="badge ${badgeClass}" style="${badgeStyle}">${g.homeScore ?? "-"} - ${g.awayScore ?? "-"}</span></td>
              <td>
                <div class="td-actions">
                  <button class="btn btn-info btn-sm js-view-game" data-id="${g._id}">Estatísticas</button>
                  ${
                    isAdmin
                      ? `
                  <button class="btn btn-primary btn-sm js-edit-game" data-id="${g._id}">Editar</button>
                  <button class="btn btn-danger btn-sm js-delete-game" data-id="${g._id}">Excluir</button>
                  `
                      : ""
                  }
                </div>
              </td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>`;
  }

  document.getElementById("app").innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title"><span class="emoji">🏟️</span> ${t("nav_games")}</h2>
        <p class="page-subtitle">${data.length} partidas registradas</p>
      </div>
      ${isAdmin ? `<button class="btn btn-primary" id="addGameBtn">+ Nova Partida</button>` : ""}
    </div>
    <div class="card"><div class="table-wrap">${content}</div></div>`;

  if (isAdmin && document.getElementById("addGameBtn")) {
    document
      .getElementById("addGameBtn")
      .addEventListener("click", () => openGameModal());
  }
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("js-view-game"))
    viewGameStats(e.target.dataset.id);
  if (e.target.classList.contains("js-edit-game"))
    openGameModal(e.target.dataset.id);
  if (e.target.classList.contains("js-delete-game"))
    deleteGame(e.target.dataset.id);
});

async function openGameModal(id = null) {
  document.getElementById("gameModalTitle").textContent = id
    ? "Editar Partida"
    : "Nova Partida";
  let g = { stats: [] };
  if (id) {
    try {
      g = (await request("GET", `/games/${id}`)).data;
    } catch (e) {}
  }

  const getStat = (sid, isHome) => {
    if (!g.stats) return "";
    const s = g.stats.find((x) => x.id === sid);
    return s ? (isHome ? s.home : s.away) : "";
  };

  const statsHtml = statFields
    .map(
      (f) => `
    <div class="form-row" style="margin-bottom: 0.5rem; align-items: center;">
      <div style="font-size: 0.8rem; font-weight: 700;">${f.label}</div>
      <div style="display: flex; gap: 0.5rem;">
        <input type="number" id="h_${f.id}" placeholder="Casa" value="${getStat(f.id, true)}" step="${f.type === "decimal" ? "0.01" : "1"}" style="padding: 0.4rem;">
        <input type="number" id="a_${f.id}" placeholder="Fora" value="${getStat(f.id, false)}" step="${f.type === "decimal" ? "0.01" : "1"}" style="padding: 0.4rem;">
      </div>
    </div>
  `,
    )
    .join("");

  document.getElementById("gameModalBody").innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Time da Casa</label><input type="text" id="gHome" value="${g.homeTeam || "Atlético Mineiro"}"></div>
      <div class="form-group"><label>Time Visitante</label><input type="text" id="gAway" value="${g.awayTeam || ""}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Gols Casa</label><input type="number" id="gHomeScore" value="${g.homeScore ?? ""}"></div>
      <div class="form-group"><label>Gols Visitante</label><input type="number" id="gAwayScore" value="${g.awayScore ?? ""}"></div>
    </div>
    <div class="form-group"><label>Data</label><input type="date" id="gDate" value="${g.date ? g.date.split("T")[0] : ""}"></div>
    <hr style="margin: 1rem 0; border-color: var(--border);">
    <h4 style="margin-bottom: 1rem; font-size: 0.9rem;">Estatísticas da Partida</h4>
    ${statsHtml}
    <div class="form-actions">
      <button class="btn btn-primary" id="saveGameBtn">Salvar</button>
      <button class="btn btn-ghost" onclick="closeModal('gameModal')">Cancelar</button>
    </div>`;

  document
    .getElementById("saveGameBtn")
    .addEventListener("click", () => saveGame(id));
  openModal("gameModal");
}

async function saveGame(id) {
  const homeTeam = document.getElementById("gHome").value.trim();
  const awayTeam = document.getElementById("gAway").value.trim();
  const date = document.getElementById("gDate").value;
  if (!homeTeam || !awayTeam || !date) return showAlert(t("err_fill"));

  const stats = statFields.map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    home: Number(document.getElementById(`h_${f.id}`).value) || 0,
    away: Number(document.getElementById(`a_${f.id}`).value) || 0,
  }));

  const hScoreVal = document.getElementById("gHomeScore").value;
  const aScoreVal = document.getElementById("gAwayScore").value;

  const body = {
    homeTeam,
    awayTeam,
    date,
    homeScore: hScoreVal !== "" ? Number(hScoreVal) : null,
    awayScore: aScoreVal !== "" ? Number(aScoreVal) : null,
    stats,
  };

  try {
    if (id) await request("PATCH", `/games/${id}`, body);
    else await request("POST", "/games", body);
    closeModal("gameModal");
    renderGames();
  } catch (e) {
    showAlert(e.message);
  }
}

async function deleteGame(id) {
  if (!confirm(t("confirm_delete"))) return;
  try {
    await request("DELETE", `/games/${id}`);
    renderGames();
  } catch (e) {
    showAlert(e.message);
  }
}

async function viewGameStats(id) {
  try {
    const { data } = await request("GET", `/games/${id}`);
    const statsHtml = data.stats
      .map((stat) => {
        const colorHome = stat.home >= stat.away ? "#4ade80" : "#475569";
        const colorAway = stat.away >= stat.home ? "#818cf8" : "#475569";
        const total = stat.home + stat.away;
        const homePct = total === 0 ? 50 : (stat.home / total) * 100;
        const awayPct = total === 0 ? 50 : (stat.away / total) * 100;
        const fVal = (v) => (stat.type === "percent" ? `${v}%` : v);

        if (stat.id === "possession") {
          return `
          <div style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.8rem; align-items: center;">
              <span style="background: #4ade80; color: #000; padding: 0.2rem 0.8rem; border-radius: 99px;">${fVal(stat.home)}</span>
              <span style="color: #fff;">${stat.label}</span>
              <span style="background: #818cf8; color: #fff; padding: 0.2rem 0.8rem; border-radius: 99px;">${fVal(stat.away)}</span>
            </div>
            <div style="display: flex; height: 12px; border-radius: 99px; overflow: hidden; background: #334155;">
              <div style="width: ${homePct}%; background: #4ade80; height: 100%;"></div>
              <div style="width: ${awayPct}%; background: #818cf8; height: 100%;"></div>
            </div>
          </div>`;
        }
        return `
        <div>
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem;">
            <span style="color: #fff;">${fVal(stat.home)}</span>
            <span style="color: #cbd5e1; font-size: 0.8rem;">${stat.label}</span>
            <span style="color: #fff;">${fVal(stat.away)}</span>
          </div>
          <div style="display: flex; gap: 6px; height: 6px; border-radius: 99px;">
            <div style="flex: 1; display: flex; justify-content: flex-end; background: #334155; border-radius: 99px; overflow: hidden;">
              <div style="width: ${homePct}%; background: ${colorHome}; height: 100%; border-radius: 99px;"></div>
            </div>
            <div style="flex: 1; background: #334155; border-radius: 99px; overflow: hidden;">
              <div style="width: ${awayPct}%; background: ${colorAway}; height: 100%; border-radius: 99px;"></div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    document.getElementById("gameModalTitle").textContent =
      "Estatísticas da Partida";
    document.getElementById("gameModalBody").innerHTML = `
      <div style="background: #18202f; border: none; color: #fff; padding: 2rem; border-radius: 16px; margin: -1rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; color: #fff;">Visão geral da partida</h3>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem; font-weight: 900;">
            <span style="color: #4ade80;">${data.homeTeam} ${data.homeScore ?? "-"}</span>
            <span style="font-size: 1rem; color: #94a3b8;">X</span>
            <span style="color: #818cf8;">${data.awayScore ?? "-"} ${data.awayTeam}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${statsHtml}
        </div>
      </div>`;
    openModal("gameModal");
  } catch (e) {
    showAlert(e.message);
  }
}

async function seedGaloGames() {
  const game = {
    homeTeam: "Atlético Mineiro",
    awayTeam: "Cruzeiro",
    date: new Date().toISOString().split("T")[0],
    homeScore: 3,
    awayScore: 0,
    stats: [
      {
        id: "possession",
        label: "Posse de bola",
        type: "percent",
        home: 68,
        away: 32,
      },
      {
        id: "xg",
        label: "Gols esperados (xG)",
        type: "decimal",
        home: 1.02,
        away: 0.42,
      },
      {
        id: "bigChances",
        label: "Grandes chances",
        type: "number",
        home: 1,
        away: 0,
      },
      { id: "shots", label: "Finalizações", type: "number", home: 15, away: 6 },
      {
        id: "saves",
        label: "Defesas do goleiro",
        type: "number",
        home: 3,
        away: 3,
      },
      { id: "corners", label: "Escanteios", type: "number", home: 6, away: 1 },
      { id: "fouls", label: "Faltas", type: "number", home: 4, away: 12 },
      { id: "passes", label: "Passes", type: "number", home: 627, away: 307 },
      { id: "tackles", label: "Desarmes", type: "number", home: 8, away: 15 },
      {
        id: "freeKicks",
        label: "Faltas (Tiros Diretos)",
        type: "number",
        home: 12,
        away: 4,
      },
      {
        id: "yellowCards",
        label: "Cartões amarelos",
        type: "number",
        home: 2,
        away: 4,
      },
    ],
  };
  try {
    await request("POST", "/games", game);
    renderGames();
    showAlert("Jogo carregado com sucesso!", "success");
  } catch (e) {
    showAlert(e.message);
  }
}
