// Minha Rotina - Dynamic Routine Generation
(function() {
  // Activity database organized by time of day
  const activitiesDB = {
    manha: [
      // Light activities for low energy
      { id: 'm1', title: 'Alongamento suave', duration: '5 min', type: 'movimento', energy: 'low', icon: 'fa-child', description: 'Estique os braços e pernas ainda na cama, respire fundo.' },
      { id: 'm2', title: 'Hidratação matinal', duration: '2 min', type: 'saude', energy: 'low', icon: 'fa-glass-water', description: 'Beba um copo de água para acordar seu corpo suavemente.' },
      { id: 'm3', title: 'Respiro consciente', duration: '3 min', type: 'mental', energy: 'low', icon: 'fa-wind', description: '3 respirações profundas, inspirando por 4 segundos e expirando por 6.' },
      { id: 'm4', title: 'Café da manhã tranquilo', duration: '15 min', type: 'saude', energy: 'low', icon: 'fa-mug-hot', description: 'Coma sem pressa, saboreando cada pedacinho.' },
      { id: 'm5', title: 'Pausa para café', duration: '10 min', type: 'pausa', energy: 'low', icon: 'fa-coffee', description: 'Um momento de calma antes de começar o dia.' },
      // Medium activities for moderate energy
      { id: 'm6', title: 'Caminhada leve', duration: '15 min', type: 'movimento', energy: 'medium', icon: 'fa-walking', description: 'Uma volta no quarteirão ou subida e descida de escadas.' },
      { id: 'm7', title: 'Yoga matinal', duration: '10 min', type: 'movimento', energy: 'medium', icon: 'fa-spa', description: 'Posturas simples para despertar o corpo com gentileza.' },
      { id: 'm8', title: 'Meditação guiada', duration: '10 min', type: 'mental', energy: 'medium', icon: 'fa-om', description: 'Momento de silêncio para começar o dia com clareza.' },
      { id: 'm9', title: 'Preparação organizada', duration: '10 min', type: 'disciplina', energy: 'medium', icon: 'fa-clipboard-check', description: 'Organize o que precisa ser feito hoje, sem pressa.' },
      // Higher energy activities
      { id: 'm10', title: 'Exercício rápido', duration: '20 min', type: 'movimento', energy: 'high', icon: 'fa-running', description: 'Polichinelos, agachamentos leves, flexões na parede.' },
    ],
    tarde: [
      // Light activities
      { id: 't1', title: 'Pausa para água', duration: '2 min', type: 'saude', energy: 'low', icon: 'fa-glass-water', description: 'Mais um copo de água. Seu corpo agradece!' },
      { id: 't2', title: 'Respiro no trabalho', duration: '3 min', type: 'mental', energy: 'low', icon: 'fa-wind', description: 'Afaste-se da tela, respire fundo 3 vezes.' },
      { id: 't3', title: 'Pausa para o lanche', duration: '10 min', type: 'saude', energy: 'low', icon: 'fa-apple-alt', description: 'Fruta, castanhas ou algo leve para manter a energia.' },
      { id: 't4', title: 'Alongamento na cadeira', duration: '5 min', type: 'movimento', energy: 'low', icon: 'fa-chair', description: 'Rode os ombros, puxe o pescoço suavemente.' },
      { id: 't5', title: 'Pausa visual', duration: '5 min', type: 'saude', energy: 'low', icon: 'fa-eye', description: 'Olhe para longe, feche os olhos por alguns segundos.' },
      // Medium activities
      { id: 't6', title: 'Caminhada no almoço', duration: '15 min', type: 'movimento', energy: 'medium', icon: 'fa-walking', description: 'Dê uma volta após o almoço, mesmo que curta.' },
      { id: 't7', title: 'Meditação de meio-dia', duration: '10 min', type: 'mental', energy: 'medium', icon: 'fa-om', description: 'Recarregue suas energias com um momento de calma.' },
      { id: 't8', title: 'Organização da tarde', duration: '5 min', type: 'disciplina', energy: 'medium', icon: 'fa-tasks', description: 'Revise o que falta e organize a prioridade.' },
      { id: 't9', title: 'Lanche saudável', duration: '10 min', type: 'saude', energy: 'medium', icon: 'fa-carrot', description: 'Refeição equilibrada para manter o foco.' },
      // High energy
      { id: 't10', title: 'Exercício ao ar livre', duration: '20 min', type: 'movimento', energy: 'high', icon: 'fa-bicycle', description: 'Se o tempo permitir, aproveite para se mover mais.' },
    ],
    noite: [
      // Light activities - sleep preparation
      { id: 'n1', title: 'Redução de telas', duration: 'Ongoing', type: 'sono', energy: 'low', icon: 'fa-mobile-alt', description: 'Tente diminuir o celular 1h antes de dormir.' },
      { id: 'n2', title: 'Jantar leve', duration: '30 min', type: 'saude', energy: 'low', icon: 'fa-utensils', description: 'Comida leve e sem pressa para ajudar o sono.' },
      { id: 'n3', title: 'Chá relaxante', duration: '10 min', type: 'saude', energy: 'low', icon: 'fa-mug-hot', description: 'Camomila ou cidreira para acalmar.' },
      { id: 'n4', title: 'Leitura tranquila', duration: '15 min', type: 'mental', energy: 'low', icon: 'fa-book', description: 'Algo leve e agradável para acalmar a mente.' },
      { id: 'n5', title: 'Respiração para sono', duration: '5 min', type: 'sono', energy: 'low', icon: 'fa-wind', description: 'Respire profundamente e solte o dia.' },
      { id: 'n6', title: 'Banho morno', duration: '15 min', type: 'saude', energy: 'low', icon: 'fa-shower', description: 'Água morna ajuda o corpo a relaxar.' },
      { id: 'n7', title: 'Alongamento noturno', duration: '5 min', type: 'movimento', energy: 'low', icon: 'fa-bed', description: 'Alongue suavemente antes de deitar.' },
      { id: 'n8', title: 'Preparação para dormir', duration: '10 min', type: 'sono', energy: 'low', icon: 'fa-moon', description: 'Organize o ambiente: escuro, fresco e silencioso.' },
      // Mental wellness
      { id: 'n9', title: 'Gratidão diária', duration: '3 min', type: 'mental', energy: 'low', icon: 'fa-heart', description: 'Pense em 3 coisas boas do seu dia.' },
      { id: 'n10', title: 'Journaling leve', duration: '10 min', type: 'mental', energy: 'medium', icon: 'fa-pen', description: 'Escreva o que sentiu hoje, sem julgamentos.' },
    ]
  };

  // Routine descriptions by objective
  const objectiveDescriptions = {
    'relaxamento': 'Uma rotina suave e acolhedora, pensada para trazer mais calma e tranquilidade ao seu dia.',
    'produtividade': 'Uma rotina equilibrada que combina foco e pausas, para você render sem se esgotar.',
    'bem-estar-fisico': 'Uma rotina com movimentos leves e cuidados com o corpo, respeitando seu ritmo.',
    'sono-melhorado': 'Uma rotina focada em preparar seu corpo e mente para uma noite de descanso.',
    'reducao-ansiedade': 'Uma rotina com práticas de respiração e grounding para momentos de acalmação.',
    'autoconhecimento': 'Uma rotina com momentos de reflexão e conexão consigo mesmo.',
    'energia-vitalidade': 'Uma rotina gradual para despertar sua energia ao longo do dia.',
    'equilibrio-emocional': 'Uma rotina harmoniosa, equilibrando atividade e descanso emocional.'
  };

  // General tips
  const generalTips = [
    'Lembre-se: pequenas ações consistentes criam grandes mudanças.',
    'Não há pressa. Faça no seu ritmo e do jeito que funciona para você.',
    'Se um dia não der certo, está tudo bem. Amanhã é uma nova oportunidade.',
    'Hidratação é essencial. Mantenha sua garrafa sempre por perto.',
    'Pausas são produtivas. Seu cérebro precisa descansar para render mais.',
    'Qualidade do sono é fundamental. Priorize seu descanso noturno.',
    'Movimento é vida, mas pode ser leve e prazeroso.',
    'Cuidar de você não é luxo, é necessidade.',
    'Celebre as pequenas conquistas do dia.',
    'Seu bem-estar é uma jornada, não uma corrida.'
  ];

  // DOM Elements
  const loadingEl = document.getElementById('rotina-loading');
  const emptyEl = document.getElementById('rotina-empty');
  const contentEl = document.getElementById('rotina-content');
  const manhaCardsEl = document.getElementById('manha-cards');
  const tardeCardsEl = document.getElementById('tarde-cards');
  const noiteCardsEl = document.getElementById('noite-cards');
  const descriptionEl = document.getElementById('rotina-description');
  const tipsEl = document.getElementById('rotina-tips');
  const userNameEl = document.getElementById('user-name');
  const btnRegenerate = document.getElementById('btn-regenerate');

  // State
  let currentRoutine = null;
  let userProfile = null;
  let formData = null;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    
    if (btnRegenerate) {
      btnRegenerate.addEventListener('click', function() {
        generateNewRoutine();
      });
    }
  });

  // Load user data from server
  function loadUserData() {
    showLoading();
    
    Promise.all([
      fetchProfile(),
      fetchFormulario()
    ]).then(function(results) {
      const [profileResult, formularioResult] = results;
      
      if (profileResult.ok) {
        userProfile = profileResult.body.profile || {};
      }
      
      if (formularioResult.ok) {
        formData = formularioResult.body.formulario || null;
      }
      
      if (formData && hasValidData(formData)) {
        generateRoutine();
        showContent();
      } else {
        showEmpty();
      }
    }).catch(function(err) {
      console.error('Error loading user data:', err);
      showEmpty();
    });
  }

  // Fetch profile from server
  function fetchProfile() {
    if (window.Auth && window.Auth.api) {
      return window.Auth.api('/api/profile', { method: 'GET' });
    }
    return Promise.resolve({ ok: false });
  }

  // Fetch form data from server
  function fetchFormulario() {
    if (window.Auth && window.Auth.api) {
      return window.Auth.api('/api/formulario', { method: 'GET' });
    }
    return Promise.resolve({ ok: false });
  }

  // Check if form data has valid content
  function hasValidData(form) {
    return form && (
      form.rotina_diaria ||
      form.horas_sono ||
      form.carga_trabalho ||
      form.foco_melhorar ||
      form.cuidados_mente
    );
  }

  // Show loading state
  function showLoading() {
    if (loadingEl) loadingEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = true;
  }

  // Show empty state
  function showEmpty() {
    if (loadingEl) loadingEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    if (contentEl) contentEl.hidden = true;
  }

  // Show content
  function showContent() {
    if (loadingEl) loadingEl.hidden = true;
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = false;
  }

  // Generate personalized routine
  function generateRoutine() {
    const routineFocus = userProfile && userProfile.routineFocus ? userProfile.routineFocus : 'relaxamento';
    const fullName = userProfile && userProfile.fullName ? userProfile.fullName : 'Visitante';
    
    // Update user name
    if (userNameEl) {
      userNameEl.textContent = fullName.split(' ')[0]; // First name only
    }
    
    // Update description based on objective
    if (descriptionEl) {
      descriptionEl.textContent = objectiveDescriptions[routineFocus] || objectiveDescriptions['relaxamento'];
    }
    
    // Determine energy level from form data
    const energyLevel = determineEnergyLevel();
    
    // Generate cards for each time period
    generateCardsForPeriod('manha', manhaCardsEl, energyLevel, routineFocus);
    generateCardsForPeriod('tarde', tardeCardsEl, energyLevel, routineFocus);
    generateCardsForPeriod('noite', noiteCardsEl, 'low', routineFocus); // Night is always low energy
    
    // Generate tips
    generateTips();
    
    currentRoutine = {
      focus: routineFocus,
      energy: energyLevel,
      generatedAt: new Date().toISOString()
    };
  }

  // Generate new routine with variations
  function generateNewRoutine() {
    showLoading();
    setTimeout(function() {
      generateRoutine();
      showContent();
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  }

  // Determine energy level from form data
  function determineEnergyLevel() {
    if (!formData) return 'low';
    
    const carga = formData.carga_trabalho || '';
    const horasSono = formData.horas_sono || '';
    
    // High work load or little sleep = low energy
    if (carga === 'Muito pesada' || horasSono === 'Menos de 5 horas') {
      return 'low';
    }
    
    if (carga === 'Pesada') {
      return 'low';
    }
    
    if (carga === 'Leve' && (horasSono === 'Entre 7 e 9 horas' || horasSono === 'Mais de 9 horas')) {
      return 'high';
    }
    
    return 'medium';
  }

  // Generate cards for a specific period
  function generateCardsForPeriod(period, container, energyLevel, focus) {
    if (!container) return;
    
    // Get activities for this period
    const activities = activitiesDB[period] || [];
    
    // Filter by energy level (allow one level up for variety)
    const allowedEnergies = [energyLevel];
    if (energyLevel === 'medium') allowedEnergies.push('low');
    if (energyLevel === 'high') allowedEnergies.push('medium');
    
    // Filter activities
    let filtered = activities.filter(function(a) {
      return allowedEnergies.indexOf(a.energy) !== -1;
    });
    
    // Prioritize by type based on focus
    const priorityTypes = getPriorityTypes(focus);
    filtered.sort(function(a, b) {
      const aPriority = priorityTypes.indexOf(a.type);
      const bPriority = priorityTypes.indexOf(b.type);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return Math.random() - 0.5; // Randomize same priority
    });
    
    // Select 3-4 activities
    const selected = filtered.slice(0, 3 + Math.floor(Math.random() * 2));
    
    // Shuffle for variety
    selected.sort(function() { return Math.random() - 0.5; });
    
    // Render
    container.innerHTML = selected.map(function(activity) {
      return createCardHTML(activity);
    }).join('');
  }

  // Get priority activity types based on focus
  function getPriorityTypes(focus) {
    const typeMap = {
      'relaxamento': ['mental', 'pausa', 'saude', 'movimento', 'sono', 'disciplina'],
      'produtividade': ['disciplina', 'mental', 'pausa', 'saude', 'movimento', 'sono'],
      'bem-estar-fisico': ['movimento', 'saude', 'sono', 'mental', 'pausa', 'disciplina'],
      'sono-melhorado': ['sono', 'saude', 'mental', 'movimento', 'pausa', 'disciplina'],
      'reducao-ansiedade': ['mental', 'pausa', 'saude', 'sono', 'movimento', 'disciplina'],
      'autoconhecimento': ['mental', 'pausa', 'saude', 'movimento', 'sono', 'disciplina'],
      'energia-vitalidade': ['movimento', 'saude', 'mental', 'pausa', 'sono', 'disciplina'],
      'equilibrio-emocional': ['mental', 'saude', 'movimento', 'pausa', 'sono', 'disciplina']
    };
    return typeMap[focus] || typeMap['relaxamento'];
  }

  // Create card HTML
  function createCardHTML(activity) {
    return '<div class="rotina-card" data-activity-id="' + activity.id + '">' +
      '<div class="rotina-card__icon">' +
        '<i class="fas ' + activity.icon + '"></i>' +
      '</div>' +
      '<div class="rotina-card__content">' +
        '<h4 class="rotina-card__title">' + activity.title + '</h4>' +
        '<span class="rotina-card__duration">' + activity.duration + '</span>' +
        '<p class="rotina-card__description">' + activity.description + '</p>' +
      '</div>' +
    '</div>';
  }

  // Generate tips
  function generateTips() {
    if (!tipsEl) return;
    
    // Select 3 random tips
    const shuffled = generalTips.slice().sort(function() { return Math.random() - 0.5; });
    const selected = shuffled.slice(0, 3);
    
    tipsEl.innerHTML = selected.map(function(tip) {
      return '<div class="rotina-tip">' +
        '<i class="fas fa-check-circle"></i>' +
        '<span>' + tip + '</span>' +
      '</div>';
    }).join('');
  }

})();
