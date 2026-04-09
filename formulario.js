let modalEl = null;

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

function ensureModal() {
  if (document.getElementById("formulario-modal")) {
    modalEl = document.getElementById("formulario-modal");
    return;
  }

  const wrap = document.createElement("div");
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
    '</div>' +
    '<div class="modal-form__field">' +
    '<label for="f-sono">Sono em média</label>' +
    '<select id="f-sono" name="horas_sono">' +
    '<option value="">Selecione</option>' +
    '<option value="Menos de 5 horas">Menos de 5 horas</option>' +
    '<option value="Entre 5 e 7 horas">Entre 5 e 7 horas</option>' +
    '<option value="Entre 7 e 9 horas">Entre 7 e 9 horas</option>' +
    '<option value="Mais de 9 horas">Mais de 9 horas</option>' +
    '</select>' +
    '</div>' +
    '<div class="modal-form__field">' +
    '<label for="f-trabalho">Carga de trabalho ou responsabilidades no dia a dia</label>' +
    '<select id="f-trabalho" name="carga_trabalho">' +
    '<option value="">Selecione</option>' +
    '<option value="Leve">Leve</option>' +
    '<option value="Moderada">Moderada</option>' +
    '<option value="Pesada">Pesada</option>' +
    '<option value="Muito pesada">Muito pesada</option>' +
    '</select>' +
    '</div>' +
    '<div class="modal-form__field">' +
    '<label for="f-melhorar">O que você mais quer melhorar agora?</label>' +
    '<textarea id="f-melhorar" name="foco_melhorar" rows="3" maxlength="8000"></textarea>' +
    '</div>' +
    '<div class="modal-form__field">' +
    '<label for="f-mente">Cuidados com a saúde mental (humor, ansiedade, descanso mental)</label>' +
    '<textarea id="f-mente" name="cuidados_mente" rows="3" maxlength="8000"></textarea>' +
    '</div>' +
    '<div class="modal-form__field">' +
    '<label for="f-obs">Observações ou algo mais que queira contar</label>' +
    '<textarea id="f-obs" name="observacoes" rows="3" maxlength="8000"></textarea>' +
    '</div>' +
    '<div id="formulario-prompt-wrap" class="modal-prompt-wrap" role="region" aria-label="Prompt condensado">' +
    '<div class="modal-prompt-header">' +
    '<h3 class="modal-prompt-title">Prompt condensado</h3>' +
    '<button type="button" class="btn-copy" id="btn-copy-prompt" title="Copiar prompt">' +
    '<i class="fas fa-copy"></i> Copiar' +
    '</button>' +
    '</div>' +
    '<p class="modal-prompt-hint">Somente leitura. Aparece aqui ao salvar o formulário.</p>' +
    '<div class="modal-prompt-readonly">' +
    '<pre id="formulario-prompt-text" class="modal-prompt-text modal-prompt-text--placeholder" contenteditable="false" aria-label="Prompt condensado, somente leitura"></pre>' +
    '</div>' +
    '</div>' +
    '<p id="formulario-modal-msg" class="modal-form__msg" role="status" hidden></p>' +
    '<div class="modal-form__actions">' +
    '<button type="button" class="btn btn-ghost" data-close-modal>Cancelar</button>' +
    '<button type="submit" class="btn btn-primary">Salvar formulário</button>' +
    '</div>' +
    '</form>' +
    '</div>';

  document.body.appendChild(wrap);
  modalEl = wrap;

  wrap.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  const form = document.getElementById("formulario-form");
  if (form) {
    form.addEventListener("submit", onSubmitForm);
  }

  // Copy button functionality
  const copyBtn = document.getElementById("btn-copy-prompt");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const pre = document.getElementById("formulario-prompt-text");
      if (pre && pre.textContent && !pre.classList.contains("modal-prompt-text--placeholder")) {
        try {
          await navigator.clipboard.writeText(pre.textContent);
          // Visual feedback
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
          copyBtn.classList.add("btn-copy--success");
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove("btn-copy--success");
          }, 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
          showMsg("Erro ao copiar. Tente selecionar e copiar manualmente.");
        }
      } else {
        showMsg("Salve o formulário primeiro para gerar o prompt.");
      }
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modalEl && !modalEl.hidden) {
      closeModal();
    }
  });
}

const PLACEHOLDER_PROMPT = "Nenhum prompt salvo ainda. Preencha os campos acima e clique em Salvar formulário para gerar o prompt condensado.";

const routineOptions = {
  "relaxamento": "Relaxamento",
  "produtividade": "Produtividade",
  "bem-estar-fisico": "Bem-estar Físico",
  "sono-melhorado": "Sono Melhorado",
  "reducao-ansiedade": "Redução de Ansiedade",
  "autoconhecimento": "Autoconhecimento",
  "energia-vitalidade": "Energia e Vitalidade",
  "equilibrio-emocional": "Equilíbrio Emocional"
};

