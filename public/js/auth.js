let currentUser = JSON.parse(localStorage.getItem("user") || "null");

function saveUser(user) {
  currentUser = user;
  localStorage.setItem("user", JSON.stringify(user));
}

function clearUser() {
  currentUser = null;
  localStorage.removeItem("user");
}

function renderLogin() {
  document.getElementById("navbar").classList.add("hidden");
  document.getElementById("app").innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-box">
        <div class="auth-logo">⚽</div>
        <h1 class="auth-title">ClubSync</h1>
        <p class="auth-subtitle">${t("login_subtitle")}</p>

        <div class="form-group">
          <label>${t("login_email")}</label>
          <input type="email" id="loginEmail" placeholder="you@club.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label>${t("login_password")}</label>
          <input type="password" id="loginPassword" placeholder="••••••" autocomplete="current-password" />
        </div>

        <button class="btn btn-primary" style="width:100%" id="loginBtn">${t("login_btn")}</button>
        <p class="auth-divider">
          ${t("login_toggle")} <a onclick="renderRegister()">${t("login_toggle_link")}</a>
        </p>
      </div>
    </div>`;

  document.getElementById("loginBtn").addEventListener("click", doLogin);
  document.getElementById("loginPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
}

function renderRegister() {
  document.getElementById("app").innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-box">
        <div class="auth-logo">⚽</div>
        <h1 class="auth-title">ClubSync</h1>
        <p class="auth-subtitle">${t("register_subtitle")}</p>

        <div class="form-group">
          <label>${t("register_name")}</label>
          <input type="text" id="regName" placeholder="Nathan Silva" autocomplete="name" />
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

        <button class="btn btn-primary" style="width:100%" id="registerBtn">${t("register_btn")}</button>
        <p class="auth-divider">
          ${t("register_toggle")} <a onclick="renderLogin()">${t("register_toggle_link")}</a>
        </p>
      </div>
    </div>`;

  document.getElementById("registerBtn").addEventListener("click", doRegister);
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
  renderLogin();
}
