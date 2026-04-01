(function () {
  var modalEl = null;

  function api(path, options) {
    var opts = options || {};
    return fetch(path, {
      credentials: "include",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        opts.headers || {}
      ),
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

  function ensureModal() {
    if (document.getElementById("formulario-modal")) {
      modalEl = document.getElementById("formulario-modal");
      return;
    }

    var wrap = document.createElement("div");
    wrap.id = "formulario-modal";
    wrap.className = "modal";
    wrap.hidden = true;
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "formulario-modal-title");

    wrap.innerHTML =
      '<div class="modal__backdrop" data-close-modal tabindex="-1"></div>' +
      '<div class="modal__dialog">' +
      '<button type="button" class="modal__close" aria-label="Fechar">×</button>' +
      '<h2 id="formulario-modal-title" class="modal__title">Questionário de rotina</h2>' +
      '<p class="modal__hint">Responda com calma. Você pode salvar e editar este formulário quando quiser.</p>' +
      '<form id="formulario-form" class="modal-form">' +
      '<div class="modal-form__field">' +
      '<label for="f-rotina">Como é sua rotina semanal (trabalho, estudos, família)?</label>' +
      '<textarea id="f-rotina" name="rotina_diaria" rows="3" maxlength="8000"></textarea>' +
      "</div>" +
      '<div class="modal-form__field">' +
      '<label for="f-sono">Sono em média</label>' +
      '<select id="f-sono" name="horas_sono">' +
      '<option value="">Selecione</option>' +
      '<option value="Menos de 5 horas">Menos de 5 horas</option>' +
      '<option value="Entre 5 e 7 horas">Entre 5 e 7 horas</option>' +
      '<option value="Entre 7 e 9 horas">Entre 7 e 9 horas</option>' +
      '<option value="Mais de 9 horas">Mais de 9 horas</option>' +
      "</select>" +
      "</div>" +
      '<div class="modal-form__field">' +
      '<label for="f-trabalho">Carga de trabalho ou responsabilidades no dia a dia</label>' +
      '<select id="f-trabalho" name="carga_trabalho">' +
      '<option value="">Selecione</option>' +
      '<option value="Leve">Leve</option>' +
      '<option value="Moderada">Moderada</option>' +
      '<option value="Pesada">Pesada</option>' +
      '<option value="Muito pesada">Muito pesada</option>' +
      "</select>" +
      "</div>" +
      '<div class="modal-form__field">' +
      '<label for="f-melhorar">O que você mais quer melhorar agora?</label>' +
      '<textarea id="f-melhorar" name="foco_melhorar" rows="3" maxlength="8000"></textarea>' +
      "</div>" +
      '<div class="modal-form__field">' +
      '<label for="f-mente">Cuidados com a saúde mental (humor, ansiedade, descanso mental)</label>' +
      '<textarea id="f-mente" name="cuidados_mente" rows="3" maxlength="8000"></textarea>' +
      "</div>" +
      '<div class="modal-form__field">' +
      '<label for="f-obs">Observações ou algo mais que queira contar</label>' +
      '<textarea id="f-obs" name="observacoes" rows="3" maxlength="8000"></textarea>' +
      "</div>" +
      '<div id="formulario-prompt-wrap" class="modal-prompt-wrap" role="region" aria-label="Prompt condensado">' +
      '<h3 class="modal-prompt-title">Prompt condensado</h3>' +
      '<p class="modal-prompt-hint">Somente leitura. Aparece aqui ao salvar o formulário.</p>' +
      '<div class="modal-prompt-readonly">' +
      '<pre id="formulario-prompt-text" class="modal-prompt-text modal-prompt-text--placeholder" contenteditable="false" aria-label="Prompt condensado, somente leitura"></pre>' +
      "</div>" +
      "</div>" +
      '<p id="formulario-modal-msg" class="modal-form__msg" role="status" hidden></p>' +
      '<div class="modal-form__actions">' +
      '<button type="button" class="btn btn-ghost" data-close-modal>Cancelar</button>' +
      '<button type="submit" class="btn btn-primary">Salvar formulário</button>' +
      "</div>" +
      "</form>" +
      "</div>";

    document.body.appendChild(wrap);
    modalEl = wrap;

    wrap.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    var form = document.getElementById("formulario-form");
    if (form) {
      form.addEventListener("submit", onSubmitForm);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl && !modalEl.hidden) {
        closeModal();
      }
    });
  }

  var PLACEHOLDER_PROMPT =
    "Nenhum prompt salvo ainda. Preencha os campos acima e clique em Salvar formulário para gerar o prompt condensado."

  function updatePromptPreview(text) {
    var wrap = document.getElementById("formulario-prompt-wrap");
    var pre = document.getElementById("formulario-prompt-text");
    if (!wrap || !pre) return;
    var s = text != null ? String(text).trim() : "";
    if (s) {
      pre.textContent = s;
      pre.classList.remove("modal-prompt-text--placeholder");
    } else {
      pre.textContent = PLACEHOLDER_PROMPT;
      pre.classList.add("modal-prompt-text--placeholder");
    }
  }

  function fillForm(data) {
    var form = document.getElementById("formulario-form");
    if (!form) return;
    var keys = [
      "rotina_diaria",
      "horas_sono",
      "carga_trabalho",
      "foco_melhorar",
      "cuidados_mente",
      "observacoes",
    ];
    keys.forEach(function (k) {
      var el = form.querySelector('[name="' + k + '"]');
      if (el) {
        el.value = data[k] != null ? String(data[k]) : "";
      }
    });
  }

  function collectForm() {
    var form = document.getElementById("formulario-form");
    if (!form) return {};
    var keys = [
      "rotina_diaria",
      "horas_sono",
      "carga_trabalho",
      "foco_melhorar",
      "cuidados_mente",
      "observacoes",
    ];
    var out = {};
    keys.forEach(function (k) {
      var el = form.querySelector('[name="' + k + '"]');
      out[k] = el ? el.value : "";
    });
    return out;
  }

  function openModal() {
    ensureModal();
    updatePromptPreview("");
    var msg = document.getElementById("formulario-modal-msg");
    if (msg) {
      msg.hidden = true;
      msg.textContent = "";
      msg.className = "modal-form__msg";
    }

    api("/api/formulario")
      .then(function (res) {
        if (res.ok && res.body && res.body.formulario) {
          fillForm(res.body.formulario);
          updatePromptPreview(res.body.promptCondensado);
        } else {
          fillForm({});
          updatePromptPreview("");
        }
      })
      .catch(function () {
        fillForm({});
        updatePromptPreview("");
      })
      .then(function () {
        if (modalEl) {
          modalEl.hidden = false;
          document.body.style.overflow = "hidden";
          var first = modalEl.querySelector(
            "input, textarea, select, button:not(.modal__close)"
          );
          if (first) first.focus();
        }
      });
  }

  function closeModal() {
    if (modalEl) {
      modalEl.hidden = true;
      document.body.style.overflow = "";
    }
  }

  function onSubmitForm(e) {
    e.preventDefault();
    var msg = document.getElementById("formulario-modal-msg");
    var submitBtn = e.target.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    api("/api/formulario", {
      method: "PUT",
      body: JSON.stringify(collectForm()),
    })
      .then(function (res) {
        if (msg) {
          msg.hidden = false;
          if (res.ok) {
            msg.textContent =
              "Formulário e prompt condensado salvos. Você pode editar e salvar de novo quando quiser.";
            msg.className = "modal-form__msg modal-form__msg--ok";
            if (res.body && res.body.promptCondensado) {
              updatePromptPreview(res.body.promptCondensado);
            }
          } else {
            msg.textContent =
              (res.body && res.body.error) || "Não foi possível salvar.";
            msg.className = "modal-form__msg modal-form__msg--err";
          }
        }
      })
      .catch(function () {
        if (msg) {
          msg.hidden = false;
          msg.textContent = "Erro de conexão. Tente de novo.";
          msg.className = "modal-form__msg modal-form__msg--err";
        }
      })
      .then(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  window.initFormulario = function () {
    if (
      typeof Auth === "undefined" ||
      !Auth.getSession ||
      !Auth.getSession()
    ) {
      return;
    }

    var entry = document.getElementById("formulario-entry");
    var comeceStep = document.getElementById("comece-formulario-entry");
    if (entry) entry.hidden = false;
    if (comeceStep) comeceStep.hidden = false;

    ensureModal();

    document.querySelectorAll(".js-open-formulario").forEach(function (btn) {
      btn.addEventListener("click", openModal);
    });
  };
})();
