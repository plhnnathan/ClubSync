async function renderSettings() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const { data: club } = await request("GET", "/club");
    const { data: members } = await request("GET", "/club/members");
    const isAdmin = currentUser.role === "admin";

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">⚙️ ${t("settings_title")}</h2>
          <p class="page-subtitle">${t("settings_subtitle")}</p>
        </div>
      </div>

      <div class="settings-grid">
        <div class="card">
          <div class="card-title">🏟️ ${t("settings_club")}</div>

          <div class="club-logo-preview">
            ${
              club.logoUrl
                ? `<img src="${club.logoUrl}" alt="Club Logo" class="club-logo-img" />`
                : `<div class="club-logo-placeholder">⚽</div>`
            }
            <div class="club-logo-name">${club.name}</div>
          </div>

          ${
            isAdmin
              ? `
          <div class="form-group" style="margin-top:1.5rem">
            <label>${t("settings_club_name")}</label>
            <input type="text" id="clubName" value="${club.name}" />
          </div>
          <div class="form-group">
            <label>${t("settings_logo_url")}</label>
            <input type="url" id="clubLogo" value="${club.logoUrl || ""}"
              placeholder="https://example.com/logo.png"
              oninput="previewLogo(this.value)" />
            <p style="font-size:.75rem;color:var(--text-muted);margin-top:.3rem">
              ${t("settings_logo_tip")}
            </p>
          </div>
          <div class="form-group">
            <label>${t("settings_color")}</label>
            <div style="display:flex;gap:.75rem;align-items:center">
              <input type="color" id="clubColor" value="${club.primaryColor || "#00c853"}"
                style="width:48px;height:38px;padding:.1rem;cursor:pointer"
                oninput="previewColor(this.value)" />
              <input type="text" id="clubColorText" value="${club.primaryColor || "#00c853"}"
                style="flex:1" placeholder="#00c853"
                oninput="syncColorPicker(this.value)" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" id="saveClubBtn">${t("form_save")}</button>
          </div>`
              : `
          <div style="margin-top:1rem;color:var(--text-muted);font-size:.88rem">
            ${t("settings_readonly")}
          </div>`
          }
        </div>

        <div class="card">
          <div class="card-title">👥 ${t("settings_members")}</div>
          <table>
            <thead>
              <tr>
                <th>${t("form_name")}</th>
                <th>${t("settings_email")}</th>
                <th>${t("players_status")}</th>
              </tr>
            </thead>
            <tbody>
              ${members
                .map(
                  (m) => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td style="color:var(--text-muted)">${m.email}</td>
                  <td>
                    <span class="badge badge-${m.role === "admin" ? "green" : "blue"}">
                      ${m.role === "admin" ? t("role_admin") : t("role_analyst")}
                    </span>
                  </td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>

          ${
            isAdmin
              ? `
          <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">
            <div class="card-title">➕ ${t("settings_add_analyst")}</div>
            <div class="form-group">
              <label>${t("form_name")}</label>
              <input type="text" id="analystName" placeholder="Carlos Analyst" />
            </div>
            <div class="form-group">
              <label>${t("register_email")}</label>
              <input type="email" id="analystEmail" placeholder="carlos@club.com" />
            </div>
            <div class="form-group">
              <label>${t("login_password")}</label>
              <input type="password" id="analystPassword" placeholder="••••••" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" id="addAnalystBtn">${t("settings_add_analyst")}</button>
            </div>
          </div>`
              : ""
          }
        </div>
      </div>`;

    if (isAdmin) {
      document
        .getElementById("saveClubBtn")
        .addEventListener("click", saveClub);
      document
        .getElementById("addAnalystBtn")
        .addEventListener("click", addAnalyst);
    }
  } catch (e) {
    showAlert(e.message);
  }
}

function previewLogo(url) {
  const preview = document.querySelector(".club-logo-preview");
  if (!preview) return;
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Club Logo" class="club-logo-img"
      onerror="this.style.display='none'" />
      <div class="club-logo-name">${document.getElementById("clubName")?.value || ""}</div>`;
  } else {
    preview.innerHTML = `<div class="club-logo-placeholder">⚽</div>
      <div class="club-logo-name">${document.getElementById("clubName")?.value || ""}</div>`;
  }
}

function previewColor(value) {
  document.getElementById("clubColorText").value = value;
  document.documentElement.style.setProperty("--green", value);
}

function syncColorPicker(value) {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    document.getElementById("clubColor").value = value;
    document.documentElement.style.setProperty("--green", value);
  }
}

async function saveClub() {
  const name = document.getElementById("clubName").value.trim();
  const logoUrl = document.getElementById("clubLogo").value.trim();
  const primaryColor = document.getElementById("clubColorText").value.trim();

  if (!name) {
    showAlert(t("err_fill"));
    return;
  }

  try {
    const { data } = await request("PATCH", "/club", {
      name,
      logoUrl,
      primaryColor,
    });
    showAlert(t("settings_saved"), "success");
    updateNavLogo(data.logoUrl, data.name, data.primaryColor);
  } catch (e) {
    showAlert(e.message);
  }
}

async function addAnalyst() {
  const name = document.getElementById("analystName").value.trim();
  const email = document.getElementById("analystEmail").value.trim();
  const password = document.getElementById("analystPassword").value;

  if (!name || !email || !password) {
    showAlert(t("err_fill"));
    return;
  }

  try {
    await request("POST", "/auth/analysts", { name, email, password });
    showAlert(t("settings_analyst_added"), "success");
    renderSettings();
  } catch (e) {
    showAlert(e.message);
  }
}

function updateNavLogo(logoUrl, clubName, primaryColor) {
  if (primaryColor) {
    document.documentElement.style.setProperty("--green", primaryColor);
  }
  const brand = document.querySelector(".nav-brand");
  if (brand) {
    brand.innerHTML = logoUrl
      ? `<img src="${logoUrl}" alt="${clubName}" class="nav-club-logo" /> <span>${clubName}</span>`
      : `<span class="nav-logo">⚽</span> <span>${clubName}</span>`;
  }
}
