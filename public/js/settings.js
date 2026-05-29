function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function shadeColor(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v) => Math.min(255, Math.max(0, v));
  const nr = clamp(
    r + (percent < 0 ? (r * percent) / 100 : ((255 - r) * percent) / 100),
  );
  const ng = clamp(
    g + (percent < 0 ? (g * percent) / 100 : ((255 - g) * percent) / 100),
  );
  const nb = clamp(
    b + (percent < 0 ? (b * percent) / 100 : ((255 - b) * percent) / 100),
  );
  return `#${Math.round(nr).toString(16).padStart(2, "0")}${Math.round(ng).toString(16).padStart(2, "0")}${Math.round(nb).toString(16).padStart(2, "0")}`;
}

function applyPrimaryColor(hex) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

  const luminance = getLuminance(hex);
  const textOnColor = luminance > 0.4 ? "#000000" : "#ffffff";
  const darkVariant = shadeColor(hex, -20);
  const dimVariant = shadeColor(hex, -70);

  document.documentElement.style.setProperty("--green", hex);
  document.documentElement.style.setProperty("--green-dark", darkVariant);
  document.documentElement.style.setProperty("--green-dim", dimVariant);

  let style = document.getElementById("dynamic-color-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "dynamic-color-style";
    document.head.appendChild(style);
  }

  style.textContent = `
    .btn-primary                     { color: ${textOnColor} !important; }
    .nav-brand                       { color: var(--green)   !important; }
    .card-title                      { color: var(--green)   !important; }
    .stat-number                     { color: var(--green)   !important; }
    .nav-btn.active                  { color: var(--green)   !important; }
    .auth-divider a                  { color: var(--green)   !important; }
    .badge-green                     { background: var(--green-dim) !important; }
    input:focus, select:focus        { border-color: var(--green)   !important; }
    .stat-card:hover                 { border-color: var(--green)   !important; }
    .club-logo-preview:hover         { border-color: var(--green)   !important; }
  `;
}

function updateNavBrand(logoUrl, clubName) {
  const brand = document.querySelector(".nav-brand");
  if (!brand) return;
  brand.innerHTML = logoUrl
    ? `<img src="${logoUrl}" alt="${clubName}" class="nav-club-logo" /> <span>${clubName}</span>`
    : `<span class="nav-logo">⚽</span> <span>${clubName || "ClubSync"}</span>`;
}

function previewLogo(url) {
  const preview = document.querySelector(".club-logo-preview");
  if (!preview) return;
  const name = document.getElementById("clubName")?.value || "";
  preview.innerHTML = url
    ? `<img src="${url}" alt="${name}" class="club-logo-img" onerror="this.style.display='none'" />
       <div class="club-logo-name">${name}</div>`
    : `<div class="club-logo-placeholder">⚽</div>
       <div class="club-logo-name">${name}</div>`;
}

function previewColor(value) {
  const textInput = document.getElementById("clubColorText");
  if (textInput) textInput.value = value;
  applyPrimaryColor(value);
}

function syncColorPicker(value) {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    const picker = document.getElementById("clubColor");
    if (picker) picker.value = value;
    applyPrimaryColor(value);
  }
}

async function renderSettings() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;
  try {
    const [clubRes, membersRes] = await Promise.all([
      request("GET", "/club"),
      request("GET", "/club/members"),
    ]);

    const club = clubRes.data;
    const members = membersRes.data;
    const isAdmin = currentUser.role === "admin";

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">⚙️ ${t("settings_title")}</h2>
          <p class="page-subtitle">${t("settings_subtitle")}</p>
        </div>
      </div>

      <div class="settings-grid">

        <!-- Club Profile -->
        <div class="card">
          <div class="card-title">🏟️ ${t("settings_club")}</div>

          <div class="club-logo-preview">
            ${
              club.logoUrl
                ? `<img src="${club.logoUrl}" alt="${club.name}" class="club-logo-img" />`
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
            <input
              type="url"
              id="clubLogo"
              value="${club.logoUrl || ""}"
              placeholder="https://example.com/logo.png"
              oninput="previewLogo(this.value)"
            />
            <p style="font-size:.75rem;color:var(--text-muted);margin-top:.3rem">
              ${t("settings_logo_tip")}
            </p>
          </div>

          <div class="form-group">
            <label>${t("settings_color")}</label>
            <div style="display:flex;gap:.75rem;align-items:center">
              <input
                type="color"
                id="clubColor"
                value="${club.primaryColor || "#00c853"}"
                style="width:48px;height:38px;padding:.1rem;cursor:pointer;border-radius:6px;border:1px solid var(--border)"
                oninput="previewColor(this.value)"
              />
              <input
                type="text"
                id="clubColorText"
                value="${club.primaryColor || "#00c853"}"
                placeholder="#00c853"
                style="flex:1"
                oninput="syncColorPicker(this.value)"
              />
            </div>
            <p style="font-size:.75rem;color:var(--text-muted);margin-top:.3rem">
              ${t("settings_color_tip")}
            </p>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" id="saveClubBtn">${t("form_save")}</button>
          </div>
          `
              : `
          <p style="margin-top:1rem;color:var(--text-muted);font-size:.88rem">
            ${t("settings_readonly")}
          </p>`
          }
        </div>

        <!-- Members -->
        <div class="card">
          <div class="card-title">👥 ${t("settings_members")}</div>
          <div class="table-wrap">
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
                    <td style="color:var(--text-muted);font-size:.85rem">${m.email}</td>
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
          </div>

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
              <label>${t("settings_email")}</label>
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

    localStorage.setItem("clubColor", data.primaryColor || "#00c853");
    localStorage.setItem("clubLogo", data.logoUrl || "");
    localStorage.setItem("clubName", data.name);

    applyPrimaryColor(data.primaryColor);
    updateNavBrand(data.logoUrl, data.name);
    showAlert(t("settings_saved"), "success");
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
