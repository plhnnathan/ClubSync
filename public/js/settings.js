let _logoSrc = "";

function fileToDataUrl(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderLogoPreview() {
  const preview = document.querySelector(".club-logo-preview");
  if (!preview) return;
  const name = document.getElementById("clubName")?.value || "";
  preview.innerHTML = _logoSrc
    ? `<img src="${_logoSrc}" alt="${name}" class="club-logo-img" onerror="this.replaceWith(document.createElement('div'))" />
       <div class="club-logo-name">${name}</div>
       <div class="logo-hint">${t("settings_logo_dnd")}</div>`
    : `<div class="club-logo-placeholder">⚽</div>
       <div class="club-logo-name">${name}</div>
       <div class="logo-hint">${t("settings_logo_dnd")}</div>`;
}

async function setLogo(src, { extract = true } = {}) {
  _logoSrc = src;
  renderLogoPreview();
  if (extract && src) await extractAndApply(src);
}

async function extractAndApply(src) {
  const banner = document.getElementById("extractBanner");
  if (banner) {
    banner.style.display = "flex";
    banner.textContent = "🎨 " + t("settings_extracting");
  }
  try {
    const { primary, secondary, palette } = await extractPaletteFromImage(src);
    setColorInputs(primary, secondary);
    applyPrimaryColor(primary);
    applySecondaryColor(secondary);
    renderSwatches(palette);
    updateColorPreview();
    if (banner) {
      banner.className = "extract-banner";
      banner.textContent = "🎨 " + t("settings_extract_hint");
    }
    showAlert(t("settings_extract_done"), "success");
  } catch (e) {
    if (banner) {
      banner.style.display = "flex";
      banner.style.background = "var(--warning-soft)";
      banner.style.color = "#b45309";
      banner.textContent = "⚠️ " + t("settings_extract_fail");
    }
    showAlert(t("settings_extract_fail"));
  }
}

function setColorInputs(primary, secondary) {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };
  if (isHex(primary)) {
    set("clubColor", primary);
    set("clubColorText", primary);
  }
  if (isHex(secondary)) {
    set("clubSecondary", secondary);
    set("clubSecondaryText", secondary);
  }
}

function renderSwatches(palette) {
  const wrap = document.getElementById("colorSwatches");
  if (!wrap) return;
  wrap.innerHTML = palette
    .map(
      (hex) =>
        `<div class="color-swatch" style="background:${hex}" title="${hex}"
          data-hex="${hex}"></div>`,
    )
    .join("");
  wrap.querySelectorAll(".color-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const hex = sw.dataset.hex;
      setColorInputs(hex, document.getElementById("clubSecondaryText").value);
      applyPrimaryColor(hex);
      updateColorPreview();
    });
  });
}

function previewColor(value) {
  const text = document.getElementById("clubColorText");
  if (text) text.value = value;
  applyPrimaryColor(value);
  updateColorPreview();
}

function syncColorPicker(value) {
  if (!isHex(value)) return;
  const picker = document.getElementById("clubColor");
  if (picker) picker.value = value;
  applyPrimaryColor(value);
  updateColorPreview();
}

function previewSecondary(value) {
  const text = document.getElementById("clubSecondaryText");
  if (text) text.value = value;
  applySecondaryColor(value);
  updateColorPreview();
}

function syncSecondaryPicker(value) {
  if (!isHex(value)) return;
  const picker = document.getElementById("clubSecondary");
  if (picker) picker.value = value;
  applySecondaryColor(value);
  updateColorPreview();
}

