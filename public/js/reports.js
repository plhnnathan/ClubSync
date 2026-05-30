async function renderReports() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  let data = [];
  const isAdmin = currentUser && currentUser.role === "admin";

  try {
    const res = await request("GET", "/reports");
    if (res && res.data) data = res.data;
  } catch (e) {
    console.warn(e);
  }

  let content = "";
  if (data.length === 0) {
    content = `
      <div class="empty-state">
        <span class="empty-emoji">📋</span>
        <p>${t("no_data")}</p>
        ${isAdmin ? `<button class="btn btn-primary" onclick="seedGaloReports()" style="margin-top: 1rem;">🐔 Carregar Avaliações</button>` : ""}
      </div>`;
  } else {
    content = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Jogador</th>
            <th>Adversário</th>
            <th>Nota</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (r) => `
            <tr>
              <td>${r.date}</td>
              <td><strong>${r.playerName}</strong></td>
              <td>${r.opponent}</td>
              <td><span class="badge ${r.rating >= 7 ? "badge-primary" : "badge-yellow"}">${r.rating}</span></td>
              <td>
                <div class="td-actions">
                  ${
                    isAdmin
                      ? `
                  <button class="btn btn-primary btn-sm js-edit-report" data-id="${r._id}">Editar</button>
                  <button class="btn btn-danger btn-sm js-delete-report" data-id="${r._id}">Excluir</button>
                  `
                      : ""
                  }
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>`;
  }

  document.getElementById("app").innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title"><span class="emoji">📋</span> ${t("nav_reports")}</h2>
        <p class="page-subtitle">${data.length} avaliações registradas</p>
      </div>
      ${isAdmin ? `<button class="btn btn-primary" id="addReportBtn">+ Nova Avaliação</button>` : ""}
    </div>
    <div class="card"><div class="table-wrap">${content}</div></div>`;

  if (isAdmin) {
    const addBtn = document.getElementById("addReportBtn");
    if (addBtn) addBtn.addEventListener("click", () => openReportModal());
  }
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("js-edit-report"))
    openReportModal(e.target.dataset.id);
  if (e.target.classList.contains("js-delete-report"))
    deleteReport(e.target.dataset.id);
});

async function openReportModal(id = null) {
  document.getElementById("reportModalTitle").textContent = id
    ? "Editar Avaliação"
    : "Nova Avaliação";
  let r = {};
  let players = [];

  try {
    if (id) r = (await request("GET", `/reports/${id}`)).data;
  } catch (e) {}

  try {
    const pRes = await request("GET", "/players");
    if (pRes && pRes.data) players = pRes.data;
  } catch (e) {}

  document.getElementById("reportModalBody").innerHTML = `
    <div class="form-group">
      <label>Jogador</label>
      <select id="rPlayer">
        ${players.map((p) => `<option value="${p.name}" ${r.playerName === p.name ? "selected" : ""}>${p.name}</option>`).join("")}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Adversário</label><input type="text" id="rOpponent" value="${r.opponent || ""}"></div>
      <div class="form-group"><label>Data</label><input type="date" id="rDate" value="${r.date || ""}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Minutos</label><input type="number" id="rMins" value="${r.minutes || 90}"></div>
      <div class="form-group"><label>Nota (0-10)</label><input type="number" id="rRating" step="0.1" value="${r.rating || 7.0}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Gols</label><input type="number" id="rGoals" value="${r.goals || 0}"></div>
      <div class="form-group"><label>Assistências</label><input type="number" id="rAssists" value="${r.assists || 0}"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" id="saveReportBtn">Salvar</button>
      <button class="btn btn-ghost" onclick="closeModal('reportModal')">Cancelar</button>
    </div>`;

  document
    .getElementById("saveReportBtn")
    .addEventListener("click", () => saveReport(id));
  openModal("reportModal");
}

async function saveReport(id) {
  const body = {
    playerName: document.getElementById("rPlayer").value,
    opponent: document.getElementById("rOpponent").value.trim(),
    date: document.getElementById("rDate").value,
    minutes: Number(document.getElementById("rMins").value),
    rating: Number(document.getElementById("rRating").value),
    goals: Number(document.getElementById("rGoals").value),
    assists: Number(document.getElementById("rAssists").value),
  };
  try {
    if (id) await request("PATCH", `/reports/${id}`, body);
    else await request("POST", "/reports", body);
    closeModal("reportModal");
    renderReports();
  } catch (e) {
    showAlert(e.message);
  }
}

async function deleteReport(id) {
  if (!confirm(t("confirm_delete"))) return;
  try {
    await request("DELETE", `/reports/${id}`);
    renderReports();
  } catch (e) {
    showAlert(e.message);
  }
}

async function seedGaloReports() {
  const rep = {
    playerName: "Hulk",
    opponent: "Cruzeiro",
    date: new Date().toISOString().split("T")[0],
    minutes: 90,
    rating: 8.5,
    goals: 2,
    assists: 0,
  };
  try {
    await request("POST", "/reports", rep);
    renderReports();
    showAlert("Avaliação carregada com sucesso!", "success");
  } catch (e) {
    showAlert(e.message);
  }
}
