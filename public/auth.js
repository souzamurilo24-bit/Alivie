let sessionCache = null;
let sessionPromise = null;

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  const response = await fetch(path, {
    credentials: "include",
    headers,
    method: options.method || "GET",
    body: options.body,
  });
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = {};
    }
  }
  return { ok: response.ok, status: response.status, body };
}

async function fetchSession() {
  if (sessionPromise) {
    return sessionPromise;
  }
  sessionPromise = (async () => {
    try {
      const res = await api("/api/me");
      if (res.ok && res.body?.user?.email) {
        sessionCache = { email: res.body.user.email };
      } else {
        sessionCache = null;
      }
      return sessionCache;
    } catch {
      sessionCache = null;
      return null;
    }
  })();
  return sessionPromise;
}

function getSession() {
  return sessionCache;
}

async function logout() {
  await api("/api/logout", { method: "POST", body: "{}" });
  sessionCache = null;
  sessionPromise = null;
}

function renderHeader(container) {
  if (!container) return;
  const session = getSession();
  container.innerHTML = "";
  if (session?.email) {
    const wrap = document.createElement("div");
    wrap.className = "nav-auth-logged";
    const span = document.createElement("span");
    span.className = "nav-user-email";
    span.textContent = session.email;
    span.setAttribute("title", "Logado como " + session.email);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost";
    btn.textContent = "Sair";
    btn.addEventListener("click", async () => {
      await logout();
      window.location.reload();
    });
    wrap.appendChild(span);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  } else {
    const guestWrap = document.createElement("div");
    guestWrap.className = "nav-auth-guest";
    const aSignup = document.createElement("a");
    aSignup.href = "signup.html";
    aSignup.className = "btn btn-ghost";
    aSignup.textContent = "Criar conta";
    const aLogin = document.createElement("a");
    aLogin.href = "login.html";
    aLogin.className = "btn btn-primary";
    aLogin.textContent = "Entrar";
    guestWrap.appendChild(aSignup);
    guestWrap.appendChild(aLogin);
    container.appendChild(guestWrap);
  }
}

function updateProfileLinkVisibility() {
  const session = getSession();
  const profileLinks = document.querySelectorAll('a[href="perfil.html"]');
  
  profileLinks.forEach(link => {
    if (session?.email) {
      link.style.display = "";
      link.removeAttribute("hidden");
    } else {
      link.style.display = "none";
      link.setAttribute("hidden", "true");
    }
  });
}

function updateWelcomeBanner() {
  const el = document.getElementById("auth-welcome");
  if (!el) return;
  const session = getSession();
  if (session?.email) {
    el.textContent = "Você está logado como " + session.email + ".";
    el.hidden = false;
  }
}

function updateComeceGuestPanel() {
  const panel = document.getElementById("comece-panel-guest");
  if (!panel) return;
  const session = getSession();
  panel.hidden = !!session?.email;
}

function initLoginPage() {
  const form = document.getElementById("login-form");
  const errEl = document.getElementById("login-error");
  if (!form) return;

  if (getSession()) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: email?.value || "",
          password: password?.value || "",
        }),
      });
      if (res.ok) {
        window.location.href = "index.html";
      } else if (errEl) {
        errEl.textContent = res.body?.error || "Não foi possível entrar.";
        errEl.hidden = false;
      }
    } catch {
      if (errEl) {
        errEl.textContent = "Erro de conexão. Tente de novo.";
        errEl.hidden = false;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function initSignupPage() {
  const form = document.getElementById("signup-form");
  const errEl = document.getElementById("signup-error");
  if (!form) return;

  if (getSession()) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    const confirm = form.querySelector('[name="confirm"]');
    const submitBtn = form.querySelector('[type="submit"]');

    if (password && confirm && password.value !== confirm.value) {
      if (errEl) {
        errEl.textContent = "As senhas não coincidem.";
        errEl.hidden = false;
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await api("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          email: email?.value || "",
          password: password?.value || "",
        }),
      });
      if (res.ok) {
        window.location.href = "login.html?cadastro=ok";
      } else if (errEl) {
        errEl.textContent = res.body?.error || "Não foi possível cadastrar.";
        errEl.hidden = false;
      }
    } catch {
      if (errEl) {
        errEl.textContent = "Erro de conexão. Tente de novo.";
        errEl.hidden = false;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

window.Auth = {
  api,
  fetchSession,
  getSession,
  logout,
  renderHeader,
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchSession();
  const navAuth = document.getElementById("nav-auth");
  if (navAuth) {
    renderHeader(navAuth);
  }
  updateWelcomeBanner();
  updateComeceGuestPanel();
  updateProfileLinkVisibility();
  initLoginPage();
  initSignupPage();
  if (typeof initFormulario === "function") {
    initFormulario();
  }

  const loginNotice = document.getElementById("login-notice");
  if (loginNotice && window.location.search.includes("cadastro=ok")) {
    loginNotice.hidden = false;
  }
});
