let currentUser = JSON.parse(localStorage.getItem("user") || "null");

function saveUser(user) {
  currentUser = user;
  localStorage.setItem("user", JSON.stringify(user));
}

function clearUser() {
  currentUser = null;
  localStorage.removeItem("user");
}

function authThemeToggleHTML() {
  const icon = currentTheme === "light" ? "🌙" : "☀️";
  return `<button type="button" class="icon-btn" id="authThemeBtn" title="Theme">${icon}</button>`;
}

function renderLogin() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.add("hidden");

  const topbar = document.getElementById("topbar");
  if (topbar) topbar.classList.add("hidden");

  document.getElementById("app").innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-box">
        <div class="auth-topbar">
          ${typeof langSwitcherHTML === "function" ? langSwitcherHTML() : ""}
          ${authThemeToggleHTML()}
        </div>
        <div class="auth-brand-mark">⚽</div>
        <h1 class="auth-title">Club<b>Sync</b></h1>
        <p class="auth-subtitle">${t("login_subtitle")}</p>

        <div class="form-group">
          <label>${t("login_email")}</label>
          <div class="input-with-icon">
            <span class="ico">📧</span>
            <input type="email" id="loginEmail" placeholder="you@club.com" autocomplete="email" />
          </div>
        </div>
        <div class="form-group">
          <label>${t("login_password")}</label>
          <div class="input-with-icon">
            <span class="ico">🔒</span>
            <input type="password" id="loginPassword" placeholder="••••••" autocomplete="current-password" />
          </div>
        </div>
        <button class="btn btn-primary" id="loginBtn">${t("login_btn")}</button>
        <p class="auth-divider">
          ${t("login_toggle")} <a id="toRegister">${t("login_toggle_link")}</a>
        </p>
        <div class="auth-foot">CLUBSYNC · FOOTBALL CLUB MANAGEMENT</div>
      </div>
    </div>`;

  wireAuthCommon();
  document.getElementById("loginBtn").addEventListener("click", doLogin);
  document
    .getElementById("toRegister")
    .addEventListener("click", renderRegister);
  document.getElementById("loginPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
}

function renderRegister() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.add("hidden");

  const topbar = document.getElementById("topbar");
  if (topbar) topbar.classList.add("hidden");

  document.getElementById("app").innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-box">
        <div class="auth-topbar">
          ${typeof langSwitcherHTML === "function" ? langSwitcherHTML() : ""}
          ${authThemeToggleHTML()}
        </div>
        <div class="auth-brand-mark">⚽</div>
        <h1 class="auth-title">Club<b>Sync</b></h1>
        <p class="auth-subtitle">${t("register_subtitle")}</p>

        <div class="form-group">
          <label>${t("register_name")}</label>
          <input type="text" id="regName" placeholder="Hulk Paraíba" autocomplete="name" />
        </div>
        <div class="form-group">
          <label>${t("register_email")}</label>
          <input type="email" id="regEmail" placeholder="you@club.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label>${t("register_password")}</label>
          <input type="password" id="regPassword" placeholder="••••••" autocomplete="new-password" />
        </div>
        <div class="form-group">
          <label>${t("register_club")}</label>
          <input type="text" id="regClub" placeholder="FC ClubSync" />
        </div>
        <button class="btn btn-primary" id="registerBtn">${t("register_btn")}</button>
        <p class="auth-divider">
          ${t("register_toggle")} <a id="toLogin">${t("register_toggle_link")}</a>
        </p>
        <div class="auth-foot">CLUBSYNC · FOOTBALL CLUB MANAGEMENT</div>
      </div>
    </div>`;

  wireAuthCommon();
  document.getElementById("registerBtn").addEventListener("click", doRegister);
  document.getElementById("toLogin").addEventListener("click", renderLogin);
}

function wireAuthCommon() {
  if (typeof bindLangSwitcher === "function") bindLangSwitcher();
  const themeBtn = document.getElementById("authThemeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
}

async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) {
    showAlert(t("err_fill"));
    return;
  }
  try {
    const data = await request("POST", "/auth/login", { email, password });
    setToken(data.token);
    saveUser(data.user);
    navigate("dashboard");
  } catch (e) {
    showAlert(e.message);
  }
}

async function doRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const clubName = document.getElementById("regClub").value.trim();
  if (!name || !email || !password || !clubName) {
    showAlert(t("err_fill"));
    return;
  }
  try {
    const data = await request("POST", "/auth/register", {
      name,
      email,
      password,
      clubName,
    });
    setToken(data.token);
    saveUser(data.user);
    navigate("dashboard");
  } catch (e) {
    showAlert(e.message);
  }
}

function logout() {
  clearToken();
  clearUser();
  localStorage.removeItem("clubColor");
  localStorage.removeItem("clubSecondary");
  localStorage.removeItem("clubLogo");
  localStorage.removeItem("clubName");
  renderLogin();
}
