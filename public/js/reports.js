async function openReportModal() {
  try {
    const { data: players } = await request("GET", "/players");

    const titleEl = document.getElementById("reportModalTitle");
    titleEl.dataset.i18n = "modal_add_report";
    titleEl.textContent = t("modal_add_report");

    document.getElementById("reportModalBody").innerHTML = `
      <div class="form-group">
        <label data-i18n="form_player">${t("form_player")}</label>
        <select id="rPlayer">
          ${players.map((p) => `<option value="${p._id}">${p.name} · #${p.jerseyNumber}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label data-i18n="form_opponent">${t("form_opponent")}</label>
        <input type="text" id="rOpponent" placeholder="FC Rival" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="form_date">${t("form_date")}</label>
          <input type="date" id="rDate" />
        </div>
        <div class="form-group">
          <label data-i18n="form_minutes">${t("form_minutes")}</label>
          <input type="number" id="rMinutes" value="90" min="0" max="120" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="form_goals">${t("form_goals")}</label>
          <input type="number" id="rGoals" value="0" min="0" />
        </div>
        <div class="form-group">
          <label data-i18n="form_assists">${t("form_assists")}</label>
          <input type="number" id="rAssists" value="0" min="0" />
        </div>
      </div>
      <div class="form-group">
        <label data-i18n="form_rating">${t("form_rating")}</label>
        <input type="number" id="rRating" value="7.0" min="0" max="10" step="0.1" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="saveReportBtn" data-i18n="form_save">${t("form_save")}</button>
        <button class="btn btn-ghost" onclick="closeModal('reportModal')" data-i18n="form_cancel">${t("form_cancel")}</button>
      </div>`;

    document
      .getElementById("saveReportBtn")
      .addEventListener("click", saveReport);
    openModal("reportModal");
  } catch (e) {
    showAlert(e.message);
  }
}
