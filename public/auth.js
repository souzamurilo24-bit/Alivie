(function () {
  var sessionCache = null;
  var sessionPromise = null;

  function api(path, options) {
    var opts = options || {};
    var headers = Object.assign(
      { "Content-Type": "application/json" },
      opts.headers || {}
    );
    return fetch(path, {
      credentials: "include",
      headers: headers,
      method: opts.method || "GET",
      body: opts.body,
    }).then(function (r) {
      return r.text().then(function (text) {
        var body = {};
        if (text) {
          try {
            body = JSON.parse(text);
          } catch (e) {
            body = {};
          }
        }
        return { ok: r.ok, status: r.status, body: body };
      });
    });
  }

  function fetchSession() {
    if (sessionPromise) {
      return sessionPromise;
    }
    sessionPromise = api("/api/me")
      .then(function (res) {
        if (res.ok && res.body && res.body.user && res.body.user.email) {
          sessionCache = { email: res.body.user.email };
        } else {
          sessionCache = null;
        }
        return sessionCache;
      })
      .catch(function () {
        sessionCache = null;
        return null;
      });
    return sessionPromise;
  }

  function getSession() {
    return sessionCache;
  }

  function logout() {
    return api("/api/logout", { method: "POST", body: "{}" }).then(
      function () {
        sessionCache = null;
        sessionPromise = null;
      }
    );
  }

  function renderHeader(container) {
    if (!container) return;
    var session = getSession();
    container.innerHTML = "";
    if (session && session.email) {
      var wrap = document.createElement("div");
      wrap.className = "nav-auth-logged";
      var span = document.createElement("span");
      span.className = "nav-user-email";
      span.textContent = session.email;
      span.setAttribute("title", "Logado como " + session.email);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost";
      btn.textContent = "Sair";
      btn.addEventListener("click", function () {
        logout().then(function () {
          window.location.reload();
        });
      });
      wrap.appendChild(span);
      wrap.appendChild(btn);
      container.appendChild(wrap);
    } else {
      var guestWrap = document.createElement("div");
      guestWrap.className = "nav-auth-guest";
      var aSignup = document.createElement("a");
      aSignup.href = "signup.html";
      aSignup.className = "btn btn-ghost";
      aSignup.textContent = "Criar conta";
      var aLogin = document.createElement("a");
      aLogin.href = "login.html";
      aLogin.className = "btn btn-primary";
      aLogin.textContent = "Entrar";
      guestWrap.appendChild(aSignup);
      guestWrap.appendChild(aLogin);
      container.appendChild(guestWrap);
    }
  }

  function updateProfileLinkVisibility() {
    var session = getSession();
    var profileLinks = document.querySelectorAll('a[href="perfil.html"]');
    
    profileLinks.forEach(function(link) {
      if (session && session.email) {
        // User is logged in, show profile link
        link.style.display = "";
        link.removeAttribute("hidden");
      } else {
        // User is not logged in, hide profile link
        link.style.display = "none";
        link.setAttribute("hidden", "true");
      }
    });
  }

  function updateWelcomeBanner() {
    var el = document.getElementById("auth-welcome");
    if (!el) return;
    var session = getSession();
    if (session && session.email) {
      el.textContent = "Você está logado como " + session.email + ".";
      el.hidden = false;
    }
  }

  function updateComeceGuestPanel() {
    var panel = document.getElementById("comece-panel-guest");
    if (!panel) return;
    var session = getSession();
    if (session && session.email) {
      panel.hidden = true;
    } else {
      panel.hidden = false;
    }
  }

  function initLoginPage() {
    var form = document.getElementById("login-form");
    var errEl = document.getElementById("login-error");
    if (!form) return;

    if (getSession()) {
      window.location.href = "index.html";
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errEl) {
        errEl.hidden = true;
        errEl.textContent = "";
      }
      var email = form.querySelector('[name="email"]');
      var password = form.querySelector('[name="password"]');
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      api("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: email ? email.value : "",
          password: password ? password.value : "",
        }),
      })
        .then(function (res) {
          if (res.ok) {
            window.location.href = "index.html";
          } else if (errEl) {
            errEl.textContent =
              (res.body && res.body.error) || "Não foi possível entrar.";
            errEl.hidden = false;
          }
        })
        .catch(function () {
          if (errEl) {
            errEl.textContent = "Erro de conexão. Tente de novo.";
            errEl.hidden = false;
          }
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function initSignupPage() {
    var form = document.getElementById("signup-form");
    var errEl = document.getElementById("signup-error");
    if (!form) return;

    if (getSession()) {
      window.location.href = "index.html";
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errEl) {
        errEl.hidden = true;
        errEl.textContent = "";
      }
      var email = form.querySelector('[name="email"]');
      var password = form.querySelector('[name="password"]');
      var confirm = form.querySelector('[name="confirm"]');
      var submitBtn = form.querySelector('[type="submit"]');

      if (password && confirm && password.value !== confirm.value) {
        if (errEl) {
          errEl.textContent = "As senhas não coincidem.";
          errEl.hidden = false;
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      api("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          email: email ? email.value : "",
          password: password ? password.value : "",
        }),
      })
        .then(function (res) {
          if (res.ok) {
            window.location.href = "login.html?cadastro=ok";
          } else if (errEl) {
            errEl.textContent =
              (res.body && res.body.error) || "Não foi possível cadastrar.";
            errEl.hidden = false;
          }
        })
        .catch(function () {
          if (errEl) {
            errEl.textContent = "Erro de conexão. Tente de novo.";
            errEl.hidden = false;
          }
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  window.Auth = {
    api: api,
    fetchSession: fetchSession,
    getSession: getSession,
    logout: logout,
    renderHeader: renderHeader,
  };

  document.addEventListener("DOMContentLoaded", function () {
    fetchSession().then(function () {
      var navAuth = document.getElementById("nav-auth");
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

      var loginNotice = document.getElementById("login-notice");
      if (loginNotice && window.location.search.indexOf("cadastro=ok") !== -1) {
        loginNotice.hidden = false;
      }
    });
  });
})();