async function updatePromptPreview(text) {
  const wrap = document.getElementById("formulario-prompt-wrap");
  const pre = document.getElementById("formulario-prompt-text");
  if (!wrap || !pre) return;
  const s = text != null ? String(text).trim() : "";
  
  let routineFocusText = "";
  
  function displayPrompt() {
    if (s) {
      pre.textContent = s + routineFocusText;
      pre.classList.remove("modal-prompt-text--placeholder");
    } else {
      pre.textContent = PLACEHOLDER_PROMPT;
      pre.classList.add("modal-prompt-text--placeholder");
    }
  }
  
  try {
    const res = await api("/api/profile", { method: "GET" });
    if (res.ok && res.body?.profile?.routineFocus) {
      const routineFocus = res.body.profile.routineFocus;
      const routineLabel = routineOptions[routineFocus] || routineFocus;
      const allOptions = Object.values(routineOptions).join(", ");
      routineFocusText = "\n\nfoco da rotina: entre " + allOptions + ", escolhida: " + routineLabel;
    }
    displayPrompt();
  } catch (err) {
    console.error("Error fetching profile from server:", err);
    displayPrompt();
  }
}

function fillForm(data) {
  const form = document.getElementById("formulario-form");
  if (!form) return;
  const keys = [
    "rotina_diaria",
    "horas_sono",
    "carga_trabalho",
    "foco_melhorar",
    "cuidados_mente",
    "observacoes",
  ];
  keys.forEach(k => {
    const el = form.querySelector(`[name="${k}"]`);
    if (el) {
      el.value = data[k] != null ? String(data[k]) : "";
    }
  });
}

function collectForm() {
  const form = document.getElementById("formulario-form");
  if (!form) return {};
  const keys = [
    "rotina_diaria",
    "horas_sono",
    "carga_trabalho",
    "foco_melhorar",
    "cuidados_mente",
    "observacoes",
  ];
  const out = {};
  keys.forEach(k => {
    const el = form.querySelector(`[name="${k}"]`);
    out[k] = el ? el.value : "";
  });
  return out;
}

async function openModal() {
  ensureModal();
  updatePromptPreview("");
  const msg = document.getElementById("formulario-modal-msg");
  if (msg) {
    msg.hidden = true;
    msg.textContent = "";
    msg.className = "modal-form__msg";
  }

  try {
    const res = await api("/api/formulario");
    if (res.ok && res.body?.formulario) {
      fillForm(res.body.formulario);
      updatePromptPreview(res.body.promptCondensado);
    } else {
      fillForm({});
      updatePromptPreview("");
    }
  } catch {
    fillForm({});
    updatePromptPreview("");
  }

  if (modalEl) {
    modalEl.hidden = false;
    document.body.style.overflow = "hidden";
    const first = modalEl.querySelector(
      "input, textarea, select, button:not(.modal__close)"
    );
    if (first) first.focus();
  }
}

function closeModal() {
  if (modalEl) {
    modalEl.hidden = true;
    document.body.style.overflow = "";
  }
}

async function onSubmitForm(e) {
  e.preventDefault();
  const msg = document.getElementById("formulario-modal-msg");
  const submitBtn = e.target.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await api("/api/formulario", {
      method: "PUT",
      body: JSON.stringify(collectForm()),
    });
    if (msg) {
      msg.hidden = false;
      if (res.ok) {
        msg.textContent = "Formulário e prompt condensado salvos. Você pode editar e salvar de novo quando quiser.";
        msg.className = "modal-form__msg modal-form__msg--ok";
        if (res.body?.promptCondensado) {
          updatePromptPreview(res.body.promptCondensado);
        }
      } else {
        msg.textContent = res.body?.error || "Não foi possível salvar.";
        msg.className = "modal-form__msg modal-form__msg--err";
      }
    }
  } catch {
    if (msg) {
      msg.hidden = false;
      msg.textContent = "Erro de conexão. Tente de novo.";
      msg.className = "modal-form__msg modal-form__msg--err";
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function showMsg(text) {
  const msg = document.getElementById("formulario-modal-msg");
  if (msg) {
    msg.textContent = text;
    msg.hidden = false;
    msg.className = "modal-form__msg modal-form__msg--err";
  }
}

window.initFormulario = () => {
  if (typeof Auth === "undefined" || !Auth.getSession?.()) {
    return;
  }

  const entry = document.getElementById("formulario-entry");
  const comeceStep = document.getElementById("comece-formulario-entry");
  if (entry) entry.hidden = false;
  if (comeceStep) comeceStep.hidden = false;

  ensureModal();

  document.querySelectorAll(".js-open-formulario").forEach(btn => {
    btn.addEventListener("click", openModal);
  });
};