function updateColorPreview() {
  const primary = document.getElementById("clubColorText")?.value || "#00c853";
  const secondary =
    document.getElementById("clubSecondaryText")?.value || "#3b82f6";

  const card = (bg, surface, border, neutralText, neutralBg, neutralBorder) => {
    const pText = getLuminance(primary) > 0.55 ? "#000" : "#fff";
    const sText = getLuminance(secondary) > 0.55 ? "#000" : "#fff";
    return `
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem">
        <div style="width:22px;height:22px;background:${primary};border-radius:6px"></div>
        <span style="font-weight:800;color:${primary};font-size:.9rem">ClubSync</span>
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem">
        <span style="background:${primary};color:${pText};padding:.2rem .7rem;border-radius:99px;font-size:.7rem;font-weight:700">PRIMARY</span>
        <span style="background:${secondary};color:${sText};padding:.2rem .7rem;border-radius:99px;font-size:.7rem;font-weight:700">SECONDARY</span>
        <span style="background:${neutralBg};border:1px solid ${neutralBorder};color:${neutralText};padding:.2rem .7rem;border-radius:99px;font-size:.7rem;font-weight:700">NEUTRAL</span>
      </div>
      <div style="height:6px;border-radius:99px;background:${border};overflow:hidden">
        <div style="width:70%;height:100%;background:${primary};border-radius:99px"></div>
      </div>`;
  };

  const light = document.getElementById("colorPreviewLight");
  const dark = document.getElementById("colorPreviewDark");
  if (light) {
    light.style.background = "#f0f2f5";
    light.innerHTML = card(
      "#f0f2f5",
      "#fff",
      "#e5e7eb",
      "#111827",
      "#f3f4f6",
      "#d1d5db",
    );
  }
  if (dark) {
    dark.style.background = "#0f1626";
    dark.innerHTML = card(
      "#0f1626",
      "#18202f",
      "#232d40",
      "#f1f5f9",
      "#18202f",
      "#232d40",
    );
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
    const primaryColor = club.primaryColor || "#00c853";
    const secondaryColor = club.secondaryColor || "#3b82f6";
    _logoSrc = club.logoUrl || "";

    document.getElementById("app").innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title"><span class="emoji">⚙️</span> ${t("settings_title")}</h2>
          <p class="page-subtitle">${t("settings_subtitle")}</p>
        </div>
      </div>

      <div class="settings-grid">
        <div class="card">
          <div class="card-title"><span class="dot"></span> ${t("settings_club")}</div>

          <div class="form-group" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border)">
            <label>Idioma da Plataforma</label>
            ${typeof langSwitcherHTML === "function" ? langSwitcherHTML() : ""}
          </div>

          <div class="club-logo-preview" id="logoDrop"></div>

          ${
            isAdmin
              ? `
          <div class="upload-row">
            <button class="btn btn-ghost btn-block" id="uploadBtn">⬆️ ${t("settings_upload")}</button>
            <input type="file" id="logoFile" accept="image/*" class="hidden" />
          </div>

          <div class="form-group" style="margin-top:1rem">
            <label>${t("settings_club_name")}</label>
            <input type="text" id="clubName" value="${club.name}" oninput="renderLogoPreview()" />
          </div>

          <div class="form-group">
            <label>${t("settings_logo_url")}</label>
            <input type="url" id="clubLogo" value="${club.logoUrl || ""}"
              placeholder="https://example.com/logo.png" />
            <p class="field-tip">${t("settings_logo_tip")}</p>
          </div>

          <div class="extract-banner" id="extractBanner" style="display:none"></div>

          <div class="form-group">
            <label>${t("settings_color")}</label>
            <div class="color-input-row">
              <input type="color" id="clubColor" value="${primaryColor}"
                oninput="previewColor(this.value)" />
              <input type="text" id="clubColorText" value="${primaryColor}"
                placeholder="#00c853" oninput="syncColorPicker(this.value)" />
            </div>
            <p class="field-tip">${t("settings_color_tip")}</p>
            <div class="color-swatches" id="colorSwatches"></div>
          </div>

          <div class="form-group">
            <label>${t("settings_secondary")}</label>
            <div class="color-input-row">
              <input type="color" id="clubSecondary" value="${secondaryColor}"
                oninput="previewSecondary(this.value)" />
              <input type="text" id="clubSecondaryText" value="${secondaryColor}"
                placeholder="#3b82f6" oninput="syncSecondaryPicker(this.value)" />
            </div>
            <p class="field-tip">${t("settings_secondary_tip")}</p>
          </div>

          <div class="color-preview-grid">
            <div>
              <p class="field-tip" style="margin-bottom:.4rem">☀️ ${t("settings_light_preview")}</p>
              <div id="colorPreviewLight" class="color-preview-box"></div>
            </div>
            <div>
              <p class="field-tip" style="margin-bottom:.4rem">🌙 ${t("settings_dark_preview")}</p>
              <div id="colorPreviewDark" class="color-preview-box"></div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-ghost" id="reExtractBtn">🎨 ${t("settings_extract")}</button>
            <button class="btn btn-primary" id="saveClubBtn">${t("form_save")}</button>
          </div>
          `
              : `<p style="margin-top:1rem;color:var(--text-muted);font-size:.88rem">
                  ${t("settings_readonly")}
                </p>`
          }
        </div>

        <div class="card">
          <div class="card-title"><span class="dot"></span> ${t("settings_members")}</div>
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
                      <span class="badge badge-${m.role === "admin" ? "primary" : "secondary"}">
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
          <div style="margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--border)">
            <div class="card-title"><span class="dot"></span> ${t("settings_add_analyst")}</div>
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

    renderLogoPreview();
    updateColorPreview();

    if (typeof bindLangSwitcher === "function") bindLangSwitcher();
    if (isAdmin) wireSettings();
  } catch (e) {
    showAlert(e.message);
  }
}

function wireSettings() {
  document.getElementById("saveClubBtn").addEventListener("click", saveClub);
  document
    .getElementById("addAnalystBtn")
    .addEventListener("click", addAnalyst);

  const fileInput = document.getElementById("logoFile");
  document
    .getElementById("uploadBtn")
    .addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      document.getElementById("clubLogo").value = dataUrl;
      await setLogo(dataUrl);
    } catch (_) {
      showAlert(t("settings_extract_fail"));
    }
  });

  const urlInput = document.getElementById("clubLogo");
  urlInput.addEventListener("change", () => {
    if (urlInput.value.trim()) setLogo(urlInput.value.trim());
    else renderLogoPreview();
  });

  document.getElementById("reExtractBtn").addEventListener("click", () => {
    if (_logoSrc) extractAndApply(_logoSrc);
    else showAlert(t("settings_extract_fail"));
  });

  const drop = document.getElementById("logoDrop");
  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("dragover");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove("dragover");
    }),
  );
  drop.addEventListener("drop", async (e) => {
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      document.getElementById("clubLogo").value = dataUrl;
      await setLogo(dataUrl);
    } catch (_) {
      showAlert(t("settings_extract_fail"));
    }
  });
}

async function saveClub() {
  const name = document.getElementById("clubName").value.trim();
  const logoUrl = document.getElementById("clubLogo").value.trim();
  const primaryColor = document.getElementById("clubColorText").value.trim();
  const secondaryColor = document
    .getElementById("clubSecondaryText")
    .value.trim();

  if (!name) {
    showAlert(t("err_fill"));
    return;
  }

  try {
    const { data } = await request("PATCH", "/club", {
      name,
      logoUrl,
      primaryColor,
      secondaryColor,
    });

    localStorage.setItem("clubColor", data.primaryColor || "#00c853");
    localStorage.setItem("clubSecondary", data.secondaryColor || "#3b82f6");
    localStorage.setItem("clubLogo", data.logoUrl || "");
    localStorage.setItem("clubName", data.name);

    applyPrimaryColor(data.primaryColor, true);
    applySecondaryColor(data.secondaryColor, true);
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
